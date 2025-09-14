import express from 'express';
import User from '../database/models/User.js';
import { authenticate, authorize, requireEmailVerification } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { body, validationResult } from 'express-validator';
import { logAuth } from '../utils/logger.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user.profile
    }
  });
}));

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('organization')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Organization name cannot exceed 100 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  
  const { name, organization } = req.body;
  
  if (name) req.user.name = name;
  if (organization !== undefined) req.user.organization = organization;
  
  const updated = await req.user.save();
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: updated.profile
    }
  });
}));

// @route   PUT /api/users/password
// @desc    Update user password
// @access  Private
router.put('/password', authenticate, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  
  const { currentPassword, newPassword } = req.body;
  
  // Verify current password
  const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }
  
  // Update password
  req.user.password = newPassword;
  await req.user.save();
  
  logAuth('password_change', req.user._id, req.ip, true);
  
  res.json({
    success: true,
    message: 'Password updated successfully'
  });
}));

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', authenticate, asyncHandler(async (req, res) => {
  const { theme, notifications, dashboard } = req.body;
  
  if (theme) {
    req.user.preferences.theme = theme;
  }
  
  if (notifications) {
    req.user.preferences.notifications = {
      ...req.user.preferences.notifications,
      ...notifications
    };
  }
  
  if (dashboard) {
    req.user.preferences.dashboard = {
      ...req.user.preferences.dashboard,
      ...dashboard
    };
  }
  
  const updated = await req.user.save();
  
  res.json({
    success: true,
    message: 'Preferences updated successfully',
    data: {
      preferences: updated.preferences
    }
  });
}));

// @route   POST /api/users/verify-email
// @desc    Resend email verification
// @access  Private
router.post('/verify-email', authenticate, asyncHandler(async (req, res) => {
  if (req.user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: 'Email is already verified'
    });
  }
  
  // Generate new verification token
  const verificationToken = req.user.createEmailVerificationToken();
  await req.user.save();
  
  // Send verification email
  try {
    await sendEmail({
      to: req.user.email,
      subject: 'Verify your AquaSafe account',
      template: 'emailVerification',
      data: {
        name: req.user.name,
        verificationToken,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
      }
    });
    
    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email'
    });
  }
}));

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', authenticate, [
  body('password')
    .notEmpty()
    .withMessage('Password is required for account deletion')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  
  const { password } = req.body;
  
  // Verify password
  const isPasswordValid = await req.user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Password is incorrect'
    });
  }
  
  // Deactivate account instead of deleting
  req.user.isActive = false;
  await req.user.save();
  
  logAuth('account_deletion', req.user._id, req.ip, true);
  
  res.json({
    success: true,
    message: 'Account deactivated successfully'
  });
}));

// @route   GET /api/users/activity
// @desc    Get user activity log
// @access  Private
router.get('/activity', authenticate, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  
  // This would typically come from an activity log collection
  // For now, return a placeholder
  const activities = [
    {
      id: '1',
      type: 'login',
      description: 'Logged in successfully',
      timestamp: new Date(),
      ip: req.ip
    },
    {
      id: '2',
      type: 'data_upload',
      description: 'Uploaded water quality data',
      timestamp: new Date(Date.now() - 3600000),
      ip: req.ip
    }
  ];
  
  res.json({
    success: true,
    data: {
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: activities.length,
        pages: 1
      }
    }
  });
}));

// @route   GET /api/users/statistics
// @desc    Get user statistics
// @access  Private
router.get('/statistics', authenticate, asyncHandler(async (req, res) => {
  const { WaterQualityData } = await import('../database/models/WaterQualityData.js');
  const { Analysis } = await import('../database/models/Analysis.js');
  const { Report } = await import('../database/models/Report.js');
  
  const [dataStats, analysisStats, reportStats] = await Promise.all([
    WaterQualityData.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          totalSamples: { $sum: 1 },
          totalLocations: { $addToSet: '$location.name' },
          avgHMPI: { $avg: '$calculatedMetrics.hmpi.value' },
          avgWQI: { $avg: '$calculatedMetrics.wqi.value' }
        }
      }
    ]),
    Analysis.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          totalAnalyses: { $sum: 1 },
          completedAnalyses: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]),
    Report.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          completedReports: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalDownloads: { $sum: { $size: '$downloads' } }
        }
      }
    ])
  ]);
  
  res.json({
    success: true,
    data: {
      data: dataStats[0] || {
        totalSamples: 0,
        totalLocations: 0,
        avgHMPI: 0,
        avgWQI: 0
      },
      analysis: analysisStats[0] || {
        totalAnalyses: 0,
        completedAnalyses: 0
      },
      reports: reportStats[0] || {
        totalReports: 0,
        completedReports: 0,
        totalDownloads: 0
      },
      account: {
        memberSince: req.user.createdAt,
        lastLogin: req.user.lastLogin,
        emailVerified: req.user.isEmailVerified,
        subscription: req.user.subscription
      }
    }
  });
}));

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get('/', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    role, 
    isActive,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;
  
  const query = {};
  if (role) query.role = role;
  if (typeof isActive === 'string') query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { organization: { $regex: search, $options: 'i' } }
    ];
  }
  
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [users, total] = await Promise.all([
    User.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password -refreshTokens -__v'),
    User.countDocuments(query)
  ]);
  
  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// @route   PUT /api/users/:id/role
// @desc    Update user role (admin only)
// @access  Private (Admin)
router.put('/:id/role', authenticate, authorize('admin'), [
  body('role')
    .isIn(['user', 'admin', 'analyst'])
    .withMessage('Invalid role')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  
  const { id } = req.params;
  const { role } = req.body;
  
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  user.role = role;
  await user.save();
  
  res.json({
    success: true,
    message: 'User role updated successfully',
    data: {
      user: user.profile
    }
  });
}));

// @route   PUT /api/users/:id/status
// @desc    Update user status (admin only)
// @access  Private (Admin)
router.put('/:id/status', authenticate, authorize('admin'), [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  
  const { id } = req.params;
  const { isActive } = req.body;
  
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  user.isActive = isActive;
  await user.save();
  
  res.json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: {
      user: user.profile
    }
  });
}));

export default router;
