require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const ServiceRequest = require('../models/ServiceRequest');
const Payment = require('../models/Payment');
const connectDB = require('../config/db');

const checkPaymentStatus = async () => {
    try {
        await connectDB();

        const requestId = '69a0840b3cb30c8c33aa3206';
        const request = await ServiceRequest.findById(requestId);
        const payments = await Payment.find({ serviceRequest: requestId });

        console.log('\n🔍 Payment Status Check');
        console.log('═══════════════════════════════════════');
        console.log(`Request ID: ${requestId}`);
        console.log(`Status    : ${request?.status}`);
        console.log(`Cost      : ${request?.totalCost} ETB`);
        console.log('\nPayments Found:');
        if (payments.length === 0) {
            console.log('  (None)');
        } else {
            payments.forEach(p => {
                console.log(`  - ID: ${p._id} | Ref: ${p.transactionReference} | Method: ${p.paymentMethod} | Status: ${p.paymentStatus}`);
            });
        }
        console.log('═══════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
};

checkPaymentStatus();
