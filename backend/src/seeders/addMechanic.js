require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Garage = require('../models/Garage');
const connectDB = require('../config/db');

const addMechanic = async () => {
    try {
        await connectDB();

        const garage = await Garage.findOne({ garageName: 'Unity Auto Spa & Repair' }) || await Garage.findOne({});

        if (!garage) {
            console.log('❌ No garage found. Please create a garage first.');
            process.exit(1);
        }

        const mechanicEmail = 'mechanic@gms.com';
        let mechanic = await User.findOne({ email: mechanicEmail });

        if (!mechanic) {
            mechanic = await User.create({
                fullName: 'Dawit Mechanic',
                email: mechanicEmail,
                phoneNumber: '+251955555555',
                password: 'mech123',
                role: 'mechanic',
                status: 'active',
                garage: garage._id
            });
            console.log('✅ Mechanic created successfully!');
        } else {
            console.log('ℹ️  Mechanic already exists.');
        }

        console.log('\n🔧 Mechanic Info for Postman');
        console.log('═══════════════════════════════════════');
        console.log(`  Name        : ${mechanic.fullName}`);
        console.log(`  Mechanic ID : ${mechanic._id}`);
        console.log(`  Garage      : ${garage.garageName}`);
        console.log('═══════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding mechanic:', error);
        process.exit(1);
    }
};

addMechanic();
