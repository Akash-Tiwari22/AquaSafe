import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    )
  })
];

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    // Error log file
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  transports,
  exitOnError: false
});

// Create a stream object with a 'write' function that will be used by morgan
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Add request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.info('Request started', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?._id
  });
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user?._id
    });
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Add error logging helper
export const logError = (error, req, additionalInfo = {}) => {
  logger.error('Error occurred', {
    message: error.message,
    stack: error.stack,
    url: req?.originalUrl,
    method: req?.method,
    ip: req?.ip,
    userId: req?.user?._id,
    ...additionalInfo
  });
};

// Add database operation logging
export const logDatabaseOperation = (operation, collection, query, duration) => {
  logger.debug('Database operation', {
    operation,
    collection,
    query: JSON.stringify(query),
    duration: `${duration}ms`
  });
};

// Add authentication logging
export const logAuth = (action, userId, ip, success, details = {}) => {
  const level = success ? 'info' : 'warn';
  logger[level]('Authentication event', {
    action,
    userId,
    ip,
    success,
    ...details
  });
};

// Add file operation logging
export const logFileOperation = (operation, fileName, fileSize, userId, success, details = {}) => {
  const level = success ? 'info' : 'error';
  logger[level]('File operation', {
    operation,
    fileName,
    fileSize,
    userId,
    success,
    ...details
  });
};

// Add analysis logging
export const logAnalysis = (analysisType, userId, dataId, status, duration, details = {}) => {
  const level = status === 'completed' ? 'info' : status === 'failed' ? 'error' : 'warn';
  logger[level]('Analysis operation', {
    analysisType,
    userId,
    dataId,
    status,
    duration: duration ? `${duration}ms` : undefined,
    ...details
  });
};

// Add report generation logging
export const logReportGeneration = (reportType, userId, analysisId, status, duration, details = {}) => {
  const level = status === 'completed' ? 'info' : status === 'failed' ? 'error' : 'warn';
  logger[level]('Report generation', {
    reportType,
    userId,
    analysisId,
    status,
    duration: duration ? `${duration}ms` : undefined,
    ...details
  });
};

// Add performance logging
export const logPerformance = (operation, duration, details = {}) => {
  const level = duration > 5000 ? 'warn' : 'debug';
  logger[level]('Performance metric', {
    operation,
    duration: `${duration}ms`,
    ...details
  });
};

// Add security logging
export const logSecurity = (event, userId, ip, details = {}) => {
  logger.warn('Security event', {
    event,
    userId,
    ip,
    ...details
  });
};

export { logger };
