const Notification = require('../models/Notification');

/**
 * Create an in-app notification
 */
const createNotification = async ({
    userId,
    title,
    message,
    type,
    referenceId,
    referenceType,
}) => {
    try {
        const notification = await Notification.create({
            user: userId,
            title,
            message,
            type,
            referenceId,
            referenceType,
        });
        return notification;
    } catch (error) {
        console.error('Failed to create notification:', error.message);
    }
};

/**
 * Send notification to multiple users
 */
const createBulkNotifications = async (userIds, { title, message, type, referenceId, referenceType }) => {
    try {
        const notifications = userIds.map((userId) => ({
            user: userId,
            title,
            message,
            type,
            referenceId,
            referenceType,
        }));
        await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Failed to create bulk notifications:', error.message);
    }
};

module.exports = { createNotification, createBulkNotifications };
