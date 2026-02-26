require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const ServiceRequest = require('../models/ServiceRequest');
const connectDB = require('../config/db');

const setStatusCompleted = async () => {
    try {
        await connectDB();

        const requestId = '69a0840b3cb30c8c33aa3206';
        const request = await ServiceRequest.findById(requestId);

        if (!request) {
            console.log('❌ Request not found.');
            process.exit(1);
        }

        request.status = 'completed';
        await request.save();

        console.log('\n✅ Service Request Status Updated');
        console.log('═══════════════════════════════════════');
        console.log(`  Request ID : ${request._id}`);
        console.log(`  New Status : ${request.status.toUpperCase()}`);
        console.log('═══════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
};

setStatusCompleted();
