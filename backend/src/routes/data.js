import express from 'express';
import WaterQualityData from '../database/models/WaterQualityData.js';
import { authenticate, checkResourceAccess } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logAnalysis } from '../utils/logger.js';
import { performComprehensiveAnalysis } from '../utils/waterQualityAnalysis.js';

const router = express.Router();

// @route   GET /api/data
// @desc    Get water quality data for user
// @access  Private
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    dataSource, 
    status, 
    startDate, 
    endDate,
    location,
    sortBy = 'sampleDate',
    sortOrder = 'desc'
  } = req.query;
  
  // Build query
  const query = { userId: req.user._id };
  
  if (dataSource) query.dataSource = dataSource;
  if (status) query['calculatedMetrics.overallStatus'] = status;
  if (startDate || endDate) {
    query.sampleDate = {};
    if (startDate) query.sampleDate.$gte = new Date(startDate);
    if (endDate) query.sampleDate.$lte = new Date(endDate);
  }
  if (location) {
    query['location.name'] = { $regex: location, $options: 'i' };
  }
  
  // Build sort
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [data, total] = await Promise.all([
    WaterQualityData.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-parameters -__v'),
    WaterQualityData.countDocuments(query)
  ]);
  
  res.json({
    success: true,
    data: {
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// @route   GET /api/data/:id
// @desc    Get specific water quality data
// @access  Private
router.get('/:id', authenticate, checkResourceAccess(WaterQualityData, 'id'), asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.resource
  });
}));

// @route   POST /api/data
// @desc    Create new water quality data
// @access  Private
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { sampleDate, location, parameters, dataSource = 'uploaded' } = req.body;
  
  const waterQualityData = new WaterQualityData({
    userId: req.user._id,
    fileName: 'Manual Entry',
    fileType: 'manual',
    fileSize: 0,
    dataSource,
    sampleDate: new Date(sampleDate),
    location,
    parameters,
    processingStatus: 'completed',
    processedAt: new Date()
  });
  
  // Calculate metrics
  await waterQualityData.calculateMetrics();
  
  const saved = await waterQualityData.save();
  
  res.status(201).json({
    success: true,
    message: 'Data created successfully',
    data: saved
  });
}));

// @route   PUT /api/data/:id
// @desc    Update water quality data
// @access  Private
router.put('/:id', authenticate, checkResourceAccess(WaterQualityData, 'id'), asyncHandler(async (req, res) => {
  const { sampleDate, location, parameters } = req.body;
  
  if (sampleDate) req.resource.sampleDate = new Date(sampleDate);
  if (location) req.resource.location = location;
  if (parameters) req.resource.parameters = parameters;
  
  // Recalculate metrics if parameters changed
  if (parameters) {
    await req.resource.calculateMetrics();
  }
  
  const updated = await req.resource.save();
  
  res.json({
    success: true,
    message: 'Data updated successfully',
    data: updated
  });
}));

// @route   DELETE /api/data/:id
// @desc    Delete water quality data
// @access  Private
router.delete('/:id', authenticate, checkResourceAccess(WaterQualityData, 'id'), asyncHandler(async (req, res) => {
  await WaterQualityData.deleteOne({ _id: req.params.id });
  
  res.json({
    success: true,
    message: 'Data deleted successfully'
  });
}));

// @route   GET /api/data/aggregated/metrics
// @desc    Get aggregated metrics for user
// @access  Private
router.get('/aggregated/metrics', authenticate, asyncHandler(async (req, res) => {
  const { dataSource } = req.query;
  
  const matchStage = { userId: req.user._id };
  if (dataSource) matchStage.dataSource = dataSource;
  
  const aggregation = await WaterQualityData.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalSamples: { $sum: 1 },
        safeSamples: {
          $sum: {
            $cond: [{ $eq: ['$calculatedMetrics.overallStatus', 'safe'] }, 1, 0]
          }
        },
        unsafeSamples: {
          $sum: {
            $cond: [{ $eq: ['$calculatedMetrics.overallStatus', 'unsafe'] }, 1, 0]
          }
        },
        criticalSamples: {
          $sum: {
            $cond: [{ $eq: ['$calculatedMetrics.overallStatus', 'critical'] }, 1, 0]
          }
        },
        avgHMPI: { $avg: '$calculatedMetrics.hmpi.value' },
        avgWQI: { $avg: '$calculatedMetrics.wqi.value' },
        minHMPI: { $min: '$calculatedMetrics.hmpi.value' },
        maxHMPI: { $max: '$calculatedMetrics.hmpi.value' },
        minWQI: { $min: '$calculatedMetrics.wqi.value' },
        maxWQI: { $max: '$calculatedMetrics.wqi.value' }
      }
    }
  ]);
  
  const metrics = aggregation[0] || {
    totalSamples: 0,
    safeSamples: 0,
    unsafeSamples: 0,
    criticalSamples: 0,
    avgHMPI: 0,
    avgWQI: 0,
    minHMPI: 0,
    maxHMPI: 0,
    minWQI: 0,
    maxWQI: 0
  };
  
  // Calculate percentages
  if (metrics.totalSamples > 0) {
    metrics.safePercentage = (metrics.safeSamples / metrics.totalSamples) * 100;
    metrics.unsafePercentage = (metrics.unsafeSamples / metrics.totalSamples) * 100;
    metrics.criticalPercentage = (metrics.criticalSamples / metrics.totalSamples) * 100;
  } else {
    metrics.safePercentage = 0;
    metrics.unsafePercentage = 0;
    metrics.criticalPercentage = 0;
  }
  
  res.json({
    success: true,
    data: metrics
  });
}));

// @route   GET /api/data/aggregated/trends
// @desc    Get trend analysis for parameters
// @access  Private
router.get('/aggregated/trends', authenticate, asyncHandler(async (req, res) => {
  const { 
    parameter, 
    startDate, 
    endDate, 
    dataSource,
    groupBy = 'day' // day, week, month
  } = req.query;
  
  if (!parameter) {
    return res.status(400).json({
      success: false,
      message: 'Parameter is required'
    });
  }
  
  const matchStage = { 
    userId: req.user._id,
    [`parameters.${parameter}`]: { $exists: true }
  };
  
  if (dataSource) matchStage.dataSource = dataSource;
  if (startDate || endDate) {
    matchStage.sampleDate = {};
    if (startDate) matchStage.sampleDate.$gte = new Date(startDate);
    if (endDate) matchStage.sampleDate.$lte = new Date(endDate);
  }
  
  // Group by time period
  let groupFormat;
  switch (groupBy) {
    case 'day':
      groupFormat = '%Y-%m-%d';
      break;
    case 'week':
      groupFormat = '%Y-%U';
      break;
    case 'month':
      groupFormat = '%Y-%m';
      break;
    default:
      groupFormat = '%Y-%m-%d';
  }
  
  const aggregation = await WaterQualityData.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          $dateToString: {
            format: groupFormat,
            date: '$sampleDate'
          }
        },
        avgValue: { $avg: `$parameters.${parameter}` },
        minValue: { $min: `$parameters.${parameter}` },
        maxValue: { $max: `$parameters.${parameter}` },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  res.json({
    success: true,
    data: {
      parameter,
      groupBy,
      trends: aggregation
    }
  });
}));

// @route   GET /api/data/aggregated/locations
// @desc    Get data grouped by location
// @access  Private
router.get('/aggregated/locations', authenticate, asyncHandler(async (req, res) => {
  const { dataSource } = req.query;
  
  const matchStage = { userId: req.user._id };
  if (dataSource) matchStage.dataSource = dataSource;
  
  const aggregation = await WaterQualityData.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          name: '$location.name',
          coordinates: '$location.coordinates'
        },
        totalSamples: { $sum: 1 },
        safeSamples: {
          $sum: {
            $cond: [{ $eq: ['$calculatedMetrics.overallStatus', 'safe'] }, 1, 0]
          }
        },
        unsafeSamples: {
          $sum: {
            $cond: [{ $eq: ['$calculatedMetrics.overallStatus', 'unsafe'] }, 1, 0]
          }
        },
        criticalSamples: {
          $sum: {
            $cond: [{ $eq: ['$calculatedMetrics.overallStatus', 'critical'] }, 1, 0]
          }
        },
        avgHMPI: { $avg: '$calculatedMetrics.hmpi.value' },
        avgWQI: { $avg: '$calculatedMetrics.wqi.value' },
        lastSampleDate: { $max: '$sampleDate' }
      }
    },
    {
      $project: {
        location: {
          name: '$_id.name',
          coordinates: '$_id.coordinates'
        },
        totalSamples: 1,
        safeSamples: 1,
        unsafeSamples: 1,
        criticalSamples: 1,
        avgHMPI: { $round: ['$avgHMPI', 2] },
        avgWQI: { $round: ['$avgWQI', 2] },
        lastSampleDate: 1,
        safePercentage: {
          $round: [
            { $multiply: [{ $divide: ['$safeSamples', '$totalSamples'] }, 100] },
            2
          ]
        }
      }
    },
    { $sort: { totalSamples: -1 } }
  ]);
  
  res.json({
    success: true,
    data: aggregation
  });
}));

// @route   POST /api/data/analyze
// @desc    Perform comprehensive analysis on selected data
// @access  Private
router.post('/analyze', authenticate, asyncHandler(async (req, res) => {
  const { dataIds, analysisType = 'comprehensive' } = req.body;
  
  if (!dataIds || !Array.isArray(dataIds) || dataIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Data IDs array is required'
    });
  }
  
  // Get data points
  const dataPoints = await WaterQualityData.find({
    _id: { $in: dataIds },
    userId: req.user._id
  }).select('sampleDate location parameters');
  
  if (dataPoints.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No data found for analysis'
    });
  }
  
  // Perform analysis
  const startTime = Date.now();
  const analysis = performComprehensiveAnalysis(dataPoints);
  const duration = Date.now() - startTime;
  
  logAnalysis(analysisType, req.user._id, dataIds.join(','), 'completed', duration, {
    dataPointCount: dataPoints.length
  });
  
  res.json({
    success: true,
    data: analysis
  });
}));

// @route   GET /api/data/export
// @desc    Export data in various formats
// @access  Private
router.get('/export', authenticate, asyncHandler(async (req, res) => {
  const { 
    format = 'csv', 
    dataSource, 
    startDate, 
    endDate,
    parameters
  } = req.query;
  
  // Build query
  const query = { userId: req.user._id };
  if (dataSource) query.dataSource = dataSource;
  if (startDate || endDate) {
    query.sampleDate = {};
    if (startDate) query.sampleDate.$gte = new Date(startDate);
    if (endDate) query.sampleDate.$lte = new Date(endDate);
  }
  
  // Get data
  const data = await WaterQualityData.find(query)
    .sort({ sampleDate: -1 })
    .select('sampleDate location parameters calculatedMetrics');
  
  if (data.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No data found for export'
    });
  }
  
  // Format data for export
  const exportData = data.map(item => {
    const baseData = {
      sampleDate: item.sampleDate,
      location: item.location?.name || '',
      latitude: item.location?.coordinates?.latitude || '',
      longitude: item.location?.coordinates?.longitude || '',
      hmpi: item.calculatedMetrics?.hmpi?.value || 0,
      wqi: item.calculatedMetrics?.wqi?.value || 0,
      overallStatus: item.calculatedMetrics?.overallStatus || 'unknown'
    };
    
    // Add parameter values
    if (item.parameters) {
      Object.keys(item.parameters).forEach(param => {
        if (!parameters || parameters.split(',').includes(param)) {
          baseData[param] = item.parameters[param].value || 0;
        }
      });
    }
    
    return baseData;
  });
  
  if (format === 'csv') {
    // Generate CSV
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      )
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="water_quality_data_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } else if (format === 'json') {
    res.json({
      success: true,
      data: exportData
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Unsupported export format'
    });
  }
}));

export default router;
