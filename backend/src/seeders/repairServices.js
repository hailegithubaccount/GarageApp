require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Garage = require('../models/Garage');
const GarageService = require('../models/GarageService');
const connectDB = require('../config/db');

const repairServices = async () => {
    try {
        await connectDB();

        const garages = await Garage.find({});

        for (const garage of garages) {
            const count = await GarageService.countDocuments({ garage: garage._id });
            if (count === 0) {
                console.log(`🔧 Adding services for: ${garage.garageName}`);
                await GarageService.insertMany([
                    { garage: garage._id, serviceName: 'Oil Change', price: 500, category: 'oil_change', estimatedDuration: '30 mins' },
                    { garage: garage._id, serviceName: 'Engine Diagnostics', price: 300, category: 'diagnostics', estimatedDuration: '1 hour' },
                    { garage: garage._id, serviceName: 'Brake Repair', price: 1500, category: 'brakes', estimatedDuration: '2 hours' },
                    { garage: garage._id, serviceName: 'Full Car Wash', price: 400, category: 'general', estimatedDuration: '1 hour' },
                ]);
            } else {
                console.log(`✅ ${garage.garageName} already has ${count} services.`);
            }
        }

        console.log('\n🚀 Repair completed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error repairing services:', error);
        process.exit(1);
    }
};

repairServices();
