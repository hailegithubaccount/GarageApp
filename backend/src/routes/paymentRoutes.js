const router = require('express').Router();
const { initiatePayment, verifyPaymentCallback, recordCashPayment, getPaymentByRequest, getPayments } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/verify/:txRef', verifyPaymentCallback); // Chapa callback (public)
router.use(protect);
router.get('/', getPayments);
router.post('/initiate', authorize('customer'), initiatePayment);
router.post('/cash', authorize('admin'), recordCashPayment);
router.get('/:requestId', getPaymentByRequest);

module.exports = router;
