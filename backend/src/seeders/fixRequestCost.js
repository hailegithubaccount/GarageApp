require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const ServiceRequest = require('../models/ServiceRequest');
const connectDB = require('../config/db');

const fixRequestCost = async () => {
    try {
        await connectDB();

        const request = await ServiceRequest.findOne({ status: 'completed' }).sort({ updatedAt: -1 });

        if (!request) {
            console.log('❌ No completed service request found to fix.');
            process.exit(1);
        }

        request.totalCost = 500; // Set a realistic cost
        await request.save();

        console.log('\n✅ Service Request Updated');
        console.log('═══════════════════════════════════════');
        console.log(`  Request ID : ${request._id}`);
        console.log(`  New Cost   : ${request.totalCost} ETB`);
        console.log('═══════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
};

fixRequestCost();
