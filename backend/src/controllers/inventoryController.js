const Inventory = require('../models/Inventory');
const InventoryUsage = require('../models/InventoryUsage');
const Garage = require('../models/Garage');
const MechanicAssignment = require('../models/MechanicAssignment');
const { createNotification } = require('../services/notificationService');
const { ROLES } = require('../config/constants');

/**
 * @desc    Add inventory item
 * @route   POST /api/inventory
 * @access  Admin
 */
exports.addItem = async (req, res, next) => {
    try {
        const garage = await Garage.findOne({ admin: req.user._id });
        if (!garage) {
            return res.status(404).json({
                success: false,
                message: 'No garage found for this admin',
            });
        }

        const item = await Inventory.create({
            garage: garage._id,
            ...req.body,
        });

        res.status(201).json({
            success: true,
            message: 'Inventory item added',
            data: item,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all inventory for admin's garage
 * @route   GET /api/inventory
 * @access  Admin
 */
exports.getInventory = async (req, res, next) => {
    try {
        const garage = await Garage.findOne({ admin: req.user._id });
        if (!garage) {
            return res.status(404).json({
                success: false,
                message: 'No garage found for this admin',
            });
        }

        const { search } = req.query;
        const query = { garage: garage._id };
        if (search) {
            query.itemName = { $regex: search, $options: 'i' };
        }

        const items = await Inventory.find(query).sort({ itemName: 1 });

        res.status(200).json({
            success: true,
            count: items.length,
            data: items,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update inventory item
 * @route   PUT /api/inventory/:id
 * @access  Admin
 */
exports.updateItem = async (req, res, next) => {
    try {
        const garage = await Garage.findOne({ admin: req.user._id });
        if (!garage) {
            return res.status(404).json({
                success: false,
                message: 'No garage found',
            });
        }

        const item = await Inventory.findOneAndUpdate(
            { _id: req.params.id, garage: garage._id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Item updated',
            data: item,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete inventory item
 * @route   DELETE /api/inventory/:id
 * @access  Admin
 */
exports.deleteItem = async (req, res, next) => {
    try {
        const garage = await Garage.findOne({ admin: req.user._id });
        if (!garage) {
            return res.status(404).json({
                success: false,
                message: 'No garage found',
            });
        }

        const item = await Inventory.findOneAndDelete({
            _id: req.params.id,
            garage: garage._id,
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Item deleted',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Log spare parts usage for an assignment (mechanic)
 * @route   POST /api/inventory/usage
 * @access  Mechanic
 */
exports.logUsage = async (req, res, next) => {
    try {
        const { assignmentId, itemId, quantityUsed } = req.body;

        // Verify mechanic owns the assignment
        const assignment = await MechanicAssignment.findOne({
            _id: assignmentId,
            mechanic: req.user._id,
        });
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found or not yours',
            });
        }

        // Verify item exists and has enough stock
        const item = await Inventory.findById(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found',
            });
        }
        if (item.quantity < quantityUsed) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Available: ${item.quantity}`,
            });
        }

        // Deduct stock
        item.quantity -= quantityUsed;
        await item.save();

        // Create usage record
        const usage = await InventoryUsage.create({
            assignment: assignmentId,
            item: itemId,
            quantityUsed,
        });

        // Check low stock and notify admin
        if (item.quantity <= item.minimumStock) {
            const garage = await Garage.findById(item.garage);
            await createNotification({
                userId: garage.admin,
                title: '⚠️ Low Stock Alert',
                message: `"${item.itemName}" is running low (${item.quantity} remaining). Please restock.`,
                type: 'inventory_alert',
                referenceId: item._id,
                referenceType: 'Inventory',
            });
        }

        res.status(201).json({
            success: true,
            message: 'Usage logged successfully',
            data: usage,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get low stock items
 * @route   GET /api/inventory/low-stock
 * @access  Admin
 */
exports.getLowStock = async (req, res, next) => {
    try {
        const garage = await Garage.findOne({ admin: req.user._id });
        if (!garage) {
            return res.status(404).json({
                success: false,
                message: 'No garage found',
            });
        }

        const lowStockItems = await Inventory.find({
            garage: garage._id,
            $expr: { $lte: ['$quantity', '$minimumStock'] },
        });

        res.status(200).json({
            success: true,
            count: lowStockItems.length,
            data: lowStockItems,
        });
    } catch (error) {
        next(error);
    }
};
