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

        // ================== GARAGE 1 ==================
        const admin1 = await User.create({
            fullName: 'Abebe Kebede',
            email: 'admin@gms.com',
            phoneNumber: '+251911111111',
            password: 'admin123',
            role: 'admin',
            status: 'active',
        });

        const garage1 = await Garage.create({
            garageName: 'Jimma Auto Repair Center',
            location: 'Jimma, Ethiopia',
            latitude: 7.6731,
            longitude: 36.8342,
            contactNumber: '+251911111111',
            description: 'Full-service vehicle repair and maintenance center',
            operatingHours: 'Mon-Sat 8:00 AM - 6:00 PM',
            status: 'active',
            admin: admin1._id,
        });
        await User.findByIdAndUpdate(admin1._id, { garage: garage1._id });
        console.log('✅ Garage 1: Jimma Auto Repair Center (admin@gms.com / admin123)');

        // Garage 1 mechanics
        const mech1 = await User.create({
            fullName: 'Mohammed Ali', email: 'mechanic1@gms.com',
            phoneNumber: '+251922222222', password: 'mech123',
            role: 'mechanic', status: 'active', garage: garage1._id,
        });
        const mech2 = await User.create({
            fullName: 'Dawit Haile', email: 'mechanic2@gms.com',
            phoneNumber: '+251933333333', password: 'mech123',
            role: 'mechanic', status: 'active', garage: garage1._id,
        });
        console.log('✅ Garage 1 Mechanics created (mechanic1@gms.com, mechanic2@gms.com / mech123)');

        // Garage 1 Services (with its own prices)
        const services1 = await GarageService.insertMany([
            { garage: garage1._id, serviceName: 'Oil Change', price: 500, category: 'oil_change', estimatedDuration: '30 mins' },
            { garage: garage1._id, serviceName: 'Engine Diagnostics', price: 300, category: 'diagnostics', estimatedDuration: '1 hour' },
            { garage: garage1._id, serviceName: 'Brake Repair', price: 1500, category: 'brakes', estimatedDuration: '2 hours' },
            { garage: garage1._id, serviceName: 'Tire Replacement', price: 800, category: 'tires', estimatedDuration: '45 mins' },
            { garage: garage1._id, serviceName: 'Electrical System Check', price: 400, category: 'electrical', estimatedDuration: '1 hour' },
            { garage: garage1._id, serviceName: 'Body Work', price: 3000, category: 'body_work', estimatedDuration: '1-3 days' },
        ]);
        console.log('✅ Garage 1 services created (6 services, prices: 300-3000 ETB)');

        // ================== GARAGE 2 ==================
        const admin2 = await User.create({
            fullName: 'Tigist Mekonnen',
            email: 'admin2@gms.com',
            phoneNumber: '+251955555555',
            password: 'admin123',
            role: 'admin',
            status: 'active',
        });

        const garage2 = await Garage.create({
            garageName: 'Addis Speed Auto Service',
            location: 'Addis Ababa, Ethiopia',
            latitude: 9.0222,
            longitude: 38.7468,
            contactNumber: '+251955555555',
            description: 'Premium auto service center specializing in modern vehicles',
            operatingHours: 'Mon-Sun 7:00 AM - 9:00 PM',
            status: 'active',
            admin: admin2._id,
        });
        await User.findByIdAndUpdate(admin2._id, { garage: garage2._id });
        console.log('✅ Garage 2: Addis Speed Auto Service (admin2@gms.com / admin123)');

        // Garage 2 mechanic
        const mech3 = await User.create({
            fullName: 'Bekele Tadesse', email: 'mechanic3@gms.com',
            phoneNumber: '+251966666666', password: 'mech123',
            role: 'mechanic', status: 'active', garage: garage2._id,
        });
        console.log('✅ Garage 2 Mechanic created (mechanic3@gms.com / mech123)');

        // Garage 2 Services (DIFFERENT prices from Garage 1)
        const services2 = await GarageService.insertMany([
            { garage: garage2._id, serviceName: 'Premium Oil Change', price: 750, category: 'oil_change', estimatedDuration: '45 mins' },
            { garage: garage2._id, serviceName: 'Full Diagnostics Scan', price: 500, category: 'diagnostics', estimatedDuration: '1.5 hours' },
            { garage: garage2._id, serviceName: 'Brake Overhaul', price: 2500, category: 'brakes', estimatedDuration: '3 hours' },
            { garage: garage2._id, serviceName: 'Tire Balancing & Replacement', price: 1200, category: 'tires', estimatedDuration: '1 hour' },
            { garage: garage2._id, serviceName: 'Engine Tune-up', price: 2000, category: 'engine', estimatedDuration: '2-3 hours' },
            { garage: garage2._id, serviceName: 'General Maintenance', price: 600, category: 'general', estimatedDuration: '1 hour' },
        ]);
        console.log('✅ Garage 2 services created (6 services, prices: 500-2500 ETB)');

        // ================== CUSTOMER & VEHICLES ==================
        const customer = await User.create({
            fullName: 'Sara Ahmed', email: 'customer@gms.com',
            phoneNumber: '+251944444444', password: 'cust123',
            role: 'customer', status: 'active',
        });
        console.log('✅ Customer created (customer@gms.com / cust123)');

        // Multiple vehicles for the same customer
        const vehicle1 = await Vehicle.create({
            customer: customer._id, plateNumber: 'AA-12345',
            vehicleType: 'Sedan', brand: 'Toyota', model: 'Corolla', year: 2020, color: 'White',
        });
        const vehicle2 = await Vehicle.create({
            customer: customer._id, plateNumber: 'AA-67890',
            vehicleType: 'SUV', brand: 'Hyundai', model: 'Tucson', year: 2022, color: 'Black',
        });
        const vehicle3 = await Vehicle.create({
            customer: customer._id, plateNumber: 'OR-11223',
            vehicleType: 'Pickup', brand: 'Toyota', model: 'Hilux', year: 2019, color: 'Silver',
        });
        console.log('✅ 3 vehicles created for customer (AA-12345, AA-67890, OR-11223)');

        // ================== SAMPLE DATA ==================
        // Service request at Garage 1
        const request = await ServiceRequest.create({
            customer: customer._id, vehicle: vehicle1._id, garage: garage1._id,
            service: services1[0]._id, serviceType: 'Oil Change',
            description: 'Regular oil change needed', status: 'completed',
            totalCost: services1[0].price, assignedMechanic: mech1._id,
        });

        // Inventory for Garage 1
        await Inventory.insertMany([
            { garage: garage1._id, itemName: 'Engine Oil 5W-30', quantity: 50, unitPrice: 120, minimumStock: 10, supplier: 'ABC Supplies' },
            { garage: garage1._id, itemName: 'Oil Filter', quantity: 30, unitPrice: 80, minimumStock: 5 },
            { garage: garage1._id, itemName: 'Brake Pads (Front)', quantity: 15, unitPrice: 450, minimumStock: 5 },
            { garage: garage1._id, itemName: 'Air Filter', quantity: 20, unitPrice: 150, minimumStock: 5 },
            { garage: garage1._id, itemName: 'Spark Plugs', quantity: 40, unitPrice: 60, minimumStock: 10 },
        ]);
        console.log('✅ Inventory items created for Garage 1');

        // Sample review for Garage 1
        await Review.create({
            customer: customer._id, garage: garage1._id,
            serviceRequest: request._id, rating: 5,
            comment: 'Excellent service! Very professional.',
        });
        await Garage.findByIdAndUpdate(garage1._id, { averageRating: 5, totalReviews: 1 });
        console.log('✅ Sample review created');

        console.log('\n🎉 Database seeded successfully!\n');
        console.log('═══════════════════════════════════════════════════');
        console.log('  Test Accounts:');
        console.log('═══════════════════════════════════════════════════');
        console.log('  Super Admin : superadmin@gms.com   / admin123');
        console.log('  Admin 1     : admin@gms.com        / admin123  (Jimma Auto Repair)');
        console.log('  Admin 2     : admin2@gms.com       / admin123  (Addis Speed Auto)');
        console.log('  Mechanic 1  : mechanic1@gms.com    / mech123   (Garage 1)');
        console.log('  Mechanic 2  : mechanic2@gms.com    / mech123   (Garage 1)');
        console.log('  Mechanic 3  : mechanic3@gms.com    / mech123   (Garage 2)');
        console.log('  Customer    : customer@gms.com     / cust123   (3 vehicles)');
        console.log('═══════════════════════════════════════════════════');
        console.log('  Garage 1: Jimma Auto Repair  — 6 services (300-3000 ETB)');
        console.log('  Garage 2: Addis Speed Auto   — 6 services (500-2500 ETB)');
        console.log('═══════════════════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDB();

