import jwt from 'jsonwebtoken';
import User from '../database/models/User.js';
import { logger } from '../utils/logger.js';

// Generate JWT token
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Generate refresh token
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  });
};

// Verify JWT token
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    // Check if token is in user's refresh tokens (for logout functionality)
    const tokenExists = user.refreshTokens.some(rt => rt.token === token);
    if (!tokenExists && decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Token not found in user session.'
      });
    }

    // Add user to request object
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      req.userId = null;
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      req.user = null;
      req.userId = null;
      return next();
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      req.user = null;
      req.userId = null;
      return next();
    }

    // Add user to request object
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    req.user = null;
    req.userId = null;
    next();
  }
};

// Authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Check if user owns resource
export const checkOwnership = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    // Admin users can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        message: 'Resource user ID not provided.'
      });
    }

    if (resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }

    next();
  };
};

// Check if user can access resource (owner or shared)
export const checkResourceAccess = (Model, resourceIdField = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Authentication required.'
        });
      }

      // Admin users can access any resource
      if (req.user.role === 'admin') {
        return next();
      }

      const resourceId = req.params[resourceIdField];
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID not provided.'
        });
      }

      // Find the resource
      const resource = await Model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found.'
        });
      }

      // Check if user has access to the resource
      if (resource.hasAccess && typeof resource.hasAccess === 'function') {
        const hasAccess = resource.hasAccess(req.user._id);
        if (!hasAccess) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. You do not have permission to access this resource.'
          });
        }
      } else if (resource.userId && resource.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }

      // Add resource to request object
      req.resource = resource;
      
      next();
    } catch (error) {
      logger.error('Resource access check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to check resource access.'
      });
    }
  };
};

// Rate limiting for sensitive operations
export const sensitiveOperationLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();
  
  return (req, res, next) => {
    const key = req.ip + ':' + req.user?._id;
    const now = Date.now();
    
    if (!attempts.has(key)) {
      attempts.set(key, { count: 1, firstAttempt: now });
      return next();
    }
    
    const userAttempts = attempts.get(key);
    
    // Reset if window has passed
    if (now - userAttempts.firstAttempt > windowMs) {
      attempts.set(key, { count: 1, firstAttempt: now });
      return next();
    }
    
    // Check if max attempts exceeded
    if (userAttempts.count >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Please try again later.',
        retryAfter: Math.ceil((userAttempts.firstAttempt + windowMs - now) / 1000)
      });
    }
    
    // Increment attempt count
    userAttempts.count++;
    attempts.set(key, userAttempts);
    
    next();
  };
};

// Email verification required
export const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication required.'
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required. Please verify your email address.',
      code: 'EMAIL_VERIFICATION_REQUIRED'
    });
  }

  next();
};

// Subscription check
export const requireSubscription = (requiredPlan) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    const planHierarchy = ['free', 'basic', 'premium', 'enterprise'];
    const userPlanIndex = planHierarchy.indexOf(req.user.subscription?.plan || 'free');
    const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);

    if (userPlanIndex < requiredPlanIndex || !req.user.subscription?.isActive) {
      return res.status(403).json({
        success: false,
        message: `This feature requires a ${requiredPlan} subscription or higher.`,
        code: 'SUBSCRIPTION_REQUIRED',
        requiredPlan
      });
    }

    next();
  };
};
