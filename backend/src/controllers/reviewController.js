const Review = require('../models/Review');
const Garage = require('../models/Garage');
const ServiceRequest = require('../models/ServiceRequest');
const { REQUEST_STATUS } = require('../config/constants');

// @desc    Submit a review
// @route   POST /api/reviews
// @access  Customer
exports.submitReview = async (req, res, next) => {
    try {
        const { garageId, serviceRequestId, rating, comment } = req.body;

        // Verify service was completed
        if (serviceRequestId) {
            const sr = await ServiceRequest.findOne({ _id: serviceRequestId, customer: req.user._id, status: REQUEST_STATUS.COMPLETED });
            if (!sr) return res.status(400).json({ success: false, message: 'Can only review completed services' });
        }

        const review = await Review.create({
            customer: req.user._id, garage: garageId,
            serviceRequest: serviceRequestId || null, rating, comment,
        });

        // Update garage average rating
        const reviews = await Review.find({ garage: garageId });
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await Garage.findByIdAndUpdate(garageId, { averageRating: Math.round(avg * 10) / 10, totalReviews: reviews.length });

        res.status(201).json({ success: true, message: 'Review submitted', data: review });
    } catch (error) { next(error); }
};

// @desc    Get reviews for a garage
// @route   GET /api/reviews/garage/:garageId
exports.getGarageReviews = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const reviews = await Review.find({ garage: req.params.garageId })
            .populate('customer', 'fullName profileImage')
            .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
        const total = await Review.countDocuments({ garage: req.params.garageId });
        res.status(200).json({ success: true, count: reviews.length, total, data: reviews });
    } catch (error) { next(error); }
};

// @desc    Get my reviews
// @route   GET /api/reviews/my-reviews
exports.getMyReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ customer: req.user._id })
            .populate('garage', 'garageName').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (error) { next(error); }
};
