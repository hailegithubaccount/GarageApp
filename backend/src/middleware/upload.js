const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const baseUploadDir = path.join(__dirname, '../../uploads');
const profileDir = path.join(baseUploadDir, 'profiles');
const vehicleDir = path.join(baseUploadDir, 'vehicles');
const garageDir = path.join(baseUploadDir, 'garages');

[profileDir, vehicleDir, garageDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'profileImage' || req.originalUrl.includes('profile')) {
            cb(null, profileDir);
        } else if (file.fieldname === 'image' || req.originalUrl.includes('vehicles')) {
            cb(null, vehicleDir);
        } else if (file.fieldname === 'garageImages' || req.originalUrl.includes('garages')) {
            cb(null, garageDir);
        } else {
            cb(null, baseUploadDir);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        let prefix = 'file-';
        if (file.fieldname === 'image') prefix = 'vehicle-';
        else if (file.fieldname === 'profileImage') prefix = 'profile-';
        else if (file.fieldname === 'garageImages') prefix = 'garage-';
        
        cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
    },
});

// File filter (images only)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});

module.exports = upload;
