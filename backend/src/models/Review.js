const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        garage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Garage',
            required: true,
        },
        serviceRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ServiceRequest',
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate reviews per service request
reviewSchema.index({ customer: 1, serviceRequest: 1 }, { unique: true });
reviewSchema.index({ garage: 1 });

module.exports = mongoose.model('Review', reviewSchema);
