require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const createSuperAdmin = async () => {
  try {
    await connectDB();
    
    const adminExists = await User.findOne({ role: 'super_admin' });
    if (adminExists) {
      console.log('ℹ️ Super Admin already exists');
      process.exit(0);
    }

    await User.create({
      fullName: 'System Administrator',
      email: 'superadmin@gms.com',
      phoneNumber: '+251900000000',
      password: 'admin123',
      role: 'super_admin',
      status: 'active',
    });

    console.log('✅ Super Admin created successfully!');
    console.log('  Email    : superadmin@gms.com');
    console.log('  Password : admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating Super Admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();
