require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

// Models
const User = require('../models/User');
const Garage = require('../models/Garage');
const GarageService = require('../models/GarageService');
const Vehicle = require('../models/Vehicle');
const ServiceRequest = require('../models/ServiceRequest');
const MechanicAssignment = require('../models/MechanicAssignment');
const Inventory = require('../models/Inventory');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

const seedDB = async () => {
    try {
        await connectDB();
        console.log('🗑️  Clearing existing data...');
        await Promise.all([
            User.deleteMany(), Garage.deleteMany(), GarageService.deleteMany(),
            Vehicle.deleteMany(), ServiceRequest.deleteMany(), MechanicAssignment.deleteMany(),
            Inventory.deleteMany(), Payment.deleteMany(), Review.deleteMany(), Notification.deleteMany(),
        ]);

        // 1. Create Super Admin
        const superAdmin = await User.create({
            fullName: 'System Administrator',
            email: 'superadmin@gms.com',
            phoneNumber: '+251900000000',
            password: 'admin123',
            role: 'super_admin',
            status: 'active',
        });
        console.log('✅ Super Admin created (superadmin@gms.com / admin123)');

        // 2. Create Garage Admin
        const admin = await User.create({
            fullName: 'Abebe Kebede',
            email: 'admin@gms.com',
            phoneNumber: '+251911111111',
            password: 'admin123',
            role: 'admin',
            status: 'active',
        });

        // 3. Create Garage
        const garage = await Garage.create({
            garageName: 'Jimma Auto Repair Center',
            location: 'Jimma, Ethiopia',
            latitude: 7.6731,
            longitude: 36.8342,
            contactNumber: '+251911111111',
            description: 'Full-service vehicle repair and maintenance center',
            operatingHours: 'Mon-Sat 8:00 AM - 6:00 PM',
            status: 'active',
            admin: admin._id,
        });
        await User.findByIdAndUpdate(admin._id, { garage: garage._id });
        console.log('✅ Garage Admin & Garage created (admin@gms.com / admin123)');

        // 4. Create Mechanics
        const mech1 = await User.create({
            fullName: 'Mohammed Ali', email: 'mechanic1@gms.com',
            phoneNumber: '+251922222222', password: 'mech123',
            role: 'mechanic', status: 'active', garage: garage._id,
        });
        const mech2 = await User.create({
            fullName: 'Dawit Haile', email: 'mechanic2@gms.com',
            phoneNumber: '+251933333333', password: 'mech123',
            role: 'mechanic', status: 'active', garage: garage._id,
        });
        console.log('✅ Mechanics created (mechanic1@gms.com, mechanic2@gms.com / mech123)');

        // 5. Create Customer
        const customer = await User.create({
            fullName: 'Sara Ahmed', email: 'customer@gms.com',
            phoneNumber: '+251944444444', password: 'cust123',
            role: 'customer', status: 'active',
        });
        console.log('✅ Customer created (customer@gms.com / cust123)');

        // 6. Create Garage Services
        const services = await GarageService.insertMany([
            { garage: garage._id, serviceName: 'Oil Change', price: 500, category: 'oil_change', estimatedDuration: '30 mins' },
            { garage: garage._id, serviceName: 'Engine Diagnostics', price: 300, category: 'diagnostics', estimatedDuration: '1 hour' },
            { garage: garage._id, serviceName: 'Brake Repair', price: 1500, category: 'brakes', estimatedDuration: '2 hours' },
            { garage: garage._id, serviceName: 'Tire Replacement', price: 800, category: 'tires', estimatedDuration: '45 mins' },
            { garage: garage._id, serviceName: 'Electrical System Check', price: 400, category: 'electrical', estimatedDuration: '1 hour' },
            { garage: garage._id, serviceName: 'Body Work', price: 3000, category: 'body_work', estimatedDuration: '1-3 days' },
        ]);
        console.log('✅ Garage services created');

        // 7. Create Vehicle
        const vehicle = await Vehicle.create({
            customer: customer._id, plateNumber: 'AA-12345',
            vehicleType: 'Sedan', brand: 'Toyota', model: 'Corolla', year: 2020, color: 'White',
        });
        console.log('✅ Vehicle created');

        // 8. Create Service Request
        const request = await ServiceRequest.create({
            customer: customer._id, vehicle: vehicle._id, garage: garage._id,
            service: services[0]._id, serviceType: 'Oil Change',
            description: 'Regular oil change needed', status: 'completed',
            totalCost: 500, assignedMechanic: mech1._id,
        });

        // 9. Create Inventory Items
        await Inventory.insertMany([
            { garage: garage._id, itemName: 'Engine Oil 5W-30', quantity: 50, unitPrice: 120, minimumStock: 10, supplier: 'ABC Supplies' },
            { garage: garage._id, itemName: 'Oil Filter', quantity: 30, unitPrice: 80, minimumStock: 5 },
            { garage: garage._id, itemName: 'Brake Pads (Front)', quantity: 15, unitPrice: 450, minimumStock: 5 },
            { garage: garage._id, itemName: 'Air Filter', quantity: 20, unitPrice: 150, minimumStock: 5 },
            { garage: garage._id, itemName: 'Spark Plugs', quantity: 40, unitPrice: 60, minimumStock: 10 },
        ]);
        console.log('✅ Inventory items created');

        // 10. Create sample review
        await Review.create({
            customer: customer._id, garage: garage._id,
            serviceRequest: request._id, rating: 5,
            comment: 'Excellent service! Very professional.',
        });
        await Garage.findByIdAndUpdate(garage._id, { averageRating: 5, totalReviews: 1 });
        console.log('✅ Sample review created');

        console.log('\n🎉 Database seeded successfully!\n');
        console.log('═══════════════════════════════════════');
        console.log('  Test Accounts:');
        console.log('═══════════════════════════════════════');
        console.log('  Super Admin : superadmin@gms.com / admin123');
        console.log('  Admin       : admin@gms.com      / admin123');
        console.log('  Mechanic 1  : mechanic1@gms.com  / mech123');
        console.log('  Mechanic 2  : mechanic2@gms.com  / mech123');
        console.log('  Customer    : customer@gms.com   / cust123');
        console.log('═══════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDB();
