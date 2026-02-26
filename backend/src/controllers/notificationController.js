const Notification = require('../models/Notification');

// @desc    Get notifications for current user
// @route   GET /api/notifications
exports.getNotifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 30 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
        const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
        const total = await Notification.countDocuments({ user: req.user._id });
        res.status(200).json({ success: true, count: notifications.length, total, unreadCount, data: notifications });
    } catch (error) { next(error); }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id }, { isRead: true }, { new: true }
        );
        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
        res.status(200).json({ success: true, data: notification });
    } catch (error) { next(error); }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) { next(error); }
};
