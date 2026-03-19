require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const garageRoutes = require('./src/routes/garageRoutes');
const vehicleRoutes = require('./src/routes/vehicleRoutes');
const serviceRequestRoutes = require('./src/routes/serviceRequestRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const superAdminRoutes = require('./src/routes/superAdminRoutes');

const app = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(cors());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files (workshop images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging (dev only)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
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
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚗 Garage Management System API`);
        console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
        console.log(`   Port        : ${PORT}`);
        console.log(`   MongoDB     : ${process.env.MONGODB_URI}`);
        console.log(`   Health      : http://localhost:${PORT}/api/health\n`);
    });
};

startServer();

module.exports = app;
