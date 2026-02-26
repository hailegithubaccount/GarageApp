require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const connectDB = require('../config/db');

const repairVehicles = async () => {
    try {
        await connectDB();

        // Use the customer from the seed if it exists, otherwise use 'customer@gms.com'
        let customer = await User.findOne({ email: 'customer@gms.com' }) || await User.findOne({ role: 'customer' });

        if (!customer) {
            console.log('🔧 Creating demo customer...');
            customer = await User.create({
                fullName: 'Sara Ahmed',
                email: 'customer@gms.com',
                phoneNumber: '+251944444444',
                password: 'cust123',
                role: 'customer',
                status: 'active',
            });
        }

        const vehicleCount = await Vehicle.countDocuments({ customer: customer._id });
        if (vehicleCount === 0) {
            console.log(`🔧 Adding vehicle for: ${customer.fullName}`);
            const vehicle = await Vehicle.create({
                customer: customer._id,
                plateNumber: 'AA-12345',
                vehicleType: 'Sedan',
                brand: 'Toyota',
                model: 'Corolla',
                year: 2020,
                color: 'White',
            });
            console.log(`✅ Vehicle created: ${vehicle._id}`);
        } else {
            const vehicle = await Vehicle.findOne({ customer: customer._id });
            console.log(`✅ ${customer.fullName} already has a vehicle: ${vehicle._id}`);
        }

        console.log('\n🚀 Vehicle repair completed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error repairing vehicles:', error);
        process.exit(1);
    }
};

repairVehicles();
