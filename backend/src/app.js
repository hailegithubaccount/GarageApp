require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const garageRoutes = require('./routes/garageRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');

const app = express();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: false })); // Allow cross-origin images
app.use(cors());

// Static folder for uploads
app.use('/uploads', express.static('uploads'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging (dev only)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    app.use((req, res, next) => {
        console.log(`Incoming Request: ${req.method} ${req.originalUrl}`);
        next();
    });
}

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Garage Management System API is running',
        timestamp: new Date().toISOString(),
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/garages', garageRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', superAdminRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`\n🚗 Garage Management System API`);
        console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
        console.log(`   Port        : ${PORT}`);
        console.log(`   MongoDB     : ${process.env.MONGODB_URI}`);
        console.log(`   Health      : http://localhost:${PORT}/api/health\n`);
    });
};

startServer();

module.exports = app;
