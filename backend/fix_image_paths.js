const mongoose = require('mongoose');
const Garage = require('./src/models/Garage');
require('dotenv').config();
const connectDB = require('./src/config/db');

async function fixImagePaths() {
    try {
        await connectDB();
        const garages = await Garage.find({});
        console.log(`Checking ${garages.length} garages...`);
        
        for (const garage of garages) {
            let changed = false;
            const updatedImages = garage.images.map(img => {
                if (img.startsWith('http')) {
                    changed = true;
                    // Split by / and take the last part
                    const parts = img.split('/');
                    return parts[parts.length - 1];
                }
                return img;
            });
            
            if (changed) {
                garage.images = updatedImages;
                await garage.save();
                console.log(`Updated images for garage: ${garage.garageName}`);
            }
        }
        
        console.log('Finished fixing image paths.');
        process.exit(0);
    } catch (err) {
        console.error('Error fixing paths:', err);
        process.exit(1);
    }
}

fixImagePaths();
