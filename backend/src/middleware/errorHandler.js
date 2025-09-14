import { logger } from '../utils/logger.js';

// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected field in file upload';
    error = { message, statusCode: 400 };
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files uploaded';
    error = { message, statusCode: 400 };
  }

  // Rate limit errors
  if (err.status === 429) {
    const message = 'Too many requests, please try again later';
    error = { message, statusCode: 429 };
  }

  // Database connection errors
  if (err.name === 'MongoNetworkError') {
    const message = 'Database connection failed';
    error = { message, statusCode: 503 };
  }

  if (err.name === 'MongoTimeoutError') {
    const message = 'Database operation timeout';
    error = { message, statusCode: 504 };
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Don't leak error details in production
  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Add additional error details for specific error types
  if (err.name === 'ValidationError') {
    response.errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
  }

  if (err.code === 11000) {
    response.field = Object.keys(err.keyValue)[0];
  }

  res.status(statusCode).json(response);
};

// Async error handler wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Validation error handler
export const handleValidationError = (errors) => {
  const formattedErrors = errors.array().map(error => ({
    field: error.path || error.param,
    message: error.msg,
    value: error.value
  }));

  return {
    success: false,
    message: 'Validation failed',
    errors: formattedErrors
  };
};

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response formatter
export const formatErrorResponse = (error, req) => {
  const baseResponse = {
    success: false,
    message: error.message || 'An error occurred',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Add request ID if available
  if (req.id) {
    baseResponse.requestId = req.id;
  }

  // Add user information if available
  if (req.user) {
    baseResponse.userId = req.user._id;
  }

  // Add additional error details in development
  if (process.env.NODE_ENV === 'development') {
    baseResponse.stack = error.stack;
    baseResponse.error = error;
  }

  return baseResponse;
};

// Error logging helper
export const logError = (error, req, additionalInfo = {}) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?._id,
    ...additionalInfo
  };

  if (error.statusCode >= 500) {
    logger.error('Server Error:', errorInfo);
  } else {
    logger.warn('Client Error:', errorInfo);
  }
};
