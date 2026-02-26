const mongoose = require('mongoose');
const { NOTIFICATION_TYPES } = require('../config/constants');

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: NOTIFICATION_TYPES,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        // Optional reference to related entity
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        referenceType: {
            type: String,
            enum: ['ServiceRequest', 'Payment', 'MechanicAssignment', 'Inventory'],
        },
    },
    {
        timestamps: true,
    }
);

notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
