require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Garage = require('../models/Garage');
const connectDB = require('../config/db');

const checkMechanics = async () => {
    try {
        await connectDB();

        const mechanics = await User.find({ role: 'mechanic' });
        console.log('\n🔍 MECHANICS LIST');
        console.log('═══════════════════════════════════════');

        if (mechanics.length === 0) {
            console.log('❌ No mechanics found in the database.');
        } else {
            for (const mechanic of mechanics) {
                const garage = await Garage.findById(mechanic.garage);
                console.log(`Mechanic: ${mechanic.fullName}`);
                console.log(`  ID    : ${mechanic._id}`);
                console.log(`  Garage: ${garage ? garage.garageName : 'Unassigned'}`);
                console.log('---------------------------------------');
            }
        }
        console.log('═══════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
};

checkMechanics();
