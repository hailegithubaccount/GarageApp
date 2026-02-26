require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Garage = require('../models/Garage');
const GarageService = require('../models/GarageService');
const Vehicle = require('../models/Vehicle');
const connectDB = require('../config/db');

const dumpIds = async () => {
    try {
        await connectDB();

        const customer = await User.findOne({ role: 'customer' });
        const garage = await Garage.findOne({});
        const service = await GarageService.findOne({ garage: garage?._id });
        const vehicle = await Vehicle.findOne({ customer: customer?._id });

        console.log('\n🔍 CURRENT DATABASE IDs');
        console.log('═══════════════════════════════════════');
        console.log(`  Customer Email : ${customer?.email || 'NOT FOUND'}`);
        console.log(`  Vehicle ID     : ${vehicle?._id || 'NOT FOUND'}`);
        console.log(`  Garage ID      : ${garage?._id || 'NOT FOUND'}`);
        console.log(`  Service ID     : ${service?._id || 'NOT FOUND'}`);
        console.log('═══════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
};

dumpIds();
