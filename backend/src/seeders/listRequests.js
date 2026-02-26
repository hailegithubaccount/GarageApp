require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const ServiceRequest = require('../models/ServiceRequest');
const connectDB = require('../config/db');

const listRequests = async () => {
    try {
        await connectDB();
        const requests = await ServiceRequest.find({}).sort({ createdAt: -1 });
        console.log('\n📋 SERVICE REQUESTS');
        console.log('═══════════════════════════════════════');
        for (const req of requests) {
            console.log(`ID    : ${req._id}`);
            console.log(`Status: ${req.status}`);
            console.log('---------------------------------------');
        }
        process.exit(0);
    } catch (e) { process.exit(1); }
};
listRequests();
