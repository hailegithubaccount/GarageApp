const router = require('express').Router();
const { getAllGarages, approveGarage, suspendGarage, getAllUsers, updateUserStatus, deleteUser, getAnalytics, getAuditLogs } = require('../controllers/superAdminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('super_admin'));
router.get('/analytics', getAnalytics);
router.get('/garages', getAllGarages);
router.put('/garages/:id/approve', approveGarage);
router.put('/garages/:id/suspend', suspendGarage);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
