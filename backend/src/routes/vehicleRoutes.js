const router = require('express').Router();
const { addVehicle, getMyVehicles, getVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('customer'));
router.route('/').get(getMyVehicles).post(addVehicle);
router.route('/:id').get(getVehicle).put(updateVehicle).delete(deleteVehicle);

module.exports = router;
