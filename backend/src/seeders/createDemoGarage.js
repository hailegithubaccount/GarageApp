require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Garage = require('../models/Garage');
const GarageService = require('../models/GarageService');
const connectDB = require('../config/db');

const createDemoGarage = async () => {
    try {
        await connectDB();

        const adminEmail = 'admin2@gms.com';
        let admin = await User.findOne({ email: adminEmail });

        if (!admin) {
            admin = await User.create({
                fullName: 'Admin Two',
                email: adminEmail,
                phoneNumber: '+251922222222',
                password: 'admin123',
                role: 'admin',
                status: 'active',
            });
            console.log('✅ Admin 2 created.');
        } else {
            console.log('ℹ️  Admin 2 already exists.');
        }

        const garageName = 'Unity Auto Spa & Repair';
        let garage = await Garage.findOne({ garageName });

        if (!garage) {
            garage = await Garage.create({
                garageName: garageName,
                location: 'Bole, Addis Ababa',
                latitude: 8.9806,
                longitude: 38.7897,
                contactNumber: '+251922222222',
                description: 'Premium car washing and light mechanical maintenance.',
                operatingHours: 'Mon-Sun 7:00 AM - 9:00 PM',
                status: 'active',
                admin: admin._id,
            });
            console.log('✅ Garage 2 created.');

            // Link garage to admin
            await User.findByIdAndUpdate(admin._id, { garage: garage._id });

            // Add some services
            await GarageService.insertMany([
                { garage: garage._id, serviceName: 'Full Car Wash', price: 300, category: 'general', estimatedDuration: '1 hour' },
                { garage: garage._id, serviceName: 'Interior Detailing', price: 1200, category: 'general', estimatedDuration: '3 hours' },
                { garage: garage._id, serviceName: 'Tire Pressure Check', price: 50, category: 'tires', estimatedDuration: '10 mins' },
            ]);
            console.log('✅ Demo services added to Garage 2.');
        } else {
            console.log('ℹ️  Garage 2 already exists.');
        }

        console.log('\n🎉 Demo Garage & Admin created successfully!');
        console.log('═══════════════════════════════════════');
        console.log(`  Admin Email : ${adminEmail}`);
        console.log('  Password    : admin123');
        console.log(`  Garage Name : ${garageName}`);
        console.log('═══════════════════════════════════════');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating Demo Garage:', error);
        process.exit(1);
    }
};

createDemoGarage();
