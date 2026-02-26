const router = require('express').Router();
const { createServiceRequest, getServiceRequests, getServiceRequest, approveRequest, rejectRequest, assignMechanic, updateStatus, getServiceHistory } = require('../controllers/serviceRequestController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/history', authorize('customer'), getServiceHistory);
router.route('/').get(getServiceRequests).post(authorize('customer'), createServiceRequest);
router.get('/:id', getServiceRequest);
router.put('/:id/approve', authorize('admin'), approveRequest);
router.put('/:id/reject', authorize('admin'), rejectRequest);
router.put('/:id/assign', authorize('admin'), assignMechanic);
router.put('/:id/status', authorize('mechanic'), updateStatus);

module.exports = router;
