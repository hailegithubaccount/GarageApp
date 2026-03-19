const Garage = require('../models/Garage');
const GarageService = require('../models/GarageService');
const User = require('../models/User');
const { haversineDistance } = require('../utils/haversine');
const { getDistancesAndDurations } = require('../services/googleMapsService');
const { createAuditLog } = require('../utils/auditLogger');
const { GARAGE_STATUS, ROLES } = require('../config/constants');

/**
 * @desc    Register a new garage
 * @route   POST /api/garages
 * @access  Admin
 */
exports.createGarage = async (req, res, next) => {
    try {
        const {
            garageName,
            location,
            latitude,
            longitude,
            contactNumber,
            description,
            operatingHours,
        } = req.body;

        /* Removed: Check if admin already has a garage to allow multiple garages */

        // Process images if any
        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => file.filename);
        }

        const garage = await Garage.create({
            garageName,
            location,
            latitude: latitude ? parseFloat(latitude) : undefined,
            longitude: longitude ? parseFloat(longitude) : undefined,
            contactNumber,
            description,
            operatingHours,
            images, // Add the images here
            admin: req.user._id,
            status: GARAGE_STATUS.PENDING, // Requires super admin approval
        });

        // Link garage to admin user
        await User.findByIdAndUpdate(req.user._id, { garage: garage._id });

        await createAuditLog({
            userId: req.user._id,
            action: 'GARAGE_CREATED',
            entityType: 'Garage',
            entityId: garage._id,
            details: `Garage "${garageName}" registered`,
            ipAddress: req.ip,
        });

        res.status(201).json({
            success: true,
            message: 'Garage registered successfully. Awaiting approval.',
            data: garage,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all garages (with optional filters)
 * @route   GET /api/garages
 * @access  Public
 */
exports.getGarages = async (req, res, next) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;
        const query = {};

        // By default only show active garages to public
        if (status) {
            query.status = status;
        } else {
            query.status = GARAGE_STATUS.ACTIVE;
        }

        if (search) {
            query.$or = [
                { garageName: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const garages = await Garage.find(query)
            .populate('admin', 'fullName email phoneNumber')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Garage.countDocuments(query);

        // Enrich each garage with its active service count and price range
        const garageIds = garages.map((g) => g._id);
        const serviceSummaries = await GarageService.aggregate([
            { $match: { garage: { $in: garageIds }, isActive: true } },
            {
                $group: {
                    _id: '$garage',
                    serviceCount: { $sum: 1 },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                },
            },
        ]);

        const summaryMap = {};
        serviceSummaries.forEach((s) => {
            summaryMap[s._id.toString()] = {
                serviceCount: s.serviceCount,
                minPrice: s.minPrice,
                maxPrice: s.maxPrice,
            };
        });

        const enrichedGarages = garages.map((g) => {
            const obj = g.toObject();
            const summary = summaryMap[g._id.toString()] || {
                serviceCount: 0,
                minPrice: 0,
                maxPrice: 0,
            };
            return { ...obj, ...summary };
        });

        res.status(200).json({
            success: true,
            count: garages.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            data: enrichedGarages,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get nearby garages using GPS coordinates
 * @route   GET /api/garages/nearby?lat=&lng=&radius=
 * @access  Customer
 */
exports.getNearbyGarages = async (req, res, next) => {
    try {
        const { lat, lng, radius = 10 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Please provide latitude and longitude',
            });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const maxRadius = parseFloat(radius); // in km

        // Get all active garages with coordinates
        const garages = await Garage.find({
            status: GARAGE_STATUS.ACTIVE,
            latitude: { $ne: null },
            longitude: { $ne: null },
        }).populate('admin', 'fullName phoneNumber');

        // Calculate distance and filter (Initial Haversine Filter for performance)
        const filteredGarages = garages
            .map((garage) => {
                const distance = haversineDistance(
                    userLat,
                    userLng,
                    garage.latitude,
                    garage.longitude
                );
                return {
                    ...garage.toObject(),
                    distance: Math.round(distance * 10) / 10, // round to 1 decimal
                };
            })
            .filter((g) => g.distance <= maxRadius)
            .sort((a, b) => a.distance - b.distance);

        // Step 2: Get high-precision road distance from Google Maps for the nearby results
        let nearbyGarages = filteredGarages;
        if (filteredGarages.length > 0) {
            const googleResults = await getDistancesAndDurations(
                { lat: userLat, lng: userLng },
                filteredGarages
            );

            if (googleResults) {
                nearbyGarages = googleResults;
            }
        }

        res.status(200).json({
            success: true,
            count: nearbyGarages.length,
            data: nearbyGarages,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single garage details
 * @route   GET /api/garages/:id
 * @access  Public
 */
exports.getGarage = async (req, res, next) => {
    try {
        const garage = await Garage.findById(req.params.id)
            .populate('admin', 'fullName email phoneNumber')
            .populate({
                path: 'services',
                match: { isActive: true },
                options: { sort: { category: 1, price: 1 } }
            });

        if (!garage) {
            return res.status(404).json({
                success: false,
                message: 'Garage not found',
            });
        }

        res.status(200).json({
            success: true,
            data: garage,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update garage info
 * @route   PUT /api/garages/:id
 * @access  Admin (owner)
 */
exports.updateGarage = async (req, res, next) => {
    try {
        const garage = await Garage.findById(req.params.id);

        if (!garage) {
            return res.status(404).json({
                success: false,
                message: 'Garage not found',
            });
        }

        // Check ownership or super admin
        if (garage.admin.toString() !== req.user._id.toString() && req.user.role !== ROLES.SUPER_ADMIN) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this garage',
            });
        }

        const updatedGarage = await Garage.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Garage updated successfully',
            data: updatedGarage,
        });
    } catch (error) {
        next(error);
    }
};

// ======================== GARAGE SERVICES ========================

/**
 * @desc    Get services for a garage
 * @route   GET /api/garages/:id/services
 * @access  Public
 */
exports.getGarageServices = async (req, res, next) => {
    try {
        const { category } = req.query;
        const query = { garage: req.params.id, isActive: true };
        if (category) query.category = category;

        const services = await GarageService.find(query);

        res.status(200).json({
            success: true,
            count: services.length,
            data: services,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add a service to a garage
 * @route   POST /api/garages/:id/services
 * @access  Admin (owner)
 */
exports.addGarageService = async (req, res, next) => {
    try {
        const garage = await Garage.findById(req.params.id);

        if (!garage) {
            return res.status(404).json({ success: false, message: 'Garage not found' });
        }

        if (garage.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }

        const service = await GarageService.create({
            garage: garage._id,
            ...req.body,
        });

        res.status(201).json({
            success: true,
            message: 'Service added successfully',
            data: service,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a garage service
 * @route   PUT /api/garages/:id/services/:serviceId
 * @access  Admin (owner)
 */
exports.updateGarageService = async (req, res, next) => {
    try {
        const garage = await Garage.findById(req.params.id);
        if (!garage || garage.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const service = await GarageService.findByIdAndUpdate(
            req.params.serviceId,
            req.body,
            { new: true, runValidators: true }
        );

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            data: service,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a garage service
 * @route   DELETE /api/garages/:id/services/:serviceId
 * @access  Admin (owner)
 */
exports.deleteGarageService = async (req, res, next) => {
    try {
        const garage = await Garage.findById(req.params.id);
        if (!garage || garage.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const service = await GarageService.findByIdAndDelete(req.params.serviceId);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Service deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get mechanics for a garage
 * @route   GET /api/garages/:id/mechanics
 * @access  Admin (owner)
 */
exports.getGarageMechanics = async (req, res, next) => {
    try {
        const garage = await Garage.findOne({ _id: req.params.id, admin: req.user._id });
        if (!garage) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const mechanics = await User.find({
            garage: req.params.id,
            role: ROLES.MECHANIC,
            status: 'active',
        }).select('fullName email phoneNumber profileImage status');

        res.status(200).json({
            success: true,
            count: mechanics.length,
            data: mechanics,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get garages owned by the logged-in admin
 * @route   GET /api/garages/my-garages
 * @access  Admin
 */
exports.getMyGarages = async (req, res, next) => {
    try {
        const garages = await Garage.find({ admin: req.user._id })
            .populate('admin', 'fullName email phoneNumber')
            .populate('services')
            .sort({ createdAt: -1 });
            
        res.status(200).json({
            success: true,
            count: garages.length,
            data: garages,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Upload images for an existing garage
 * @route   POST /api/garages/:id/upload-images
 * @access  Admin (owner)
 */
exports.uploadGarageImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'Please upload files' });
        }

        const garage = await Garage.findById(req.params.id);
        if (!garage) {
            return res.status(404).json({ success: false, message: 'Garage not found' });
        }

        if (garage.admin.toString() !== req.user._id.toString() && req.user.role !== ROLES.SUPER_ADMIN) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const filenames = req.files.map(file => file.filename);
        
        // Append new images to existing ones
        garage.images = [...garage.images, ...filenames];
        await garage.save();

        res.status(200).json({
            success: true,
            message: 'Images uploaded successfully',
            data: garage.images,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Toggle garage status (Active/Suspended)
 * @route   PUT /api/garages/:id/status
 * @access  Admin (owner) or Super Admin
 */
exports.updateGarageStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const garage = await Garage.findById(req.params.id);

        if (!garage) {
            return res.status(404).json({ success: false, message: 'Garage not found' });
        }

        // Check authorization: Super Admin OR the Admin who owns the garage
        const isOwner = garage.admin.toString() === req.user._id.toString();
        const isSuperAdmin = req.user.role === ROLES.SUPER_ADMIN;

        if (!isSuperAdmin && !isOwner) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Admins cannot "approve" their own pending garages
        if (isOwner && !isSuperAdmin && garage.status === GARAGE_STATUS.PENDING) {
            return res.status(403).json({ 
                success: false, 
                message: 'You cannot approve your own garage. Please wait for super admin approval.' 
            });
        }

        garage.status = status;
        await garage.save();

        await createAuditLog({
            userId: req.user._id,
            action: 'GARAGE_STATUS_UPDATED',
            entityType: 'Garage',
            entityId: garage._id,
            details: `Status changed to ${status}`,
            ipAddress: req.ip,
        });

        res.status(200).json({
            success: true,
            message: `Garage ${status} successfully`,
            data: garage,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a garage image
 * @route   DELETE /api/garages/:id/images
 * @access  Admin (owner)
 */
exports.deleteGarageImage = async (req, res, next) => {
    try {
        const { imageUrl } = req.body;
        const garage = await Garage.findById(req.params.id);

        if (!garage) {
            return res.status(404).json({ success: false, message: 'Garage not found' });
        }

        // Check ownership
        if (garage.admin.toString() !== req.user._id.toString() && req.user.role !== ROLES.SUPER_ADMIN) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Remove image from array
        garage.images = garage.images.filter(img => img !== imageUrl);
        await garage.save();

        res.status(200).json({
            success: true,
            message: 'Image removed successfully',
            data: garage.images,
        });
    } catch (error) {
        next(error);
    }
};
