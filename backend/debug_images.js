const mongoose = require('mongoose');
const Garage = require('./src/models/Garage');
require('dotenv').config();
const connectDB = require('./src/config/db');

async function checkImages() {
    try {
        await connectDB();
        const garages = await Garage.find({ images: { $not: { $size: 0 } } });
        console.log(`Found ${garages.length} garages with images.`);
        garages.forEach(g => {
            console.log(`Garage: ${g.garageName}`);
            console.log(`Images: ${JSON.stringify(g.images, null, 2)}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkImages();
