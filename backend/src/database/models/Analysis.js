import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dataId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WaterQualityData',
    required: true
  },
  analysisType: {
    type: String,
    enum: ['basic', 'comprehensive', 'trend', 'predictive', 'comparative'],
    required: true
  },
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
  
  // Analysis parameters
  parameters: {
    timeRange: {
      startDate: Date,
      endDate: Date
    },
    selectedParameters: [String],
    analysisMethod: {
      type: String,
      enum: ['statistical', 'machine_learning', 'trend_analysis', 'comparative'],
      default: 'statistical'
    },
    confidenceLevel: {
      type: Number,
      min: 0.5,
      max: 0.99,
      default: 0.95
    }
  },
  
  // Results
  results: {
    summary: {
      overallStatus: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor', 'critical'],
        required: true
      },
      riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true
      },
      keyFindings: [String],
      recommendations: [String]
    },
    
    // Statistical analysis
    statistics: {
      descriptive: {
        mean: Number,
        median: Number,
        mode: Number,
        standardDeviation: Number,
        variance: Number,
        range: Number,
        quartiles: {
          q1: Number,
          q2: Number,
          q3: Number
        }
      },
      correlation: [{
        parameter1: String,
        parameter2: String,
        coefficient: Number,
        significance: Number
      }],
      regression: [{
        dependent: String,
        independent: String,
        equation: String,
        rSquared: Number,
        pValue: Number
      }]
    },
    
    // Trend analysis
    trends: {
      direction: {
        type: String,
        enum: ['improving', 'stable', 'declining', 'fluctuating'],
        required: true
      },
      trendStrength: {
        type: String,
        enum: ['weak', 'moderate', 'strong'],
        required: true
      },
      trendSlope: Number,
      seasonalPattern: Boolean,
      cyclicalPattern: Boolean,
      forecast: [{
        date: Date,
        predictedValue: Number,
        confidenceInterval: {
          lower: Number,
          upper: Number
        }
      }]
    },
    
    // Predictive models
    predictions: {
      modelType: {
        type: String,
        enum: ['linear_regression', 'polynomial_regression', 'time_series', 'neural_network', 'random_forest'],
        required: true
      },
      accuracy: Number,
      predictions: [{
        parameter: String,
        futureDate: Date,
        predictedValue: Number,
        confidence: Number,
        riskLevel: {
          type: String,
          enum: ['low', 'medium', 'high', 'critical']
        }
      }]
    },
    
    // Comparative analysis
    comparison: {
      baseline: {
        period: String,
        values: mongoose.Schema.Types.Mixed
      },
      current: {
        period: String,
        values: mongoose.Schema.Types.Mixed
      },
      change: {
        percentage: Number,
        direction: {
          type: String,
          enum: ['improved', 'worsened', 'no_change']
        },
        significance: {
          type: String,
          enum: ['significant', 'not_significant']
        }
      }
    },
    
    // Charts and visualizations
    visualizations: {
      charts: [{
        type: {
          type: String,
          enum: ['line', 'bar', 'scatter', 'histogram', 'box', 'heatmap', 'radar']
        },
        title: String,
        data: mongoose.Schema.Types.Mixed,
        options: mongoose.Schema.Types.Mixed
      }],
      maps: [{
        type: {
          type: String,
          enum: ['point', 'heatmap', 'choropleth']
        },
        title: String,
        data: mongoose.Schema.Types.Mixed,
        options: mongoose.Schema.Types.Mixed
      }]
    }
  },
  
  // Quality assessment
  qualityAssessment: {
    dataQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      required: true
    },
    completeness: Number, // Percentage
    accuracy: Number, // Percentage
    reliability: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    limitations: [String],
    assumptions: [String]
  },
  
  // Status and metadata
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingStarted: Date,
  processingCompleted: Date,
  processingError: String,
  
  // Sharing and collaboration
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
      enum: ['view', 'comment', 'edit'],
      default: 'view'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Version control
  version: {
    type: Number,
    default: 1
  },
  parentAnalysis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Analysis'
  },
  
  // Tags and categorization
  tags: [String],
  category: {
    type: String,
    enum: ['water_quality', 'trend_analysis', 'prediction', 'comparison', 'research'],
    default: 'water_quality'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ dataId: 1 });
analysisSchema.index({ analysisType: 1 });
analysisSchema.index({ status: 1 });
analysisSchema.index({ isPublic: 1 });
analysisSchema.index({ tags: 1 });
analysisSchema.index({ category: 1 });

// Virtual for analysis duration
analysisSchema.virtual('duration').get(function() {
  if (this.processingStarted && this.processingCompleted) {
    return this.processingCompleted - this.processingStarted;
  }
  return null;
});

// Virtual for analysis age
analysisSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Pre-save middleware to update version
analysisSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.version += 1;
  }
  next();
});

// Method to add sharing permission
analysisSchema.methods.shareWith = function(userId, permission = 'view') {
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
analysisSchema.methods.unshareWith = function(userId) {
  this.sharedWith = this.sharedWith.filter(share => 
    share.userId.toString() !== userId.toString()
  );
  return this.save();
};

// Method to check if user has access
analysisSchema.methods.hasAccess = function(userId) {
  if (this.userId.toString() === userId.toString()) return true;
  if (this.isPublic) return true;
  
  const sharedWith = this.sharedWith.find(share => 
    share.userId.toString() === userId.toString()
  );
  
  return !!sharedWith;
};

// Method to get user's permission level
analysisSchema.methods.getUserPermission = function(userId) {
  if (this.userId.toString() === userId.toString()) return 'owner';
  
  const sharedWith = this.sharedWith.find(share => 
    share.userId.toString() === userId.toString()
  );
  
  return sharedWith ? sharedWith.permission : null;
};

// Static method to find analyses by user
analysisSchema.statics.findByUser = function(userId, options = {}) {
  const query = { userId };
  if (options.analysisType) query.analysisType = options.analysisType;
  if (options.status) query.status = options.status;
  if (options.category) query.category = options.category;
  
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to find public analyses
analysisSchema.statics.findPublic = function(options = {}) {
  const query = { isPublic: true };
  if (options.analysisType) query.analysisType = options.analysisType;
  if (options.category) query.category = options.category;
  
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get analysis statistics
analysisSchema.statics.getStatistics = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalAnalyses: { $sum: 1 },
        completedAnalyses: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        pendingAnalyses: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        processingAnalyses: {
          $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
        },
        failedAnalyses: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        avgProcessingTime: { $avg: '$duration' }
      }
    }
  ]);
};

export default mongoose.model('Analysis', analysisSchema);
