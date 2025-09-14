import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  analysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Analysis',
    required: true
  },
  dataIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WaterQualityData'
  }],
  
  // Report metadata
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  reportType: {
    type: String,
    enum: ['summary', 'detailed', 'executive', 'technical', 'compliance'],
    required: true
  },
  format: {
    type: String,
    enum: ['pdf', 'excel', 'csv', 'json'],
    required: true
  },
  
  // Report content
  content: {
    executiveSummary: {
      type: String,
      trim: true
    },
    keyFindings: [String],
    recommendations: [String],
    methodology: {
      type: String,
      trim: true
    },
    dataSources: [String],
    limitations: [String],
    conclusions: {
      type: String,
      trim: true
    }
  },
  
  // Report sections
  sections: [{
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'chart', 'table', 'image', 'map'],
      required: true
    },
    content: mongoose.Schema.Types.Mixed,
    order: {
      type: Number,
      required: true
    }
  }],
  
  // Charts and visualizations
  visualizations: [{
    id: String,
    type: {
      type: String,
      enum: ['line', 'bar', 'scatter', 'histogram', 'box', 'heatmap', 'radar', 'pie', 'area'],
      required: true
    },
    title: String,
    data: mongoose.Schema.Types.Mixed,
    options: mongoose.Schema.Types.Mixed,
    order: Number
  }],
  
  // Tables
  tables: [{
    id: String,
    title: String,
    headers: [String],
    rows: [[mongoose.Schema.Types.Mixed]],
    order: Number
  }],
  
  // Report configuration
  configuration: {
    includeCharts: {
      type: Boolean,
      default: true
    },
    includeTables: {
      type: Boolean,
      default: true
    },
    includeMaps: {
      type: Boolean,
      default: false
    },
    includeRawData: {
      type: Boolean,
      default: false
    },
    chartTheme: {
      type: String,
      enum: ['light', 'dark', 'aqua'],
      default: 'aqua'
    },
    logo: String,
    footer: String,
    pageSize: {
      type: String,
      enum: ['A4', 'Letter', 'Legal'],
      default: 'A4'
    },
    orientation: {
      type: String,
      enum: ['portrait', 'landscape'],
      default: 'portrait'
    }
  },
  
  // File information
  fileInfo: {
    fileName: String,
    filePath: String,
    fileSize: Number,
    mimeType: String,
    checksum: String
  },
  
  // Generation status
  status: {
    type: String,
    enum: ['pending', 'generating', 'completed', 'failed'],
    default: 'pending'
  },
  generationStarted: Date,
  generationCompleted: Date,
  generationError: String,
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Sharing and access
  isPublic: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'download'],
      default: 'view'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Download tracking
  downloads: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    downloadedAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  }],
  
  // Version control
  version: {
    type: Number,
    default: 1
  },
  parentReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  },
  
  // Tags and categorization
  tags: [String],
  category: {
    type: String,
    enum: ['water_quality', 'compliance', 'research', 'monitoring', 'assessment'],
    default: 'water_quality'
  },
  
  // Expiration
  expiresAt: Date,
  isExpired: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ analysisId: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ isPublic: 1 });
reportSchema.index({ tags: 1 });
reportSchema.index({ category: 1 });
reportSchema.index({ expiresAt: 1 });

// Virtual for download count
reportSchema.virtual('downloadCount').get(function() {
  return this.downloads.length;
});

// Virtual for report age
reportSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Virtual for generation duration
reportSchema.virtual('generationDuration').get(function() {
  if (this.generationStarted && this.generationCompleted) {
    return this.generationCompleted - this.generationStarted;
  }
  return null;
});

// Pre-save middleware to update version and check expiration
reportSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.version += 1;
  }
  
  // Check if report has expired
  if (this.expiresAt && new Date() > this.expiresAt) {
    this.isExpired = true;
  }
  
  next();
});

// Method to add sharing permission
reportSchema.methods.shareWith = function(userId, permission = 'view') {
  const existingShare = this.sharedWith.find(share => 
    share.userId.toString() === userId.toString()
  );
  
  if (existingShare) {
    existingShare.permission = permission;
    existingShare.sharedAt = new Date();
  } else {
    this.sharedWith.push({
      userId,
      permission,
      sharedAt: new Date()
    });
  }
  
  return this.save();
};

// Method to remove sharing permission
reportSchema.methods.unshareWith = function(userId) {
  this.sharedWith = this.sharedWith.filter(share => 
    share.userId.toString() !== userId.toString()
  );
  return this.save();
};

// Method to check if user has access
reportSchema.methods.hasAccess = function(userId) {
  if (this.userId.toString() === userId.toString()) return true;
  if (this.isPublic && !this.isExpired) return true;
  
  const sharedWith = this.sharedWith.find(share => 
    share.userId.toString() === userId.toString()
  );
  
  return !!sharedWith && !this.isExpired;
};

// Method to record download
reportSchema.methods.recordDownload = function(userId, ipAddress, userAgent) {
  this.downloads.push({
    userId,
    downloadedAt: new Date(),
    ipAddress,
    userAgent
  });
  return this.save();
};

// Method to get user's permission level
reportSchema.methods.getUserPermission = function(userId) {
  if (this.userId.toString() === userId.toString()) return 'owner';
  
  const sharedWith = this.sharedWith.find(share => 
    share.userId.toString() === userId.toString()
  );
  
  return sharedWith ? sharedWith.permission : null;
};

// Static method to find reports by user
reportSchema.statics.findByUser = function(userId, options = {}) {
  const query = { userId };
  if (options.reportType) query.reportType = options.reportType;
  if (options.status) query.status = options.status;
  if (options.category) query.category = options.category;
  if (options.format) query.format = options.format;
  
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to find public reports
reportSchema.statics.findPublic = function(options = {}) {
  const query = { isPublic: true, isExpired: false };
  if (options.reportType) query.reportType = options.reportType;
  if (options.category) query.category = options.category;
  if (options.format) query.format = options.format;
  
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get report statistics
reportSchema.statics.getStatistics = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalReports: { $sum: 1 },
        completedReports: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        pendingReports: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        generatingReports: {
          $sum: { $cond: [{ $eq: ['$status', 'generating'] }, 1, 0] }
        },
        failedReports: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        totalDownloads: { $sum: { $size: '$downloads' } },
        avgGenerationTime: { $avg: '$generationDuration' }
      }
    }
  ]);
};

// Static method to clean expired reports
reportSchema.statics.cleanExpired = function() {
  return this.updateMany(
    { expiresAt: { $lt: new Date() } },
    { isExpired: true }
  );
};

export default mongoose.model('Report', reportSchema);
