const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        plateNumber: {
            type: String,
            required: [true, 'Plate number is required'],
            unique: true,
            trim: true,
            uppercase: true,
        },
        vehicleType: {
            type: String,
            trim: true,
        },
        brand: {
            type: String,
            trim: true,
        },
        model: {
            type: String,
            trim: true,
        },
        year: {
            type: Number,
        },
        color: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

vehicleSchema.index({ customer: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
