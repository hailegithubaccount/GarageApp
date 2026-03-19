const router = require('express').Router();
const { addVehicle, getMyVehicles, getVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');

const upload = require('../middleware/upload');

// Debug middleware for vehicle routes
router.use((req, res, next) => {
    console.log(`[VehicleRoute] ${req.method} ${req.originalUrl}`);
    console.log(`[VehicleRoute] Content-Type: ${req.headers['content-type']}`);
    next();
});

router.use(protect, authorize('customer'));
router.route('/').get(getMyVehicles).post(upload.single('image'), addVehicle);
router.route('/:id').get(getVehicle).put(updateVehicle).delete(deleteVehicle);

module.exports = router;
