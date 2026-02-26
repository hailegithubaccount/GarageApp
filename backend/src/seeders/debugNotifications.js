require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const ServiceRequest = require('../models/ServiceRequest');
const Garage = require('../models/Garage');
const Notification = require('../models/Notification');
const connectDB = require('../config/db');

const debugNotifications = async () => {
    try {
        await connectDB();

        const requestCount = await ServiceRequest.countDocuments();
        const notificationCount = await Notification.countDocuments();

        console.log('\n🔍 Notification Debugger');
        console.log('═══════════════════════════════════════');
        console.log(`Total Service Requests: ${requestCount}`);
        console.log(`Total Notifications   : ${notificationCount}`);

        if (requestCount > 0) {
            const latestRequest = await ServiceRequest.findOne().sort({ createdAt: -1 }).populate('garage');
            if (latestRequest && latestRequest.garage) {
                console.log('\nLatest Request Info:');
                console.log(`  ID       : ${latestRequest._id}`);
                console.log(`  Garage   : ${latestRequest.garage.garageName}`);
                console.log(`  Admin ID : ${latestRequest.garage.admin}`);

                const adminNotifications = await Notification.countDocuments({ user: latestRequest.garage.admin });
                console.log(`  Notifications for this Admin: ${adminNotifications}`);
            }
        }
        console.log('═══════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error debugging:', error);
        process.exit(1);
    }
};

debugNotifications();
