const mongoose = require('mongoose');
const { PAYMENT_METHOD, PAYMENT_STATUS } = require('../config/constants');

const paymentSchema = new mongoose.Schema(
    {
        serviceRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ServiceRequest',
            required: true,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: 0,
        },
        paymentMethod: {
            type: String,
            enum: Object.values(PAYMENT_METHOD),
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: Object.values(PAYMENT_STATUS),
            default: PAYMENT_STATUS.PENDING,
        },
        transactionReference: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

paymentSchema.index({ serviceRequest: 1 });
paymentSchema.index({ customer: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
