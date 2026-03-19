const User = require('../models/User');
const Garage = require('../models/Garage');
const GarageService = require('../models/GarageService');
const ServiceRequest = require('../models/ServiceRequest');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');
const { createNotification } = require('../services/notificationService');
const { createAuditLog } = require('../utils/auditLogger');
const { GARAGE_STATUS, USER_STATUS, ROLES } = require('../config/constants');

// @desc    Get all garages (all statuses)
// @route   GET /api/admin/garages
exports.getAllGarages = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};
        if (status) query.status = status;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const garages = await Garage.find(query)
            .populate('admin', 'fullName email phoneNumber')
            .populate('services')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        const total = await Garage.countDocuments(query);
        res.status(200).json({ success: true, count: garages.length, total, data: garages });
    } catch (error) { next(error); }
};

// @desc    Approve a garage
// @route   PUT /api/admin/garages/:id/approve
exports.approveGarage = async (req, res, next) => {
    try {
        const garage = await Garage.findById(req.params.id);
        if (!garage) return res.status(404).json({ success: false, message: 'Garage not found' });

        garage.status = GARAGE_STATUS.ACTIVE;
        await garage.save();

        // Activate admin account
        await User.findByIdAndUpdate(garage.admin, { status: USER_STATUS.ACTIVE });

        await createNotification({ userId: garage.admin, title: 'Garage Approved', message: `Your garage "${garage.garageName}" has been approved and is now active.`, type: 'system' });
        await createAuditLog({ userId: req.user._id, action: 'GARAGE_APPROVED', entityType: 'Garage', entityId: garage._id, ipAddress: req.ip });

        res.status(200).json({ success: true, message: 'Garage approved', data: garage });
    } catch (error) { next(error); }
};

// @desc    Suspend a garage
// @route   PUT /api/admin/garages/:id/suspend
exports.suspendGarage = async (req, res, next) => {
    try {
        const garage = await Garage.findById(req.params.id);
        if (!garage) return res.status(404).json({ success: false, message: 'Garage not found' });

        garage.status = GARAGE_STATUS.SUSPENDED;
        await garage.save();

        await createNotification({ userId: garage.admin, title: 'Garage Suspended', message: `Your garage "${garage.garageName}" has been suspended. Contact support for details.`, type: 'system' });
        await createAuditLog({ userId: req.user._id, action: 'GARAGE_SUSPENDED', entityType: 'Garage', entityId: garage._id, ipAddress: req.ip });

        res.status(200).json({ success: true, message: 'Garage suspended', data: garage });
    } catch (error) { next(error); }
};

// @desc    Get all users
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
    try {
        const { role, status, search, page = 1, limit = 20 } = req.query;
        const query = {};
        if (role) query.role = role;
        if (status) query.status = status;
        if (search) query.$or = [{ fullName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
        const total = await User.countDocuments(query);
        res.status(200).json({ success: true, count: users.length, total, data: users });
    } catch (error) { next(error); }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
exports.updateUserStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        await createAuditLog({ userId: req.user._id, action: 'USER_STATUS_UPDATED', entityType: 'User', entityId: user._id, details: `Status changed to ${status}`, ipAddress: req.ip });
        res.status(200).json({ success: true, message: 'User status updated', data: user });
    } catch (error) { next(error); }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        await createAuditLog({ userId: req.user._id, action: 'USER_DELETED', entityType: 'User', entityId: req.params.id, details: `Deleted user ${user.fullName}`, ipAddress: req.ip });
        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) { next(error); }
};

// @desc    Get system analytics
// @route   GET /api/admin/analytics
exports.getAnalytics = async (req, res, next) => {
    try {
        const [totalUsers, totalGarages, activeGarages, totalRequests, completedRequests, totalRevenue, usersByRole] = await Promise.all([
            User.countDocuments(),
            Garage.countDocuments(),
            Garage.countDocuments({ status: GARAGE_STATUS.ACTIVE }),
            ServiceRequest.countDocuments(),
            ServiceRequest.countDocuments({ status: 'completed' }),
            Payment.aggregate([{ $match: { paymentStatus: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
            User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalUsers, totalGarages, activeGarages, totalRequests, completedRequests,
                totalRevenue: totalRevenue[0]?.total || 0,
                usersByRole: usersByRole.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {}),
            },
        });
    } catch (error) { next(error); }
};

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
exports.getAuditLogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const logs = await AuditLog.find().populate('user', 'fullName role').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
        const total = await AuditLog.countDocuments();
        res.status(200).json({ success: true, count: logs.length, total, data: logs });
    } catch (error) { next(error); }
};
