const ServiceRequest = require('../models/ServiceRequest');
const MechanicAssignment = require('../models/MechanicAssignment');
const Vehicle = require('../models/Vehicle');
const Garage = require('../models/Garage');
const GarageService = require('../models/GarageService');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');
const { createAuditLog } = require('../utils/auditLogger');
const {
    REQUEST_STATUS,
    ASSIGNMENT_STATUS,
    ROLES,
    MAX_ACTIVE_JOBS_PER_MECHANIC,
} = require('../config/constants');

/**
 * @desc    Create a service request (regular or emergency)
 * @route   POST /api/service-requests
 * @access  Customer
 */
exports.createServiceRequest = async (req, res, next) => {
    try {
        const {
            vehicleId,
            garageId,
            serviceId,
            serviceType,
            description,
            preferredDate,
            preferredTime,
            isEmergency,
            emergencyLatitude,
            emergencyLongitude,
        } = req.body;

        // Verify vehicle belongs to customer
        const vehicle = await Vehicle.findOne({
            _id: vehicleId,
            customer: req.user._id,
        });
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found or does not belong to you',
            });
        }

        // Verify garage exists and is active
        const garage = await Garage.findById(garageId);
        if (!garage || garage.status !== 'active') {
            return res.status(404).json({
                success: false,
                message: 'Garage not found or not active',
            });
        }

        // If a service is selected, validate it belongs to this garage and get its price
        let selectedService = null;
        let resolvedServiceType = serviceType;
        let resolvedTotalCost = 0;

        if (serviceId) {
            selectedService = await GarageService.findOne({
                _id: serviceId,
                garage: garageId,
                isActive: true,
            });
            if (!selectedService) {
                return res.status(400).json({
                    success: false,
                    message: 'Selected service not found or does not belong to this garage',
                });
            }
            // Auto-populate totalCost from the service price
            resolvedTotalCost = selectedService.price;
            // Auto-populate serviceType from service name if not provided
            if (!resolvedServiceType) {
                resolvedServiceType = selectedService.serviceName;
            }
        }

        const serviceRequest = await ServiceRequest.create({
            customer: req.user._id,
            vehicle: vehicleId,
            garage: garageId,
            service: serviceId || null,
            serviceType: resolvedServiceType,
            description,
            preferredDate,
            preferredTime,
            isEmergency: isEmergency || false,
            emergencyLatitude,
            emergencyLongitude,
            totalCost: resolvedTotalCost,
        });

        // Populate the response with full details
        const populatedRequest = await ServiceRequest.findById(serviceRequest._id)
            .populate('vehicle', 'plateNumber brand model year color')
            .populate('garage', 'garageName location contactNumber')
            .populate('service', 'serviceName price category estimatedDuration');

        // Notify the garage admin
        await createNotification({
            userId: garage.admin,
            title: isEmergency ? '🚨 Emergency Service Request' : 'New Service Request',
            message: `${req.user.fullName} has submitted a ${isEmergency ? 'emergency ' : ''}service request for vehicle ${vehicle.plateNumber}`,
            type: isEmergency ? 'emergency' : 'service_update',
            referenceId: serviceRequest._id,
            referenceType: 'ServiceRequest',
        });

        await createAuditLog({
            userId: req.user._id,
            action: 'SERVICE_REQUEST_CREATED',
            entityType: 'ServiceRequest',
            entityId: serviceRequest._id,
            details: `${isEmergency ? 'Emergency ' : ''}Service request for ${vehicle.plateNumber}`,
            ipAddress: req.ip,
        });

        res.status(201).json({
            success: true,
            message: 'Service request submitted successfully',
            data: populatedRequest,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get service requests (filtered by role)
 * @route   GET /api/service-requests
 * @access  Authenticated
 */
exports.getServiceRequests = async (req, res, next) => {
    try {
        const { status, isEmergency, page = 1, limit = 20 } = req.query;
        const query = {};

        // Filter based on role
        if (req.user.role === ROLES.CUSTOMER) {
            query.customer = req.user._id;
        } else if (req.user.role === ROLES.ADMIN) {
            const garage = await Garage.findOne({ admin: req.user._id });
            if (!garage) {
                return res.status(404).json({
                    success: false,
                    message: 'No garage found for this admin',
                });
            }
            query.garage = garage._id;
        } else if (req.user.role === ROLES.MECHANIC) {
            // Mechanics see only their assigned requests
            const assignments = await MechanicAssignment.find({
                mechanic: req.user._id,
            }).select('serviceRequest');
            const requestIds = assignments.map((a) => a.serviceRequest);
            query._id = { $in: requestIds };
        }

        if (status) query.status = status;
        if (isEmergency !== undefined) query.isEmergency = isEmergency === 'true';

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const requests = await ServiceRequest.find(query)
            .populate('customer', 'fullName email phoneNumber')
            .populate('vehicle', 'plateNumber brand model year')
            .populate('garage', 'garageName location')
            .populate('service', 'serviceName price category')
            .populate('assignedMechanic', 'fullName phoneNumber')
            .sort({ isEmergency: -1, createdAt: -1 }) // Emergency first
            .skip(skip)
            .limit(parseInt(limit));

        const total = await ServiceRequest.countDocuments(query);

        res.status(200).json({
            success: true,
            count: requests.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            data: requests,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single service request
 * @route   GET /api/service-requests/:id
 * @access  Authenticated
 */
exports.getServiceRequest = async (req, res, next) => {
    try {
        const request = await ServiceRequest.findById(req.params.id)
            .populate('customer', 'fullName email phoneNumber')
            .populate('vehicle')
            .populate('garage', 'garageName location contactNumber')
            .populate('service')
            .populate('assignedMechanic', 'fullName phoneNumber');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found',
            });
        }

        // Get mechanic assignment details if exists
        const assignment = await MechanicAssignment.findOne({
            serviceRequest: request._id,
        }).populate('mechanic', 'fullName phoneNumber');

        res.status(200).json({
            success: true,
            data: { ...request.toObject(), assignment },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Approve a service request
 * @route   PUT /api/service-requests/:id/approve
 * @access  Admin
 */
exports.approveRequest = async (req, res, next) => {
    try {
        const request = await ServiceRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found',
            });
        }

        if (request.status !== REQUEST_STATUS.PENDING) {
            return res.status(400).json({
                success: false,
                message: 'Only pending requests can be approved',
            });
        }

        // Verify admin owns this garage
        const garage = await Garage.findOne({ _id: request.garage, admin: req.user._id });
        if (!garage) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        request.status = REQUEST_STATUS.APPROVED;
        if (req.body.totalCost) request.totalCost = req.body.totalCost;
        await request.save();

        // Notify customer
        await createNotification({
            userId: request.customer,
            title: 'Service Request Approved',
            message: `Your service request for ${garage.garageName} has been approved.`,
            type: 'service_update',
            referenceId: request._id,
            referenceType: 'ServiceRequest',
        });

        await createAuditLog({
            userId: req.user._id,
            action: 'SERVICE_REQUEST_APPROVED',
            entityType: 'ServiceRequest',
            entityId: request._id,
            ipAddress: req.ip,
        });

        res.status(200).json({
            success: true,
            message: 'Service request approved',
            data: request,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reject a service request
 * @route   PUT /api/service-requests/:id/reject
 * @access  Admin
 */
exports.rejectRequest = async (req, res, next) => {
    try {
        const { rejectionReason } = req.body;
        const request = await ServiceRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found',
            });
        }

        if (request.status !== REQUEST_STATUS.PENDING) {
            return res.status(400).json({
                success: false,
                message: 'Only pending requests can be rejected',
            });
        }

        const garage = await Garage.findOne({ _id: request.garage, admin: req.user._id });
        if (!garage) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        request.status = REQUEST_STATUS.REJECTED;
        request.rejectionReason = rejectionReason;
        await request.save();

        // Notify customer
        await createNotification({
            userId: request.customer,
            title: 'Service Request Rejected',
            message: `Your service request was rejected. Reason: ${rejectionReason || 'Not specified'}`,
            type: 'service_update',
            referenceId: request._id,
            referenceType: 'ServiceRequest',
        });

        res.status(200).json({
            success: true,
            message: 'Service request rejected',
            data: request,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Assign a mechanic to a service request
 * @route   PUT /api/service-requests/:id/assign
 * @access  Admin
 */
exports.assignMechanic = async (req, res, next) => {
    try {
        const { mechanicId } = req.body;
        const request = await ServiceRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found',
            });
        }

        if (
            request.status !== REQUEST_STATUS.APPROVED &&
            request.status !== REQUEST_STATUS.IN_PROGRESS
        ) {
            return res.status(400).json({
                success: false,
                message: 'Only approved or in-progress requests can be assigned',
            });
        }

        // Verify admin owns this garage
        const garage = await Garage.findOne({ _id: request.garage, admin: req.user._id });
        if (!garage) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Verify mechanic exists and belongs to this garage
        const mechanic = await User.findOne({
            _id: mechanicId,
            role: ROLES.MECHANIC,
            garage: garage._id,
        });
        if (!mechanic) {
            return res.status(404).json({
                success: false,
                message: 'Mechanic not found or not assigned to this garage',
            });
        }

        // Check mechanic's active job count (max 5 per business rule BR03)
        const activeJobs = await MechanicAssignment.countDocuments({
            mechanic: mechanicId,
            status: { $in: [ASSIGNMENT_STATUS.ASSIGNED, ASSIGNMENT_STATUS.IN_PROGRESS] },
        });
        if (activeJobs >= MAX_ACTIVE_JOBS_PER_MECHANIC) {
            return res.status(400).json({
                success: false,
                message: `Mechanic already has ${MAX_ACTIVE_JOBS_PER_MECHANIC} active jobs. Cannot assign more.`,
            });
        }

        // Create assignment
        const assignment = await MechanicAssignment.create({
            serviceRequest: request._id,
            mechanic: mechanicId,
        });

        // Update request
        request.assignedMechanic = mechanicId;
        request.status = REQUEST_STATUS.IN_PROGRESS;
        await request.save();

        // Notify mechanic
        await createNotification({
            userId: mechanicId,
            title: 'New Job Assignment',
            message: `You have been assigned a new service job. Check your assigned jobs.`,
            type: 'assignment',
            referenceId: assignment._id,
            referenceType: 'MechanicAssignment',
        });

        // Notify customer
        await createNotification({
            userId: request.customer,
            title: 'Mechanic Assigned',
            message: `A mechanic has been assigned to your service request. Work is in progress.`,
            type: 'service_update',
            referenceId: request._id,
            referenceType: 'ServiceRequest',
        });

        await createAuditLog({
            userId: req.user._id,
            action: 'MECHANIC_ASSIGNED',
            entityType: 'MechanicAssignment',
            entityId: assignment._id,
            details: `Mechanic ${mechanic.fullName} assigned to request ${request._id}`,
            ipAddress: req.ip,
        });

        res.status(200).json({
            success: true,
            message: 'Mechanic assigned successfully',
            data: { request, assignment },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update service status (by mechanic)
 * @route   PUT /api/service-requests/:id/status
 * @access  Mechanic
 */
exports.updateStatus = async (req, res, next) => {
    try {
        const { status, notes } = req.body;

        const validStatuses = [
            REQUEST_STATUS.IN_PROGRESS,
            REQUEST_STATUS.WAITING_FOR_PARTS,
            REQUEST_STATUS.COMPLETED,
        ];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed: ${validStatuses.join(', ')}`,
            });
        }

        const assignment = await MechanicAssignment.findOne({
            serviceRequest: req.params.id,
            mechanic: req.user._id,
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'You are not assigned to this service request',
            });
        }

        // Update assignment
        assignment.status = status === REQUEST_STATUS.COMPLETED
            ? ASSIGNMENT_STATUS.COMPLETED
            : status === REQUEST_STATUS.WAITING_FOR_PARTS
                ? ASSIGNMENT_STATUS.WAITING_FOR_PARTS
                : ASSIGNMENT_STATUS.IN_PROGRESS;

        if (notes) assignment.notes = notes;
        if (status === REQUEST_STATUS.COMPLETED) {
            assignment.completionDate = new Date();
        }
        await assignment.save();

        // Update service request status
        const request = await ServiceRequest.findById(req.params.id);
        request.status = status;
        await request.save();

        // Notify customer
        await createNotification({
            userId: request.customer,
            title: 'Service Status Updated',
            message: `Your service status has been updated to: ${status.replace(/_/g, ' ')}`,
            type: 'service_update',
            referenceId: request._id,
            referenceType: 'ServiceRequest',
        });

        res.status(200).json({
            success: true,
            message: 'Service status updated',
            data: { request, assignment },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get customer service history
 * @route   GET /api/service-requests/history
 * @access  Customer
 */
exports.getServiceHistory = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const requests = await ServiceRequest.find({
            customer: req.user._id,
            status: REQUEST_STATUS.COMPLETED,
        })
            .populate('vehicle', 'plateNumber brand model')
            .populate('garage', 'garageName location')
            .populate('service', 'serviceName price')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await ServiceRequest.countDocuments({
            customer: req.user._id,
            status: REQUEST_STATUS.COMPLETED,
        });

        res.status(200).json({
            success: true,
            count: requests.length,
            total,
            data: requests,
        });
    } catch (error) {
        next(error);
    }
};
