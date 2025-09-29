import express from 'express';
import { uploadSingle } from '../middleware/upload.js';
import { processFile, validateWaterQualityData } from '../utils/fileProcessor.js';
import { performComprehensiveAnalysis } from '../utils/waterQualityAnalysis.js';
import WaterQualityData from '../database/models/WaterQualityData.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logFileOperation, logAnalysis } from '../utils/logger.js';
import { sendEmail } from '../utils/email.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// @route   POST /api/upload/water-quality-public
// @desc    Upload and process water quality data file (public access for testing)
// @access  Public
router.post('/water-quality-public', uploadSingle('file'), asyncHandler(async (req, res) => {
  const { dataSource = 'uploaded' } = req.body;
  const file = req.file;
  
  try {
    console.log('Processing file:', file.originalname, 'Type:', file.mimetype);
    
    // Determine file type from original filename extension (more reliable than MIME type)
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    // Process the uploaded file
    const processedData = await processFile(file.path, ext);
    
    console.log('Processed data length:', processedData ? processedData.length : 'null');
    
    if (!processedData || processedData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid data found in the uploaded file'
      });
    }
    
    // Validate each data point
    const validationErrors = [];
    const validData = [];
    
    processedData.forEach((data, index) => {
      const validation = validateWaterQualityData(data);
      if (!validation.isValid) {
        validationErrors.push({
          record: index + 1,
          errors: validation.errors
        });
      } else {
        validData.push(data);
      }
    });
    
    if (validData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid data points found in the file',
        errors: validationErrors
      });
    }
    
    // Perform comprehensive analysis
    const analysis = performComprehensiveAnalysis(validData);
    
    // Clean up uploaded file
    fs.unlinkSync(file.path);
    
    logFileOperation('process_complete_public', file.originalname, file.size, null, true, {
      recordCount: validData.length,
      analysisResults: analysis.summary
    });
    
    res.json({
      success: true,
      message: 'File processed successfully',
      data: {
        fileName: file.originalname,
        totalRecords: processedData.length,
        validRecords: validData.length,
        invalidRecords: validationErrors.length,
        analysis: analysis.summary,
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined
      }
    });
    
  } catch (error) {
    console.error('Upload processing error:', error);
    
    // Clean up file on error
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    logFileOperation('process_failed_public', file?.originalname || 'unknown', file?.size || 0, null, false, {
      error: error.message,
      statusCode: error.statusCode,
      stack: error.stack
    });
    
    // Return error response with appropriate status code if available
    const statusCode = error.statusCode && Number.isInteger(error.statusCode) ? error.statusCode : 500;
    const message = error.message || 'File processing failed';
    return res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
    });
  }
}));

// @route   POST /api/upload/water-quality
// @desc    Upload and process water quality data file
// @access  Private
router.post('/water-quality', authenticate, uploadSingle('file'), asyncHandler(async (req, res) => {
  const { dataSource = 'uploaded' } = req.body;
  const file = req.file;
  
  try {
    // Determine file type from original filename extension (more reliable than MIME type)
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    // Process the uploaded file
    const processedData = await processFile(file.path, ext);
    
    if (!processedData || processedData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid data found in the uploaded file'
      });
    }
    
    // Validate each data point
    const validationErrors = [];
    const validData = [];
    
    processedData.forEach((data, index) => {
      const validation = validateWaterQualityData(data);
      if (!validation.isValid) {
        validationErrors.push({
          record: index + 1,
          errors: validation.errors
        });
      } else {
        validData.push(data);
      }
    });
    
    if (validData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid data points found in the file',
        errors: validationErrors
      });
    }
    
    // Perform comprehensive analysis
    const analysis = performComprehensiveAnalysis(validData);
    
    // Save data to database
    const savedData = [];
    for (const dataPoint of validData) {
      const waterQualityData = new WaterQualityData({
        userId: req.user._id,
        fileName: file.originalname,
        fileType: file.mimetype.split('/')[1],
        fileSize: file.size,
        dataSource,
        sampleDate: dataPoint.sampleDate,
        location: dataPoint.location,
        parameters: dataPoint.parameters,
        processingStatus: 'completed',
        processedAt: new Date()
      });
      
      // Calculate metrics for this data point
      await waterQualityData.calculateMetrics();
      
      const saved = await waterQualityData.save();
      savedData.push(saved);
    }
    
    // Clean up uploaded file
    fs.unlinkSync(file.path);
    
    // Send notification email if user has email notifications enabled
    if (req.user.preferences?.notifications?.email) {
      try {
        const summary = analysis.summary;
        await sendEmail({
          to: req.user.email,
          subject: 'Water quality data processed successfully',
          template: 'dataProcessed',
          data: {
            name: req.user.name,
            fileName: file.originalname,
            status: summary.safePercentage > 80 ? 'safe' : summary.safePercentage > 60 ? 'unsafe' : 'critical',
            hmpi: summary.avgHMPI,
            sampleCount: summary.totalSamples,
            findings: analysis.overallRecommendations.slice(0, 3)
          }
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
      }
    }
    
    logFileOperation('process_complete', file.originalname, file.size, req.user._id, true, {
      recordCount: validData.length,
      analysisResults: analysis.summary
    });
    
    res.json({
      success: true,
      message: 'File processed successfully',
      data: {
        fileName: file.originalname,
        totalRecords: processedData.length,
        validRecords: validData.length,
        invalidRecords: validationErrors.length,
        analysis: analysis.summary,
        dataId: savedData[0]?._id,
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined
      }
    });
    
  } catch (error) {
    // Clean up file on error
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    logFileOperation('process_failed', file.originalname, file.size, req.user._id, false, {
      error: error.message
    });
    
    throw error;
  }
}));

// @route   POST /api/upload/validate
// @desc    Validate water quality data without saving
// @access  Private
router.post('/validate', authenticate, asyncHandler(async (req, res) => {
  const { data } = req.body;
  
  if (!data || !Array.isArray(data)) {
    return res.status(400).json({
      success: false,
      message: 'Data array is required'
    });
  }
  
  const validationResults = data.map((item, index) => {
    const validation = validateWaterQualityData(item);
    return {
      record: index + 1,
      isValid: validation.isValid,
      errors: validation.errors
    };
  });
  
  const validCount = validationResults.filter(r => r.isValid).length;
  const invalidCount = validationResults.filter(r => !r.isValid).length;
  
  res.json({
    success: true,
    data: {
      totalRecords: data.length,
      validRecords: validCount,
      invalidRecords: invalidCount,
      validationResults
    }
  });
}));

// @route   GET /api/upload/sample-data
// @desc    Generate sample water quality data
// @access  Private
router.get('/sample-data', authenticate, asyncHandler(async (req, res) => {
  const { count = 10 } = req.query;
  const { generateSampleData } = await import('../utils/fileProcessor.js');
  
  const sampleData = generateSampleData(parseInt(count));
  
  res.json({
    success: true,
    data: sampleData
  });
}));

// @route   GET /api/upload/template
// @desc    Download CSV template for water quality data
// @access  Private
router.get('/template', authenticate, asyncHandler(async (req, res) => {
  const { format = 'csv' } = req.query;
  
  // Create template data
  const templateData = [{
    date: '2024-01-01',
    location: 'Sample Site 1',
    latitude: 28.6139,
    longitude: 77.2090,
    region: 'Delhi NCR',
    state: 'Delhi',
    country: 'India',
    pH: 7.0,
    temperature: 25,
    turbidity: 2.0,
    totalDissolvedSolids: 200,
    electricalConductivity: 500,
    dissolvedOxygen: 8.0,
    biochemicalOxygenDemand: 2.0,
    chemicalOxygenDemand: 5.0,
    arsenic: 0.005,
    lead: 0.005,
    mercury: 0.0005,
    cadmium: 0.001,
    chromium: 0.025,
    nickel: 0.01,
    copper: 0.5,
    zinc: 1.5,
    iron: 0.15,
    manganese: 0.05,
    nitrate: 22.5,
    nitrite: 1.5,
    phosphate: 0.05,
    ammonia: 0.25,
    totalColiforms: 0,
    fecalColiforms: 0,
    eColi: 0
  }];
  
  if (format === 'csv') {
    // Generate CSV content
    const headers = Object.keys(templateData[0]);
    const csvContent = [
      headers.join(','),
      ...templateData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="water_quality_template.csv"');
    res.send(csvContent);
  } else {
    res.json({
      success: true,
      data: templateData
    });
  }
}));

// @route   GET /api/upload/standards
// @desc    Get water quality standards
// @access  Public
router.get('/standards', asyncHandler(async (req, res) => {
  const { WATER_QUALITY_STANDARDS } = await import('../utils/waterQualityAnalysis.js');
  
  res.json({
    success: true,
    data: WATER_QUALITY_STANDARDS
  });
}));

// @route   DELETE /api/upload/cleanup/:dataId
// @desc    Clean up uploaded data
// @access  Private
router.delete('/cleanup/:dataId', authenticate, asyncHandler(async (req, res) => {
  const { dataId } = req.params;
  
  const data = await WaterQualityData.findOne({
    _id: dataId,
    userId: req.user._id
  });
  
  if (!data) {
    return res.status(404).json({
      success: false,
      message: 'Data not found'
    });
  }
  
  await WaterQualityData.deleteOne({ _id: dataId });
  
  logFileOperation('cleanup', data.fileName, data.fileSize, req.user._id, true, {
    dataId
  });
  
  res.json({
    success: true,
    message: 'Data cleaned up successfully'
  });
}));

// @route   GET /api/upload/status/:dataId
// @desc    Get processing status of uploaded data
// @access  Private
router.get('/status/:dataId', authenticate, asyncHandler(async (req, res) => {
  const { dataId } = req.params;
  
  const data = await WaterQualityData.findOne({
    _id: dataId,
    userId: req.user._id
  }).select('processingStatus processingError processedAt');
  
  if (!data) {
    return res.status(404).json({
      success: false,
      message: 'Data not found'
    });
  }
  
  res.json({
    success: true,
    data: {
      status: data.processingStatus,
      error: data.processingError,
      processedAt: data.processedAt
    }
  });
}));

export default router;
