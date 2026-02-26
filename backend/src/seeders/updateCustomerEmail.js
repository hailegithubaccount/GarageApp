require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const updateEmail = async () => {
    try {
        await connectDB();

        const oldEmail = 'michael@example.com';
        const newEmail = 'michael.gms.test@gmail.com';

        const user = await User.findOneAndUpdate(
            { email: oldEmail },
            { email: newEmail },
            { new: true }
        );

        if (!user) {
            console.log(`❌ User with email ${oldEmail} not found.`);
            process.exit(1);
        }

        console.log('\n✅ Email Updated for Chapa Compatibility');
        console.log('═══════════════════════════════════════');
        console.log(`  Name      : ${user.fullName}`);
        console.log(`  New Email : ${user.email}`);
        console.log('═══════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
};

updateEmail();
