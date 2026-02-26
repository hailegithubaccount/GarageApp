require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const connectDB = require('../config/db');

const checkCustomerAndVehicles = async () => {
    try {
        await connectDB();

        const customers = await User.find({ role: 'customer' });
        console.log('\n📊 Customer & Vehicle Status');
        console.log('═══════════════════════════════════════');

        if (customers.length === 0) {
            console.log('❌ No customers found.');
        } else {
            for (const customer of customers) {
                const vehicleCount = await Vehicle.countDocuments({ customer: customer._id });
                console.log(`Customer: ${customer.fullName} (${customer.email})`);
                console.log(`  Vehicles: ${vehicleCount}`);

                if (vehicleCount > 0) {
                    const vehicles = await Vehicle.find({ customer: customer._id });
                    vehicles.forEach(v => {
                        console.log(`    - ID: ${v._id} (${v.plateNumber}: ${v.brand} ${v.model})`);
                    });
                }
                console.log('---------------------------------------');
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking data:', error);
        process.exit(1);
    }
};

checkCustomerAndVehicles();
