const router = require('express').Router();
const { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword, updateLocation } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/profile/location', protect, updateLocation);
router.post('/upload-profile-image', protect, upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const profileImageUrl = `${req.protocol}://${req.get('host')}/uploads/profiles/${req.file.filename}`;

        // Update user in database
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user._id, { profileImage: profileImageUrl });

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            profileImage: profileImageUrl,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
