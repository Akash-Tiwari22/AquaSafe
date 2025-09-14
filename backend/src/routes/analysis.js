import express from 'express';
import Analysis from '../database/models/Analysis.js';
import WaterQualityData from '../database/models/WaterQualityData.js';
import { authenticate, checkResourceAccess } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logAnalysis } from '../utils/logger.js';
import { performComprehensiveAnalysis } from '../utils/waterQualityAnalysis.js';

const router = express.Router();

// @route   POST /api/analysis
// @desc    Create new analysis
// @access  Private
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const {
    dataIds,
    analysisType = 'comprehensive',
    title,
    description,
    parameters = {}
  } = req.body;
  
  if (!dataIds || !Array.isArray(dataIds) || dataIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Data IDs array is required'
    });
  }
  
  // Verify data ownership
  const dataPoints = await WaterQualityData.find({
    _id: { $in: dataIds },
    userId: req.user._id
  });
  
  if (dataPoints.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No data found for analysis'
    });
  }
  
  // Create analysis record
  const analysis = new Analysis({
    userId: req.user._id,
    dataId: dataIds[0], // Primary data ID
    analysisType,
    title: title || `${analysisType} Analysis - ${new Date().toLocaleDateString()}`,
    description,
    parameters: {
      timeRange: parameters.timeRange || {
        startDate: Math.min(...dataPoints.map(d => new Date(d.sampleDate))),
        endDate: Math.max(...dataPoints.map(d => new Date(d.sampleDate)))
      },
      selectedParameters: parameters.selectedParameters || [],
      analysisMethod: parameters.analysisMethod || 'statistical',
      confidenceLevel: parameters.confidenceLevel || 0.95
    },
    status: 'pending'
  });
  
  await analysis.save();
  
  // Start analysis processing (async)
  processAnalysis(analysis._id, dataPoints).catch(error => {
    console.error('Analysis processing failed:', error);
  });
  
  res.status(201).json({
    success: true,
    message: 'Analysis created successfully',
    data: analysis
  });
}));

// @route   GET /api/analysis
// @desc    Get user's analyses
// @access  Private
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    analysisType, 
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;
  
  const query = { userId: req.user._id };
  if (analysisType) query.analysisType = analysisType;
  if (status) query.status = status;
  
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [analyses, total] = await Promise.all([
    Analysis.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-results -__v'),
    Analysis.countDocuments(query)
  ]);
  
  res.json({
    success: true,
    data: {
      analyses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// @route   GET /api/analysis/:id
// @desc    Get specific analysis
// @access  Private
router.get('/:id', authenticate, checkResourceAccess(Analysis, 'id'), asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.resource
  });
}));

// @route   PUT /api/analysis/:id
// @desc    Update analysis
// @access  Private
router.put('/:id', authenticate, checkResourceAccess(Analysis, 'id'), asyncHandler(async (req, res) => {
  const { title, description, isPublic, tags } = req.body;
  
  if (title) req.resource.title = title;
  if (description) req.resource.description = description;
  if (typeof isPublic === 'boolean') req.resource.isPublic = isPublic;
  if (tags) req.resource.tags = tags;
  
  const updated = await req.resource.save();
  
  res.json({
    success: true,
    message: 'Analysis updated successfully',
    data: updated
  });
}));

// @route   DELETE /api/analysis/:id
// @desc    Delete analysis
// @access  Private
router.delete('/:id', authenticate, checkResourceAccess(Analysis, 'id'), asyncHandler(async (req, res) => {
  await Analysis.deleteOne({ _id: req.params.id });
  
  res.json({
    success: true,
    message: 'Analysis deleted successfully'
  });
}));

// @route   POST /api/analysis/:id/rerun
// @desc    Rerun analysis
// @access  Private
router.post('/:id/rerun', authenticate, checkResourceAccess(Analysis, 'id'), asyncHandler(async (req, res) => {
  if (req.resource.status === 'processing') {
    return res.status(400).json({
      success: false,
      message: 'Analysis is already being processed'
    });
  }
  
  // Reset status
  req.resource.status = 'pending';
  req.resource.processingStarted = null;
  req.resource.processingCompleted = null;
  req.resource.processingError = null;
  await req.resource.save();
  
  // Get data points
  const dataPoints = await WaterQualityData.find({
    _id: { $in: req.resource.dataIds || [req.resource.dataId] },
    userId: req.user._id
  });
  
  // Start processing
  processAnalysis(req.resource._id, dataPoints).catch(error => {
    console.error('Analysis processing failed:', error);
  });
  
  res.json({
    success: true,
    message: 'Analysis rerun initiated'
  });
}));

// @route   POST /api/analysis/:id/share
// @desc    Share analysis with user
// @access  Private
router.post('/:id/share', authenticate, checkResourceAccess(Analysis, 'id'), asyncHandler(async (req, res) => {
  const { userId, permission = 'view' } = req.body;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }
  
  await req.resource.shareWith(userId, permission);
  
  res.json({
    success: true,
    message: 'Analysis shared successfully'
  });
}));

// @route   DELETE /api/analysis/:id/share/:userId
// @desc    Remove sharing permission
// @access  Private
router.delete('/:id/share/:userId', authenticate, checkResourceAccess(Analysis, 'id'), asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  await req.resource.unshareWith(userId);
  
  res.json({
    success: true,
    message: 'Sharing permission removed'
  });
}));

// @route   GET /api/analysis/public
// @desc    Get public analyses
// @access  Public
router.get('/public', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    analysisType, 
    category,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;
  
  const query = { isPublic: true };
  if (analysisType) query.analysisType = analysisType;
  if (category) query.category = category;
  
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [analyses, total] = await Promise.all([
    Analysis.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-results -__v')
      .populate('userId', 'name organization'),
    Analysis.countDocuments(query)
  ]);
  
  res.json({
    success: true,
    data: {
      analyses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// @route   GET /api/analysis/statistics
// @desc    Get analysis statistics
// @access  Private
router.get('/statistics', authenticate, asyncHandler(async (req, res) => {
  const stats = await Analysis.getStatistics(req.user._id);
  
  res.json({
    success: true,
    data: stats[0] || {
      totalAnalyses: 0,
      completedAnalyses: 0,
      pendingAnalyses: 0,
      processingAnalyses: 0,
      failedAnalyses: 0,
      avgProcessingTime: 0
    }
  });
}));

// Process analysis (async function)
async function processAnalysis(analysisId, dataPoints) {
  const startTime = Date.now();
  
  try {
    // Update status to processing
    await Analysis.findByIdAndUpdate(analysisId, {
      status: 'processing',
      processingStarted: new Date()
    });
    
    // Perform comprehensive analysis
    const analysisResults = performComprehensiveAnalysis(dataPoints);
    
    // Update analysis with results
    await Analysis.findByIdAndUpdate(analysisId, {
      status: 'completed',
      processingCompleted: new Date(),
      results: {
        summary: analysisResults.summary,
        analysisResults: analysisResults.analysisResults,
        trends: analysisResults.trends,
        overallRecommendations: analysisResults.overallRecommendations,
        dataQuality: analysisResults.dataQuality
      }
    });
    
    const duration = Date.now() - startTime;
    logAnalysis('comprehensive', null, analysisId, 'completed', duration, {
      dataPointCount: dataPoints.length
    });
    
  } catch (error) {
    // Update status to failed
    await Analysis.findByIdAndUpdate(analysisId, {
      status: 'failed',
      processingCompleted: new Date(),
      processingError: error.message
    });
    
    const duration = Date.now() - startTime;
    logAnalysis('comprehensive', null, analysisId, 'failed', duration, {
      error: error.message
    });
  }
}

export default router;
