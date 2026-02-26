require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const createSuperAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = 'superadmin@gms.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log(`ℹ️  Super Admin with email ${adminEmail} already exists.`);
            process.exit(0);
        }

        const superAdmin = await User.create({
            fullName: 'System Administrator',
            email: adminEmail,
            phoneNumber: '+251900000000',
            password: 'admin123',
            role: 'super_admin',
            status: 'active',
        });

        console.log('✅ Super Admin created successfully!');
        console.log('═══════════════════════════════════════');
        console.log(`  Email    : ${superAdmin.email}`);
        console.log('  Password : admin123');
        console.log('═══════════════════════════════════════');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating Super Admin:', error);
        process.exit(1);
    }
};

createSuperAdmin();
