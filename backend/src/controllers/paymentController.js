const Payment = require('../models/Payment');
const ServiceRequest = require('../models/ServiceRequest');
const { initializePayment, verifyPayment } = require('../services/chapaService');
const { createNotification } = require('../services/notificationService');
const { createAuditLog } = require('../utils/auditLogger');
const { PAYMENT_STATUS, PAYMENT_METHOD, REQUEST_STATUS } = require('../config/constants');
const crypto = require('crypto');

// @desc    Initiate Chapa payment
// @route   POST /api/payments/initiate
// @access  Customer
exports.initiatePayment = async (req, res, next) => {
    try {
        const { serviceRequestId } = req.body;
        const sr = await ServiceRequest.findOne({
            _id: serviceRequestId, customer: req.user._id, status: REQUEST_STATUS.COMPLETED,
        });
        if (!sr) return res.status(404).json({ success: false, message: 'Completed service request not found' });

        const existing = await Payment.findOne({ serviceRequest: serviceRequestId, paymentStatus: PAYMENT_STATUS.COMPLETED });
        if (existing) return res.status(400).json({ success: false, message: 'Already paid' });

        const txRef = `gms-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
        const payment = await Payment.create({
            serviceRequest: serviceRequestId, customer: req.user._id,
            amount: sr.totalCost, paymentMethod: PAYMENT_METHOD.CHAPA,
            paymentStatus: PAYMENT_STATUS.PENDING, transactionReference: txRef,
        });

        const names = req.user.fullName.split(' ');
        const chapaRes = await initializePayment({
            amount: sr.totalCost, email: req.user.email,
            firstName: names[0] || 'Customer', lastName: names.slice(1).join(' ') || 'User',
            txRef, callbackUrl: `${req.protocol}://${req.get('host')}/api/payments/verify/${txRef}`,
        });

        res.status(200).json({ success: true, message: 'Payment initiated', data: { paymentId: payment._id, checkoutUrl: chapaRes.data?.checkout_url, txRef } });
    } catch (error) { next(error); }
};

// @desc    Verify Chapa payment callback
// @route   GET /api/payments/verify/:txRef
exports.verifyPaymentCallback = async (req, res, next) => {
    try {
        const payment = await Payment.findOne({ transactionReference: req.params.txRef });
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

        const chapaRes = await verifyPayment(req.params.txRef);
        if (chapaRes.status === 'success') {
            payment.paymentStatus = PAYMENT_STATUS.COMPLETED;
            await payment.save();
            await createNotification({ userId: payment.customer, title: 'Payment Successful', message: `Payment of ${payment.amount} ETB confirmed.`, type: 'payment', referenceId: payment._id, referenceType: 'Payment' });
            await createAuditLog({ userId: payment.customer, action: 'PAYMENT_COMPLETED', entityType: 'Payment', entityId: payment._id, details: `Chapa ${payment.amount} ETB` });
            res.status(200).json({ success: true, message: 'Payment verified', data: payment });
        } else {
            payment.paymentStatus = PAYMENT_STATUS.FAILED; await payment.save();
            res.status(400).json({ success: false, message: 'Payment verification failed' });
        }
    } catch (error) { next(error); }
};

// @desc    Record cash payment
// @route   POST /api/payments/cash
// @access  Admin
exports.recordCashPayment = async (req, res, next) => {
    try {
        const { serviceRequestId, amount } = req.body;
        const sr = await ServiceRequest.findById(serviceRequestId);
        if (!sr) return res.status(404).json({ success: false, message: 'Service request not found' });

        const payment = await Payment.create({
            serviceRequest: serviceRequestId, customer: sr.customer,
            amount: amount || sr.totalCost, paymentMethod: PAYMENT_METHOD.CASH,
            paymentStatus: PAYMENT_STATUS.COMPLETED, transactionReference: `cash-${Date.now()}`,
        });
        await createNotification({ userId: sr.customer, title: 'Cash Payment Recorded', message: `Cash payment of ${payment.amount} ETB recorded.`, type: 'payment', referenceId: payment._id, referenceType: 'Payment' });
        await createAuditLog({ userId: req.user._id, action: 'CASH_PAYMENT_RECORDED', entityType: 'Payment', entityId: payment._id, details: `Cash ${payment.amount} ETB`, ipAddress: req.ip });
        res.status(201).json({ success: true, message: 'Cash payment recorded', data: payment });
    } catch (error) { next(error); }
};

// @desc    Get payment by service request
// @route   GET /api/payments/:requestId
exports.getPaymentByRequest = async (req, res, next) => {
    try {
        const payment = await Payment.findOne({ serviceRequest: req.params.requestId }).populate('customer', 'fullName email phoneNumber').populate('serviceRequest');
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
        res.status(200).json({ success: true, data: payment });
    } catch (error) { next(error); }
};

// @desc    Get payment history
// @route   GET /api/payments
exports.getPayments = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const query = req.user.role === 'customer' ? { customer: req.user._id } : {};
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const payments = await Payment.find(query).populate('customer', 'fullName email').populate('serviceRequest', 'serviceType status').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
        const total = await Payment.countDocuments(query);
        res.status(200).json({ success: true, count: payments.length, total, data: payments });
    } catch (error) { next(error); }
};
