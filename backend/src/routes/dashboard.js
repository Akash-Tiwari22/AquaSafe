import express from 'express';
import WaterQualityData from '../database/models/WaterQualityData.js';
import Analysis from '../database/models/Analysis.js';
import Report from '../database/models/Report.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logAnalysis } from '../utils/logger.js';

const router = express.Router();

// @route   GET /api/dashboard/overview
// @desc    Get dashboard overview data
// @access  Private
router.get('/overview', authenticate, asyncHandler(async (req, res) => {
  const { dataSource } = req.query;
  
  // Get aggregated metrics
  const matchStage = { userId: req.user._id };
  if (dataSource) matchStage.dataSource = dataSource;
  
  const [metrics, recentData, recentAnalyses, recentReports] = await Promise.all([
    // Get aggregated metrics
    WaterQualityData.aggregate([
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
          lastSampleDate: { $max: '$sampleDate' }
        }
      }
    ]),
    
    // Get recent data (last 10 samples)
    WaterQualityData.find(matchStage)
      .sort({ sampleDate: -1 })
      .limit(10)
      .select('sampleDate location calculatedMetrics processingStatus'),
    
    // Get recent analyses (last 5)
    Analysis.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title analysisType status createdAt'),
    
    // Get recent reports (last 5)
    Report.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title reportType status createdAt')
  ]);
  
  const metricsData = metrics[0] || {
    totalSamples: 0,
    safeSamples: 0,
    unsafeSamples: 0,
    criticalSamples: 0,
    avgHMPI: 0,
    avgWQI: 0,
    lastSampleDate: null
  };
  
  // Calculate percentages
  if (metricsData.totalSamples > 0) {
    metricsData.safePercentage = (metricsData.safeSamples / metricsData.totalSamples) * 100;
    metricsData.unsafePercentage = (metricsData.unsafeSamples / metricsData.totalSamples) * 100;
    metricsData.criticalPercentage = (metricsData.criticalSamples / metricsData.totalSamples) * 100;
  } else {
    metricsData.safePercentage = 0;
    metricsData.unsafePercentage = 0;
    metricsData.criticalPercentage = 0;
  }
  
  res.json({
    success: true,
    data: {
      metrics: metricsData,
      recentData,
      recentAnalyses,
      recentReports
    }
  });
}));

// @route   GET /api/dashboard/metrics
// @desc    Get detailed metrics for dashboard
// @access  Private
router.get('/metrics', authenticate, asyncHandler(async (req, res) => {
  const { 
    timeRange = '30d', 
    dataSource,
    groupBy = 'day' 
  } = req.query;
  
  // Calculate date range
  const now = new Date();
  let startDate;
  switch (timeRange) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  const matchStage = { 
    userId: req.user._id,
    sampleDate: { $gte: startDate }
  };
  if (dataSource) matchStage.dataSource = dataSource;
  
  // Group by time period
  let groupFormat;
  switch (groupBy) {
    case 'hour':
      groupFormat = '%Y-%m-%d-%H';
      break;
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
  
  const metrics = await WaterQualityData.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          $dateToString: {
            format: groupFormat,
            date: '$sampleDate'
          }
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
        minHMPI: { $min: '$calculatedMetrics.hmpi.value' },
        maxHMPI: { $max: '$calculatedMetrics.hmpi.value' },
        minWQI: { $min: '$calculatedMetrics.wqi.value' },
        maxWQI: { $max: '$calculatedMetrics.wqi.value' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  res.json({
    success: true,
    data: {
      timeRange,
      groupBy,
      metrics
    }
  });
}));

// @route   GET /api/dashboard/parameters
// @desc    Get parameter-wise analysis
// @access  Private
router.get('/parameters', authenticate, asyncHandler(async (req, res) => {
  const { 
    timeRange = '30d',
    dataSource,
    parameters
  } = req.query;
  
  // Calculate date range
  const now = new Date();
  let startDate;
  switch (timeRange) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  const matchStage = { 
    userId: req.user._id,
    sampleDate: { $gte: startDate }
  };
  if (dataSource) matchStage.dataSource = dataSource;
  
  // Get all data for parameter analysis
  const data = await WaterQualityData.find(matchStage)
    .select('sampleDate parameters calculatedMetrics');
  
  // Analyze each parameter
  const parameterAnalysis = {};
  const allParameters = new Set();
  
  data.forEach(sample => {
    if (sample.parameters) {
      Object.keys(sample.parameters).forEach(param => {
        allParameters.add(param);
      });
    }
  });
  
  // Filter parameters if specified
  const paramsToAnalyze = parameters ? 
    parameters.split(',').filter(p => allParameters.has(p)) : 
    Array.from(allParameters);
  
  paramsToAnalyze.forEach(param => {
    const values = data
      .filter(sample => sample.parameters && sample.parameters[param] !== undefined)
      .map(sample => ({
        value: sample.parameters[param].value,
        date: sample.sampleDate,
        status: sample.parameters[param].status
      }));
    
    if (values.length > 0) {
      const sortedValues = values.map(v => v.value).sort((a, b) => a - b);
      const mean = sortedValues.reduce((a, b) => a + b, 0) / sortedValues.length;
      const median = sortedValues[Math.floor(sortedValues.length / 2)];
      const min = sortedValues[0];
      const max = sortedValues[sortedValues.length - 1];
      
      // Calculate standard deviation
      const variance = sortedValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / sortedValues.length;
      const stdDev = Math.sqrt(variance);
      
      // Count status
      const statusCounts = values.reduce((acc, v) => {
        acc[v.status] = (acc[v.status] || 0) + 1;
        return acc;
      }, {});
      
      parameterAnalysis[param] = {
        count: values.length,
        mean: Math.round(mean * 100) / 100,
        median: Math.round(median * 100) / 100,
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100,
        stdDev: Math.round(stdDev * 100) / 100,
        statusCounts,
        values: values.slice(-50) // Last 50 values for trend analysis
      };
    }
  });
  
  res.json({
    success: true,
    data: {
      timeRange,
      parameterAnalysis
    }
  });
}));

// @route   GET /api/dashboard/locations
// @desc    Get location-wise analysis
// @access  Private
router.get('/locations', authenticate, asyncHandler(async (req, res) => {
  const { dataSource } = req.query;
  
  const matchStage = { userId: req.user._id };
  if (dataSource) matchStage.dataSource = dataSource;
  
  const locationAnalysis = await WaterQualityData.aggregate([
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
        lastSampleDate: { $max: '$sampleDate' },
        firstSampleDate: { $min: '$sampleDate' }
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
        firstSampleDate: 1,
        safePercentage: {
          $round: [
            { $multiply: [{ $divide: ['$safeSamples', '$totalSamples'] }, 100] },
            2
          ]
        },
        riskLevel: {
          $switch: {
            branches: [
              {
                case: { $gte: ['$avgHMPI', 2] },
                then: 'critical'
              },
              {
                case: { $gte: ['$avgHMPI', 1] },
                then: 'high'
              },
              {
                case: { $gte: ['$avgHMPI', 0.5] },
                then: 'medium'
              }
            ],
            default: 'low'
          }
        }
      }
    },
    { $sort: { totalSamples: -1 } }
  ]);
  
  res.json({
    success: true,
    data: locationAnalysis
  });
}));

// @route   GET /api/dashboard/alerts
// @desc    Get alerts and incidents
// @access  Private
router.get('/alerts', authenticate, asyncHandler(async (req, res) => {
  const { 
    severity,
    status = 'active',
    limit = 50
  } = req.query;
  
  // Get recent critical and unsafe samples
  const matchStage = { 
    userId: req.user._id,
    'calculatedMetrics.overallStatus': { $in: ['unsafe', 'critical'] }
  };
  
  if (severity) {
    matchStage['calculatedMetrics.riskLevel'] = severity;
  }
  
  const alerts = await WaterQualityData.find(matchStage)
    .sort({ sampleDate: -1 })
    .limit(parseInt(limit))
    .select('sampleDate location parameters calculatedMetrics');
  
  // Format alerts
  const formattedAlerts = alerts.map(alert => {
    const criticalParams = [];
    const unsafeParams = [];
    
    if (alert.parameters) {
      Object.keys(alert.parameters).forEach(param => {
        const paramData = alert.parameters[param];
        if (paramData.status === 'critical') {
          criticalParams.push({
            parameter: param,
            value: paramData.value,
            unit: paramData.unit,
            standard: paramData.standard
          });
        } else if (paramData.status === 'unsafe') {
          unsafeParams.push({
            parameter: param,
            value: paramData.value,
            unit: paramData.unit,
            standard: paramData.standard
          });
        }
      });
    }
    
    return {
      id: alert._id,
      date: alert.sampleDate,
      location: alert.location,
      severity: alert.calculatedMetrics?.riskLevel || 'medium',
      status: alert.calculatedMetrics?.overallStatus || 'unknown',
      hmpi: alert.calculatedMetrics?.hmpi?.value || 0,
      wqi: alert.calculatedMetrics?.wqi?.value || 0,
      criticalParams,
      unsafeParams,
      description: criticalParams.length > 0 ? 
        `${criticalParams.length} critical parameter(s) detected` :
        `${unsafeParams.length} unsafe parameter(s) detected`
    };
  });
  
  res.json({
    success: true,
    data: {
      alerts: formattedAlerts,
      total: formattedAlerts.length
    }
  });
}));

// @route   GET /api/dashboard/statistics
// @desc    Get comprehensive statistics
// @access  Private
router.get('/statistics', authenticate, asyncHandler(async (req, res) => {
  const { dataSource } = req.query;
  
  const matchStage = { userId: req.user._id };
  if (dataSource) matchStage.dataSource = dataSource;
  
  const [dataStats, analysisStats, reportStats] = await Promise.all([
    // Data statistics
    WaterQualityData.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSamples: { $sum: 1 },
          totalLocations: { $addToSet: '$location.name' },
          dateRange: {
            $push: '$sampleDate'
          },
          avgHMPI: { $avg: '$calculatedMetrics.hmpi.value' },
          avgWQI: { $avg: '$calculatedMetrics.wqi.value' }
        }
      },
      {
        $project: {
          totalSamples: 1,
          totalLocations: { $size: '$totalLocations' },
          dateRange: {
            min: { $min: '$dateRange' },
            max: { $max: '$dateRange' }
          },
          avgHMPI: { $round: ['$avgHMPI', 2] },
          avgWQI: { $round: ['$avgWQI', 2] }
        }
      }
    ]),
    
    // Analysis statistics
    Analysis.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          totalAnalyses: { $sum: 1 },
          completedAnalyses: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pendingAnalyses: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      }
    ]),
    
    // Report statistics
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
        dateRange: { min: null, max: null },
        avgHMPI: 0,
        avgWQI: 0
      },
      analysis: analysisStats[0] || {
        totalAnalyses: 0,
        completedAnalyses: 0,
        pendingAnalyses: 0
      },
      reports: reportStats[0] || {
        totalReports: 0,
        completedReports: 0,
        totalDownloads: 0
      }
    }
  });
}));

export default router;
