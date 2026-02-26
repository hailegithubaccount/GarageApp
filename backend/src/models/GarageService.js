const mongoose = require('mongoose');
const { SERVICE_CATEGORIES } = require('../config/constants');

const garageServiceSchema = new mongoose.Schema(
    {
        garage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Garage',
            required: true,
        },
        serviceName: {
            type: String,
            required: [true, 'Service name is required'],
            trim: true,
            maxlength: 100,
        },
        description: {
            type: String,
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: 0,
        },
        estimatedDuration: {
            type: String,
            trim: true,
        },
        category: {
            type: String,
            enum: SERVICE_CATEGORIES,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

garageServiceSchema.index({ garage: 1, category: 1 });

module.exports = mongoose.model('GarageService', garageServiceSchema);
