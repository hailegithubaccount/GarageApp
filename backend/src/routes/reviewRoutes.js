const router = require('express').Router();
const { submitReview, getGarageReviews, getMyReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.get('/garage/:garageId', getGarageReviews);
router.use(protect);
router.post('/', authorize('customer'), submitReview);
router.get('/my-reviews', authorize('customer'), getMyReviews);

module.exports = router;
