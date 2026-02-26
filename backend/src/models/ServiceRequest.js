const mongoose = require('mongoose');
const { REQUEST_STATUS } = require('../config/constants');

const serviceRequestSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        vehicle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: true,
        },
        garage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Garage',
            required: true,
        },
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GarageService',
        },
        serviceType: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        preferredDate: {
            type: Date,
        },
        preferredTime: {
            type: String,
        },
        isEmergency: {
            type: Boolean,
            default: false,
        },
        emergencyLatitude: {
            type: Number,
        },
        emergencyLongitude: {
            type: Number,
        },
        status: {
            type: String,
            enum: Object.values(REQUEST_STATUS),
            default: REQUEST_STATUS.PENDING,
        },
        rejectionReason: {
            type: String,
            trim: true,
        },
        totalCost: {
            type: Number,
            default: 0,
        },
        // Track which mechanic is assigned
        assignedMechanic: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

serviceRequestSchema.index({ customer: 1, status: 1 });
serviceRequestSchema.index({ garage: 1, status: 1 });
serviceRequestSchema.index({ isEmergency: 1, status: 1 });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
