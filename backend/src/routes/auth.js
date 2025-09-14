import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../database/models/User.js';
import { 
  generateToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  authenticate,
  sensitiveOperationLimit
} from '../middleware/auth.js';
import { asyncHandler, handleValidationError } from '../middleware/errorHandler.js';
import { logAuth } from '../utils/logger.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('organization')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Organization name cannot exceed 100 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(handleValidationError(errors));
  }

  const { name, email, password, organization } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    logAuth('register_attempt', null, req.ip, false, { email, reason: 'user_exists' });
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Create user
  const user = new User({
    name,
    email,
    password,
    organization
  });

  // Generate email verification token
  const verificationToken = user.createEmailVerificationToken();
  await user.save();

  // Send verification email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify your AquaSafe account',
      template: 'emailVerification',
      data: {
        name: user.name,
        verificationToken,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
      }
    });
  } catch (emailError) {
    console.error('Email sending failed:', emailError);
    // Don't fail registration if email sending fails
  }

  logAuth('register_success', user._id, req.ip, true, { email });

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please check your email for verification.',
    data: {
      user: user.profile
    }
  });
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, sensitiveOperationLimit(5, 15 * 60 * 1000), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(handleValidationError(errors));
  }

  const { email, password, rememberMe } = req.body;

  // Get user with password
  const user = await User.findByEmail(email).select('+password');
  if (!user) {
    logAuth('login_attempt', null, req.ip, false, { email, reason: 'user_not_found' });
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if account is active
  if (!user.isActive) {
    logAuth('login_attempt', user._id, req.ip, false, { email, reason: 'account_inactive' });
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    logAuth('login_attempt', user._id, req.ip, false, { email, reason: 'invalid_password' });
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate tokens
  const tokenPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    type: 'access'
  };

  const accessToken = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken({ userId: user._id, type: 'refresh' });

  // Add refresh token to user
  await user.addRefreshToken(refreshToken);

  // Clean expired tokens
  await user.cleanExpiredTokens();

  logAuth('login_success', user._id, req.ip, true, { email });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.profile,
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  });
}));

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Get user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Check if refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some(rt => rt.token === refreshToken);
    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const tokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      type: 'access'
    };

    const newAccessToken = generateToken(tokenPayload);

    logAuth('token_refresh', user._id, req.ip, true);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        expiresIn: process.env.JWT_EXPIRE || '7d'
      }
    });
  } catch (error) {
    logAuth('token_refresh', null, req.ip, false, { reason: 'invalid_token' });
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
}));

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Remove specific refresh token
    await req.user.removeRefreshToken(refreshToken);
  } else {
    // Remove all refresh tokens
    req.user.refreshTokens = [];
    await req.user.save();
  }

  logAuth('logout', req.user._id, req.ip, true);

  res.json({
    success: true,
    message: 'Logout successful'
  });
}));

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', forgotPasswordValidation, sensitiveOperationLimit(3, 15 * 60 * 1000), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(handleValidationError(errors));
  }

  const { email } = req.body;

  const user = await User.findByEmail(email);
  if (!user) {
    // Don't reveal if user exists or not
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  // Generate password reset token
  const resetToken = user.createPasswordResetToken();
  await user.save();

  // Send reset email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your AquaSafe password',
      template: 'passwordReset',
      data: {
        name: user.name,
        resetToken,
        resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
      }
    });
  } catch (emailError) {
    console.error('Email sending failed:', emailError);
    return res.status(500).json({
      success: false,
      message: 'Failed to send reset email'
    });
  }

  logAuth('forgot_password', user._id, req.ip, true, { email });

  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.'
  });
}));

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post('/reset-password', resetPasswordValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(handleValidationError(errors));
  }

  const { token, password } = req.body;

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  logAuth('password_reset', user._id, req.ip, true);

  res.json({
    success: true,
    message: 'Password reset successfully'
  });
}));

// @route   POST /api/auth/verify-email
// @desc    Verify email address
// @access  Public
router.post('/verify-email', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Verification token is required'
    });
  }

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token'
    });
  }

  // Verify email
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  logAuth('email_verification', user._id, req.ip, true);

  res.json({
    success: true,
    message: 'Email verified successfully'
  });
}));

// @route   POST /api/auth/resend-verification
// @desc    Resend email verification
// @access  Public
router.post('/resend-verification', forgotPasswordValidation, sensitiveOperationLimit(3, 15 * 60 * 1000), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(handleValidationError(errors));
  }

  const { email } = req.body;

  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: 'Email is already verified'
    });
  }

  // Generate new verification token
  const verificationToken = user.createEmailVerificationToken();
  await user.save();

  // Send verification email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify your AquaSafe account',
      template: 'emailVerification',
      data: {
        name: user.name,
        verificationToken,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
      }
    });
  } catch (emailError) {
    console.error('Email sending failed:', emailError);
    return res.status(500).json({
      success: false,
      message: 'Failed to send verification email'
    });
  }

  logAuth('resend_verification', user._id, req.ip, true, { email });

  res.json({
    success: true,
    message: 'Verification email sent successfully'
  });
}));

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user.profile
    }
  });
}));

export default router;
