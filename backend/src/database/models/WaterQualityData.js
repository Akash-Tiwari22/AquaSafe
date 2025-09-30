import mongoose from 'mongoose';

const waterQualityDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  fileType: {
    type: String,
    enum: ['csv', 'xlsx', 'xls'],
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  dataSource: {
    type: String,
    enum: ['uploaded', 'complete', 'synthetic'],
    default: 'uploaded'
  },
  location: {
    name: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    region: String,
    state: String,
    country: String
  },
  sampleDate: {
    type: Date,
    required: true
  },
  parameters: {
    // Physical parameters
    pH: {
      value: Number,
      unit: { type: String, default: 'pH units' },
      standard: { type: Number, default: 6.5 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    temperature: {
      value: Number,
      unit: { type: String, default: '°C' },
      standard: { type: Number, default: 30 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    turbidity: {
      value: Number,
      unit: { type: String, default: 'NTU' },
      standard: { type: Number, default: 5 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    totalDissolvedSolids: {
      value: Number,
      unit: { type: String, default: 'mg/L' },
      standard: { type: Number, default: 500 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    electricalConductivity: {
      value: Number,
      unit: { type: String, default: 'μS/cm' },
      standard: { type: Number, default: 1000 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    
    // Chemical parameters
    dissolvedOxygen: {
      value: Number,
      unit: { type: String, default: 'mg/L' },
      standard: { type: Number, default: 5 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    biochemicalOxygenDemand: {
      value: Number,
      unit: { type: String, default: 'mg/L' },
      standard: { type: Number, default: 3 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    chemicalOxygenDemand: {
      value: Number,
      unit: { type: String, default: 'mg/L' },
      standard: { type: Number, default: 10 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    totalAlkalinity: {
      value: Number,
      unit: { type: String, default: 'mg/L' },
      standard: { type: Number, default: 200 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    totalHardness: {
      value: Number,
      unit: { type: String, default: 'mg/L' },
      standard: { type: Number, default: 300 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    
    // Heavy metals
    arsenic: {
      value: Number,
      unit: { type: String, default: 'µg/L' },
      standard: { type: Number, default: 10 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    lead: {
      value: Number,
      unit: { type: String, default: 'µg/L' },
      standard: { type: Number, default: 10 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    mercury: {
      value: Number,
      unit: { type: String, default: 'µg/L' },
      standard: { type: Number, default: 1 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    cadmium: {
      value: Number,
      unit: { type: String, default: 'µg/L' },
      standard: { type: Number, default: 3 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    chromium: {
      value: Number,
      unit: { type: String, default: 'µg/L' },
      standard: { type: Number, default: 50 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    nickel: {
      value: Number,
      unit: { type: String, default: 'µg/L' },
      standard: { type: Number, default: 20 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    copper: {
      value: Number,
      unit: { type: String, default: 'µg/L' },
      standard: { type: Number, default: 1000 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    zinc: {
      value: Number,
      unit: { type: String, default: 'µg/L' },
      standard: { type: Number, default: 3000 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    iron: {
      value: Number,
      unit: { type: String, default: 'µg/L' },
      standard: { type: Number, default: 300 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    manganese: {
      value: Number,
      unit: { type: String, default: 'µg/L' },
      standard: { type: Number, default: 100 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    
    // Nutrients
    nitrate: {
      value: Number,
      unit: { type: String, default: 'mg/L' },
      standard: { type: Number, default: 45 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    nitrite: {
      value: Number,
      unit: { type: String, default: 'mg/L' },
      standard: { type: Number, default: 3 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    phosphate: {
      value: Number,
      unit: { type: String, default: 'mg/L' },
      standard: { type: Number, default: 0.1 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    ammonia: {
      value: Number,
      unit: { type: String, default: 'mg/L' },
      standard: { type: Number, default: 0.5 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    
    // Microbiological parameters
    totalColiforms: {
      value: Number,
      unit: { type: String, default: 'MPN/100mL' },
      standard: { type: Number, default: 0 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    fecalColiforms: {
      value: Number,
      unit: { type: String, default: 'MPN/100mL' },
      standard: { type: Number, default: 0 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    },
    eColi: {
      value: Number,
      unit: { type: String, default: 'MPN/100mL' },
      standard: { type: Number, default: 0 },
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' }
    }
  },
  
  // Calculated metrics
  calculatedMetrics: {
    hmpi: {
      value: Number,
      status: { type: String, enum: ['safe', 'unsafe', 'critical'], default: 'safe' },
      calculationDate: { type: Date, default: Date.now }
    },
    wqi: {
      value: Number,
      status: { type: String, enum: ['excellent', 'good', 'fair', 'poor', 'very_poor'], default: 'excellent' },
      calculationDate: { type: Date, default: Date.now }
    },
    overallStatus: {
      type: String,
      enum: ['safe', 'unsafe', 'critical'],
      default: 'safe'
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    }
  },
  
  // Quality flags
  qualityFlags: {
    hasAnomalies: { type: Boolean, default: false },
    missingData: { type: Boolean, default: false },
    dataQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'excellent'
    },
    validationNotes: [String]
  },
  
  // Metadata
  metadata: {
    samplingMethod: String,
    laboratory: String,
    analyst: String,
    equipment: String,
    qualityControl: [String],
    notes: String,
    tags: [String]
  },
  
  // Processing status
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingError: String,
  processedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
waterQualityDataSchema.index({ userId: 1, sampleDate: -1 });
waterQualityDataSchema.index({ dataSource: 1 });
waterQualityDataSchema.index({ 'calculatedMetrics.overallStatus': 1 });
waterQualityDataSchema.index({ 'location.coordinates': '2dsphere' });
waterQualityDataSchema.index({ uploadDate: -1 });
waterQualityDataSchema.index({ processingStatus: 1 });

// Virtual for sample count
waterQualityDataSchema.virtual('sampleCount').get(function() {
  return 1; // Each document represents one sample
});

// Virtual for data completeness
waterQualityDataSchema.virtual('dataCompleteness').get(function() {
  const totalParams = Object.keys(this.parameters).length;
  const filledParams = Object.values(this.parameters).filter(param => 
    param && param.value !== null && param.value !== undefined
  ).length;
  return Math.round((filledParams / totalParams) * 100);
});

// Pre-save middleware to calculate metrics
waterQualityDataSchema.pre('save', async function(next) {
  if (this.isModified('parameters')) {
    try {
      // Normalize heavy metals to µg/L if provided in mg/L
      const heavyMetals = ['arsenic','lead','mercury','cadmium','chromium','nickel','copper','zinc','iron','manganese'];
      heavyMetals.forEach((metal) => {
        const param = this.parameters?.[metal];
        if (param && typeof param.value === 'number') {
          // If unit indicates mg/L, convert to µg/L
          if (param.unit === 'mg/L') {
            param.value = param.value * 1000;
            param.unit = 'µg/L';
          }
        }
      });
      await this.calculateMetrics();
    } catch (error) {
      next(error);
    }
  }
  next();
});

// Method to calculate HMPI (Heavy Metal Pollution Index)
waterQualityDataSchema.methods.calculateHMPI = function() {
  const heavyMetals = ['arsenic', 'lead', 'mercury', 'cadmium', 'chromium', 'nickel', 'copper', 'zinc', 'iron', 'manganese'];
  let hmpi = 0;
  let validMetals = 0;
  
  heavyMetals.forEach(metal => {
    const param = this.parameters[metal];
    if (param && param.value !== null && param.value !== undefined && param.standard) {
      hmpi += (param.value / param.standard);
      validMetals++;
    }
  });
  
  if (validMetals > 0) {
    hmpi = hmpi / validMetals;
  }
  
  // Determine status based on HMPI value
  let status = 'safe';
  if (hmpi > 2) status = 'critical';
  else if (hmpi > 1) status = 'unsafe';
  
  return { value: hmpi, status };
};

// Method to calculate WQI (Water Quality Index)
waterQualityDataSchema.methods.calculateWQI = function() {
  const parameters = ['pH', 'dissolvedOxygen', 'turbidity', 'totalDissolvedSolids', 'nitrate'];
  let wqi = 0;
  let validParams = 0;
  
  parameters.forEach(param => {
    const paramData = this.parameters[param];
    if (paramData && paramData.value !== null && paramData.value !== undefined && paramData.standard) {
      const qualityRating = Math.min(100, (paramData.standard / paramData.value) * 100);
      wqi += qualityRating;
      validParams++;
    }
  });
  
  if (validParams > 0) {
    wqi = wqi / validParams;
  }
  
  // Determine status based on WQI value
  let status = 'excellent';
  if (wqi < 25) status = 'very_poor';
  else if (wqi < 50) status = 'poor';
  else if (wqi < 70) status = 'fair';
  else if (wqi < 90) status = 'good';
  
  return { value: wqi, status };
};

// Method to calculate overall metrics
waterQualityDataSchema.methods.calculateMetrics = async function() {
  // Calculate HMPI
  const hmpiResult = this.calculateHMPI();
  this.calculatedMetrics.hmpi = hmpiResult;
  
  // Calculate WQI
  const wqiResult = this.calculateWQI();
  this.calculatedMetrics.wqi = wqiResult;
  
  // Determine overall status
  const criticalParams = Object.values(this.parameters).filter(param => 
    param && param.status === 'critical'
  ).length;
  
  const unsafeParams = Object.values(this.parameters).filter(param => 
    param && param.status === 'unsafe'
  ).length;
  
  if (criticalParams > 0 || hmpiResult.status === 'critical') {
    this.calculatedMetrics.overallStatus = 'critical';
    this.calculatedMetrics.riskLevel = 'critical';
  } else if (unsafeParams > 2 || hmpiResult.status === 'unsafe') {
    this.calculatedMetrics.overallStatus = 'unsafe';
    this.calculatedMetrics.riskLevel = 'high';
  } else if (unsafeParams > 0) {
    this.calculatedMetrics.overallStatus = 'unsafe';
    this.calculatedMetrics.riskLevel = 'medium';
  } else {
    this.calculatedMetrics.overallStatus = 'safe';
    this.calculatedMetrics.riskLevel = 'low';
  }
  
  this.calculatedMetrics.calculationDate = new Date();
};

// Static method to get data by user
waterQualityDataSchema.statics.findByUser = function(userId, options = {}) {
  const query = { userId };
  if (options.dataSource) query.dataSource = options.dataSource;
  if (options.status) query['calculatedMetrics.overallStatus'] = options.status;
  
  return this.find(query).sort({ sampleDate: -1 });
};

// Static method to get aggregated metrics
waterQualityDataSchema.statics.getAggregatedMetrics = function(userId, dataSource = null) {
  const matchStage = { userId };
  if (dataSource) matchStage.dataSource = dataSource;
  
  return this.aggregate([
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
        avgWQI: { $avg: '$calculatedMetrics.wqi.value' }
      }
    }
  ]);
};

export default mongoose.model('WaterQualityData', waterQualityDataSchema);
