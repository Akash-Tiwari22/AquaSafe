import express from 'express';
import Report from '../database/models/Report.js';
import Analysis from '../database/models/Analysis.js';
import WaterQualityData from '../database/models/WaterQualityData.js';
import { authenticate, checkResourceAccess } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logReportGeneration } from '../utils/logger.js';
import { generatePDFReport, generateExcelReport } from '../utils/reportGenerator.js';

const router = express.Router();

// @route   POST /api/reports
// @desc    Create new report
// @access  Private
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const {
    analysisId,
    dataIds = [],
    title,
    description,
    reportType = 'summary',
    format = 'pdf',
    configuration = {}
  } = req.body;
  
  if (!analysisId && (!dataIds || dataIds.length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'Analysis ID or data IDs are required'
    });
  }
  
  // Verify analysis ownership if provided
  if (analysisId) {
    const analysis = await Analysis.findOne({
      _id: analysisId,
      userId: req.user._id
    });
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }
  }
  
  // Verify data ownership
  if (dataIds.length > 0) {
    const dataCount = await WaterQualityData.countDocuments({
      _id: { $in: dataIds },
      userId: req.user._id
    });
    
    if (dataCount !== dataIds.length) {
      return res.status(404).json({
        success: false,
        message: 'Some data not found or access denied'
      });
    }
  }
  
  // Create report record
  const report = new Report({
    userId: req.user._id,
    analysisId: analysisId || null,
    dataIds: dataIds,
    title: title || `${reportType} Report - ${new Date().toLocaleDateString()}`,
    description,
    reportType,
    format,
    configuration: {
      includeCharts: configuration.includeCharts !== false,
      includeTables: configuration.includeTables !== false,
      includeMaps: configuration.includeMaps || false,
      includeRawData: configuration.includeRawData || false,
      chartTheme: configuration.chartTheme || 'aqua',
      logo: configuration.logo || null,
      footer: configuration.footer || null,
      pageSize: configuration.pageSize || 'A4',
      orientation: configuration.orientation || 'portrait',
      ...configuration
    },
    status: 'pending'
  });
  
  await report.save();
  
  // Start report generation (async)
  generateReport(report._id).catch(error => {
    console.error('Report generation failed:', error);
  });
  
  res.status(201).json({
    success: true,
    message: 'Report generation initiated',
    data: report
  });
}));

// @route   GET /api/reports
// @desc    Get user's reports
// @access  Private
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    reportType, 
    format,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;
  
  const query = { userId: req.user._id };
  if (reportType) query.reportType = reportType;
  if (format) query.format = format;
  if (status) query.status = status;
  
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [reports, total] = await Promise.all([
    Report.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-content -sections -visualizations -tables -__v'),
    Report.countDocuments(query)
  ]);
  
  res.json({
    success: true,
    data: {
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// @route   GET /api/reports/:id
// @desc    Get specific report
// @access  Private
router.get('/:id', authenticate, checkResourceAccess(Report, 'id'), asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.resource
  });
}));

// @route   GET /api/reports/:id/download
// @desc    Download report file
// @access  Private
router.get('/:id/download', authenticate, checkResourceAccess(Report, 'id'), asyncHandler(async (req, res) => {
  const report = req.resource;
  
  if (report.status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Report is not ready for download'
    });
  }
  
  if (!report.fileInfo || !report.fileInfo.filePath) {
    return res.status(404).json({
      success: false,
      message: 'Report file not found'
    });
  }
  
  // Record download
  await report.recordDownload(
    req.user._id,
    req.ip,
    req.get('User-Agent')
  );
  
  // Set appropriate headers
  res.setHeader('Content-Type', report.fileInfo.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${report.fileInfo.fileName}"`);
  
  // Stream file
  const fs = require('fs');
  const fileStream = fs.createReadStream(report.fileInfo.filePath);
  fileStream.pipe(res);
}));

// @route   PUT /api/reports/:id
// @desc    Update report
// @access  Private
router.put('/:id', authenticate, checkResourceAccess(Report, 'id'), asyncHandler(async (req, res) => {
  const { title, description, isPublic, tags } = req.body;
  
  if (title) req.resource.title = title;
  if (description) req.resource.description = description;
  if (typeof isPublic === 'boolean') req.resource.isPublic = isPublic;
  if (tags) req.resource.tags = tags;
  
  const updated = await req.resource.save();
  
  res.json({
    success: true,
    message: 'Report updated successfully',
    data: updated
  });
}));

// @route   DELETE /api/reports/:id
// @desc    Delete report
// @access  Private
router.delete('/:id', authenticate, checkResourceAccess(Report, 'id'), asyncHandler(async (req, res) => {
  const report = req.resource;
  
  // Delete file if exists
  if (report.fileInfo && report.fileInfo.filePath) {
    const fs = require('fs');
    if (fs.existsSync(report.fileInfo.filePath)) {
      fs.unlinkSync(report.fileInfo.filePath);
    }
  }
  
  await Report.deleteOne({ _id: req.params.id });
  
  res.json({
    success: true,
    message: 'Report deleted successfully'
  });
}));

// @route   POST /api/reports/:id/regenerate
// @desc    Regenerate report
// @access  Private
router.post('/:id/regenerate', authenticate, checkResourceAccess(Report, 'id'), asyncHandler(async (req, res) => {
  if (req.resource.status === 'generating') {
    return res.status(400).json({
      success: false,
      message: 'Report is already being generated'
    });
  }
  
  // Reset status
  req.resource.status = 'pending';
  req.resource.generationStarted = null;
  req.resource.generationCompleted = null;
  req.resource.generationError = null;
  req.resource.progress = 0;
  await req.resource.save();
  
  // Start generation
  generateReport(req.resource._id).catch(error => {
    console.error('Report generation failed:', error);
  });
  
  res.json({
    success: true,
    message: 'Report regeneration initiated'
  });
}));

// @route   POST /api/reports/:id/share
// @desc    Share report with user
// @access  Private
router.post('/:id/share', authenticate, checkResourceAccess(Report, 'id'), asyncHandler(async (req, res) => {
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
    message: 'Report shared successfully'
  });
}));

// @route   DELETE /api/reports/:id/share/:userId
// @desc    Remove sharing permission
// @access  Private
router.delete('/:id/share/:userId', authenticate, checkResourceAccess(Report, 'id'), asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  await req.resource.unshareWith(userId);
  
  res.json({
    success: true,
    message: 'Sharing permission removed'
  });
}));

// @route   GET /api/reports/public
// @desc    Get public reports
// @access  Public
router.get('/public', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    reportType, 
    category,
    format,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;
  
  const query = { isPublic: true, isExpired: false };
  if (reportType) query.reportType = reportType;
  if (category) query.category = category;
  if (format) query.format = format;
  
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [reports, total] = await Promise.all([
    Report.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-content -sections -visualizations -tables -__v')
      .populate('userId', 'name organization'),
    Report.countDocuments(query)
  ]);
  
  res.json({
    success: true,
    data: {
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// @route   GET /api/reports/statistics
// @desc    Get report statistics
// @access  Private
router.get('/statistics', authenticate, asyncHandler(async (req, res) => {
  const stats = await Report.getStatistics(req.user._id);
  
  res.json({
    success: true,
    data: stats[0] || {
      totalReports: 0,
      completedReports: 0,
      pendingReports: 0,
      generatingReports: 0,
      failedReports: 0,
      totalDownloads: 0,
      avgGenerationTime: 0
    }
  });
}));

// @route   GET /api/reports/templates
// @desc    Get report templates
// @access  Public
router.get('/templates', asyncHandler(async (req, res) => {
  const templates = [
    {
      id: 'summary',
      name: 'Summary Report',
      description: 'Basic overview of water quality data',
      reportType: 'summary',
      format: 'pdf',
      sections: ['overview', 'metrics', 'recommendations']
    },
    {
      id: 'detailed',
      name: 'Detailed Analysis Report',
      description: 'Comprehensive analysis with charts and trends',
      reportType: 'detailed',
      format: 'pdf',
      sections: ['overview', 'analysis', 'charts', 'trends', 'recommendations']
    },
    {
      name: 'Executive Report',
      description: 'High-level summary for management',
      reportType: 'executive',
      format: 'pdf',
      sections: ['executive_summary', 'key_findings', 'recommendations']
    },
    {
      id: 'technical',
      name: 'Technical Report',
      description: 'Detailed technical analysis with raw data',
      reportType: 'technical',
      format: 'pdf',
      sections: ['methodology', 'data_analysis', 'statistical_results', 'raw_data']
    },
    {
      id: 'compliance',
      name: 'Compliance Report',
      description: 'Regulatory compliance assessment',
      reportType: 'compliance',
      format: 'pdf',
      sections: ['compliance_summary', 'standards_comparison', 'violations', 'recommendations']
    }
  ];
  
  res.json({
    success: true,
    data: templates
  });
}));

// Generate report (async function)
async function generateReport(reportId) {
  const startTime = Date.now();
  
  try {
    // Update status to generating
    await Report.findByIdAndUpdate(reportId, {
      status: 'generating',
      generationStarted: new Date(),
      progress: 10
    });
    
    const report = await Report.findById(reportId).populate('analysisId');
    if (!report) {
      throw new Error('Report not found');
    }
    
    // Get data for report
    let data = [];
    if (report.analysisId) {
      // Get data from analysis
      const analysis = report.analysisId;
      if (analysis.results && analysis.results.analysisResults) {
        data = analysis.results.analysisResults;
      }
    } else if (report.dataIds && report.dataIds.length > 0) {
      // Get data directly
      data = await WaterQualityData.find({
        _id: { $in: report.dataIds },
        userId: report.userId
      });
    }
    
    if (data.length === 0) {
      throw new Error('No data available for report generation');
    }
    
    // Update progress
    await Report.findByIdAndUpdate(reportId, { progress: 30 });
    
    // Generate report based on format
    let filePath, fileName, mimeType;
    
    if (report.format === 'pdf') {
      const result = await generatePDFReport(report, data);
      filePath = result.filePath;
      fileName = result.fileName;
      mimeType = 'application/pdf';
    } else if (report.format === 'excel') {
      const result = await generateExcelReport(report, data);
      filePath = result.filePath;
      fileName = result.fileName;
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else {
      throw new Error('Unsupported report format');
    }
    
    // Update progress
    await Report.findByIdAndUpdate(reportId, { progress: 80 });
    
    // Get file stats
    const fs = require('fs');
    const stats = fs.statSync(filePath);
    
    // Update report with file info
    await Report.findByIdAndUpdate(reportId, {
      status: 'completed',
      generationCompleted: new Date(),
      progress: 100,
      fileInfo: {
        fileName,
        filePath,
        fileSize: stats.size,
        mimeType,
        checksum: require('crypto').createHash('md5').update(fs.readFileSync(filePath)).digest('hex')
      }
    });
    
    const duration = Date.now() - startTime;
    logReportGeneration(report.reportType, report.userId, report.analysisId?._id, 'completed', duration, {
      format: report.format,
      dataPointCount: data.length
    });
    
  } catch (error) {
    // Update status to failed
    await Report.findByIdAndUpdate(reportId, {
      status: 'failed',
      generationCompleted: new Date(),
      generationError: error.message,
      progress: 0
    });
    
    const duration = Date.now() - startTime;
    logReportGeneration('unknown', null, null, 'failed', duration, {
      error: error.message
    });
  }
}

export default router;
