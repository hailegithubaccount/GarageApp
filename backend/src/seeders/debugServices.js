require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Garage = require('../models/Garage');
const GarageService = require('../models/GarageService');
const connectDB = require('../config/db');

const checkServices = async () => {
    try {
        await connectDB();

        const garages = await Garage.find({});
        console.log('\n📊 Database Status Check');
        console.log('═══════════════════════════════════════');

        for (const garage of garages) {
            const serviceCount = await GarageService.countDocuments({ garage: garage._id });
            console.log(`Garage: ${garage.garageName}`);
            console.log(`  ID      : ${garage._id}`);
            console.log(`  Services: ${serviceCount}`);
            console.log('---------------------------------------');
        }

        if (garages.length === 0) {
            console.log('❌ No garages found in database.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking services:', error);
        process.exit(1);
    }
};

checkServices();
