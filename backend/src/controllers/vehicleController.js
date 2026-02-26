const Vehicle = require('../models/Vehicle');

/**
 * @desc    Add a vehicle
 * @route   POST /api/vehicles
 * @access  Customer
 */
exports.addVehicle = async (req, res, next) => {
    try {
        const { plateNumber, vehicleType, brand, model, year, color } = req.body;

        const vehicle = await Vehicle.create({
            customer: req.user._id,
            plateNumber,
            vehicleType,
            brand,
            model,
            year,
            color,
        });

        res.status(201).json({
            success: true,
            message: 'Vehicle added successfully',
            data: vehicle,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all vehicles for the logged-in customer
 * @route   GET /api/vehicles
 * @access  Customer
 */
exports.getMyVehicles = async (req, res, next) => {
    try {
        const vehicles = await Vehicle.find({ customer: req.user._id }).sort({
            createdAt: -1,
        });

        res.status(200).json({
            success: true,
            count: vehicles.length,
            data: vehicles,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single vehicle
 * @route   GET /api/vehicles/:id
 * @access  Customer
 */
exports.getVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findOne({
            _id: req.params.id,
            customer: req.user._id,
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found',
            });
        }

        res.status(200).json({
            success: true,
            data: vehicle,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update vehicle
 * @route   PUT /api/vehicles/:id
 * @access  Customer
 */
exports.updateVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findOneAndUpdate(
            { _id: req.params.id, customer: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Vehicle updated successfully',
            data: vehicle,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete vehicle
 * @route   DELETE /api/vehicles/:id
 * @access  Customer
 */
exports.deleteVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findOneAndDelete({
            _id: req.params.id,
            customer: req.user._id,
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Vehicle deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
