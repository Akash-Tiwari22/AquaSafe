import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger, logFileOperation } from '../utils/logger.js';
import { AppError } from './errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv').split(',');
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new AppError('Invalid file type. Only CSV and Excel files are allowed.', 400);
    cb(error, false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 1 // Only one file at a time
  }
});

// Single file upload middleware
export const uploadSingle = (fieldName = 'file') => {
  return (req, res, next) => {
    const uploadHandler = upload.single(fieldName);
    
    uploadHandler(req, res, (err) => {
      if (err) {
        if (err instanceof AppError) {
          return res.status(err.statusCode).json({
            success: false,
            message: err.message
          });
        }
        
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 10MB.'
          });
        }
        
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Unexpected field in file upload.'
          });
        }
        
        logger.error('File upload error:', err);
        return res.status(500).json({
          success: false,
          message: 'File upload failed.'
        });
      }
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded.'
        });
      }
      
      // Log successful upload
      logFileOperation('upload', req.file.originalname, req.file.size, req.user?._id, true, {
        filename: req.file.filename,
        mimetype: req.file.mimetype
      });
      
      next();
    });
  };
};

// Multiple files upload middleware
export const uploadMultiple = (fieldName = 'files', maxCount = 5) => {
  return (req, res, next) => {
    const uploadHandler = upload.array(fieldName, maxCount);
    
    uploadHandler(req, res, (err) => {
      if (err) {
        if (err instanceof AppError) {
          return res.status(err.statusCode).json({
            success: false,
            message: err.message
          });
        }
        
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'One or more files are too large. Maximum size is 10MB per file.'
          });
        }
        
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: `Too many files. Maximum ${maxCount} files allowed.`
          });
        }
        
        logger.error('Multiple file upload error:', err);
        return res.status(500).json({
          success: false,
          message: 'File upload failed.'
        });
      }
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded.'
        });
      }
      
      // Log successful uploads
      req.files.forEach(file => {
        logFileOperation('upload', file.originalname, file.size, req.user?._id, true, {
          filename: file.filename,
          mimetype: file.mimetype
        });
      });
      
      next();
    });
  };
};

// Memory storage for small files (for processing)
const memoryStorage = multer.memoryStorage();

export const uploadToMemory = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for memory storage
    files: 1
  }
});

// Validate file type
export const validateFileType = (file) => {
  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  return allowedTypes.includes(file.mimetype);
};

// Get file extension
export const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

// Validate file size
export const validateFileSize = (file, maxSize = 10 * 1024 * 1024) => {
  return file.size <= maxSize;
};

// Clean up uploaded files
export const cleanupFile = (filePath) => {
  try {
    const fs = require('fs');
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info('File cleaned up successfully', { filePath });
    }
  } catch (error) {
    logger.error('File cleanup failed', { filePath, error: error.message });
  }
};

// Clean up multiple files
export const cleanupFiles = (filePaths) => {
  filePaths.forEach(filePath => {
    cleanupFile(filePath);
  });
};

// Get file info
export const getFileInfo = (file) => {
  return {
    originalName: file.originalname,
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
    path: file.path,
    extension: getFileExtension(file.originalname)
  };
};

export default {
  uploadSingle,
  uploadMultiple,
  uploadToMemory,
  validateFileType,
  validateFileSize,
  getFileExtension,
  cleanupFile,
  cleanupFiles,
  getFileInfo
};
