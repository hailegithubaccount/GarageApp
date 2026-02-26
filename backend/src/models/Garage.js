const mongoose = require('mongoose');
const { GARAGE_STATUS } = require('../config/constants');

const garageSchema = new mongoose.Schema(
    {
        garageName: {
            type: String,
            required: [true, 'Garage name is required'],
            trim: true,
            maxlength: 150,
        },
        location: {
            type: String,
            trim: true,
        },
        latitude: {
            type: Number,
            min: -90,
            max: 90,
        },
        longitude: {
            type: Number,
            min: -180,
            max: 180,
        },
        contactNumber: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        operatingHours: {
            type: String,
            trim: true,
        },
        images: [{ type: String }],
        status: {
            type: String,
            enum: Object.values(GARAGE_STATUS),
            default: GARAGE_STATUS.PENDING,
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // Verification documents for super admin approval
        verificationDocuments: [{ type: String }],
        // Average rating computed from reviews
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        totalReviews: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Index for geolocation queries
garageSchema.index({ latitude: 1, longitude: 1 });
garageSchema.index({ status: 1 });

module.exports = mongoose.model('Garage', garageSchema);
