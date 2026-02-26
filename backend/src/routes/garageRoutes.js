const router = require('express').Router();
const { createGarage, getGarages, getNearbyGarages, getGarage, updateGarage, getGarageServices, addGarageService, updateGarageService, deleteGarageService } = require('../controllers/garageController');
const { protect, authorize } = require('../middleware/auth');

router.get('/nearby', protect, authorize('customer'), getNearbyGarages);
router.route('/').get(getGarages).post(protect, authorize('admin'), createGarage);
router.route('/:id').get(getGarage).put(protect, authorize('admin'), updateGarage);
router.route('/:id/services').get(getGarageServices).post(protect, authorize('admin'), addGarageService);
router.route('/:id/services/:serviceId').put(protect, authorize('admin'), updateGarageService).delete(protect, authorize('admin'), deleteGarageService);

module.exports = router;
