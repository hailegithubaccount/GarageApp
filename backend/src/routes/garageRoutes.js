const router = require('express').Router();
const { createGarage, getGarages, getNearbyGarages, getGarage, updateGarage, getGarageServices, addGarageService, updateGarageService, deleteGarageService, getGarageMechanics, uploadGarageImages, updateGarageStatus, getMyGarages, deleteGarageImage } = require('../controllers/garageController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/nearby', protect, authorize('customer'), getNearbyGarages);
router.get('/my-garages', protect, authorize('admin'), getMyGarages);
router.route('/')
    .get(getGarages)
    .post(protect, authorize('admin', 'super_admin'), upload.array('garageImages', 5), createGarage);

router.route('/:id')
    .get(getGarage)
    .put(protect, authorize('admin', 'super_admin'), updateGarage);

router.put('/:id/status', protect, updateGarageStatus);
router.delete('/:id/images', protect, authorize('admin', 'super_admin'), deleteGarageImage);
router.post('/:id/upload-images', protect, authorize('admin', 'super_admin'), upload.array('garageImages', 5), uploadGarageImages);

router.route('/:id/services').get(getGarageServices).post(protect, authorize('admin'), addGarageService);
router.route('/:id/services/:serviceId').put(protect, authorize('admin'), updateGarageService).delete(protect, authorize('admin'), deleteGarageService);
router.get('/:id/mechanics', protect, authorize('admin'), getGarageMechanics);

module.exports = router;
