const crypto = require('crypto');
const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');
const { createAuditLog } = require('../utils/auditLogger');
const { sendPasswordResetEmail } = require('../services/emailService');
const { ROLES, USER_STATUS } = require('../config/constants');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
    try {
        const { fullName, email, phoneNumber, password, role } = req.body;

        // Only allow customer, mechanic, and admin registration via this endpoint
        const allowedRoles = [ROLES.CUSTOMER, ROLES.MECHANIC, ROLES.ADMIN];
        if (role && !allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Allowed roles: customer, mechanic, admin',
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { phoneNumber }],
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or phone number already exists',
            });
        }

        // Admin accounts require super admin approval (status = pending)
        const status =
            role === ROLES.ADMIN ? USER_STATUS.PENDING : USER_STATUS.ACTIVE;

        const user = await User.create({
            fullName,
            email,
            phoneNumber,
            password,
            role: role || ROLES.CUSTOMER,
            status,
        });

        // Audit log
        await createAuditLog({
            userId: user._id,
            action: 'USER_REGISTERED',
            entityType: 'User',
            entityId: user._id,
            details: `New ${user.role} registered`,
            ipAddress: req.ip,
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user,
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        // Find user and include password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Check status
        if (user.status !== USER_STATUS.ACTIVE) {
            return res.status(403).json({
                success: false,
                message: `Your account is ${user.status}. Please contact support.`,
            });
        }

        // Audit log
        await createAuditLog({
            userId: user._id,
            action: 'USER_LOGIN',
            entityType: 'User',
            entityId: user._id,
            ipAddress: req.ip,
        });

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('garage');
        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/update-profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
    try {
        const { fullName, phoneNumber, languagePreference, profileImage, fcmToken } = req.body;

        const updateFields = {};
        if (fullName) updateFields.fullName = fullName;
        if (phoneNumber) updateFields.phoneNumber = phoneNumber;
        if (languagePreference) updateFields.languagePreference = languagePreference;
        if (profileImage) updateFields.profileImage = profileImage;
        if (fcmToken) updateFields.fcmToken = fcmToken;

        const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password');

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Forgot password - send reset email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with this email',
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save({ validateBeforeSave: false });

        // Send email
        try {
            await sendPasswordResetEmail(user.email, resetToken);
            res.status(200).json({
                success: true,
                message: 'Password reset email sent',
            });
        } catch (emailError) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({
                success: false,
                message: 'Failed to send reset email. Please try again.',
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reset password with token
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
            });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful',
        });
    } catch (error) {
        next(error);
    }
};
