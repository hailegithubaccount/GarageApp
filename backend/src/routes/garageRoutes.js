const router = require('express').Router();
const { createGarage, getGarages, getNearbyGarages, getGarage, updateGarage, getGarageServices, addGarageService, updateGarageService, deleteGarageService, uploadGarageImages } = require('../controllers/garageController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/nearby', protect, authorize('customer'), getNearbyGarages);
router.route('/').get(getGarages).post(protect, authorize('admin'), createGarage);
router.route('/:id').get(getGarage).put(protect, authorize('admin', 'super_admin'), updateGarage);

router.post('/:id/upload-images', protect, authorize('admin', 'super_admin'), upload.array('garageImages', 10), uploadGarageImages);

router.route('/:id/services').get(getGarageServices).post(protect, authorize('admin', 'super_admin'), addGarageService);
router.route('/:id/services/:serviceId').put(protect, authorize('admin', 'super_admin'), updateGarageService).delete(protect, authorize('admin', 'super_admin'), deleteGarageService);

module.exports = router;
