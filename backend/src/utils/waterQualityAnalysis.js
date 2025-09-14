import { logger, logAnalysis } from './logger.js';

// Water Quality Standards (WHO/EPA guidelines)
const WATER_QUALITY_STANDARDS = {
  pH: { min: 6.5, max: 8.5, unit: 'pH units' },
  temperature: { max: 30, unit: '°C' },
  turbidity: { max: 5, unit: 'NTU' },
  totalDissolvedSolids: { max: 500, unit: 'mg/L' },
  electricalConductivity: { max: 1000, unit: 'μS/cm' },
  dissolvedOxygen: { min: 5, unit: 'mg/L' },
  biochemicalOxygenDemand: { max: 3, unit: 'mg/L' },
  chemicalOxygenDemand: { max: 10, unit: 'mg/L' },
  totalAlkalinity: { max: 200, unit: 'mg/L' },
  totalHardness: { max: 300, unit: 'mg/L' },
  arsenic: { max: 0.01, unit: 'mg/L' },
  lead: { max: 0.01, unit: 'mg/L' },
  mercury: { max: 0.001, unit: 'mg/L' },
  cadmium: { max: 0.003, unit: 'mg/L' },
  chromium: { max: 0.05, unit: 'mg/L' },
  nickel: { max: 0.02, unit: 'mg/L' },
  copper: { max: 1.0, unit: 'mg/L' },
  zinc: { max: 3.0, unit: 'mg/L' },
  iron: { max: 0.3, unit: 'mg/L' },
  manganese: { max: 0.1, unit: 'mg/L' },
  nitrate: { max: 45, unit: 'mg/L' },
  nitrite: { max: 3, unit: 'mg/L' },
  phosphate: { max: 0.1, unit: 'mg/L' },
  ammonia: { max: 0.5, unit: 'mg/L' },
  totalColiforms: { max: 0, unit: 'MPN/100mL' },
  fecalColiforms: { max: 0, unit: 'MPN/100mL' },
  eColi: { max: 0, unit: 'MPN/100mL' }
};

// Calculate HMPI (Heavy Metal Pollution Index)
export const calculateHMPI = (parameters) => {
  const heavyMetals = [
    'arsenic', 'lead', 'mercury', 'cadmium', 'chromium', 
    'nickel', 'copper', 'zinc', 'iron', 'manganese'
  ];
  
  let hmpi = 0;
  let validMetals = 0;
  
  heavyMetals.forEach(metal => {
    const value = parameters[metal];
    const standard = WATER_QUALITY_STANDARDS[metal];
    
    if (value !== null && value !== undefined && !isNaN(value) && standard) {
      hmpi += (value / standard.max);
      validMetals++;
    }
  });
  
  if (validMetals === 0) {
    return { value: 0, status: 'safe', confidence: 0 };
  }
  
  hmpi = hmpi / validMetals;
  
  // Determine status based on HMPI value
  let status = 'safe';
  if (hmpi > 2) status = 'critical';
  else if (hmpi > 1) status = 'unsafe';
  
  // Calculate confidence based on number of parameters
  const confidence = Math.min(1, validMetals / heavyMetals.length);
  
  return { value: hmpi, status, confidence };
};

// Calculate WQI (Water Quality Index)
export const calculateWQI = (parameters) => {
  const wqiParameters = [
    'pH', 'dissolvedOxygen', 'turbidity', 'totalDissolvedSolids', 'nitrate'
  ];
  
  let wqi = 0;
  let validParams = 0;
  
  wqiParameters.forEach(param => {
    const value = parameters[param];
    const standard = WATER_QUALITY_STANDARDS[param];
    
    if (value !== null && value !== undefined && !isNaN(value) && standard) {
      let qualityRating;
      
      if (param === 'pH') {
        // pH has min and max values
        if (value >= standard.min && value <= standard.max) {
          qualityRating = 100;
        } else {
          const deviation = Math.min(
            Math.abs(value - standard.min),
            Math.abs(value - standard.max)
          );
          qualityRating = Math.max(0, 100 - (deviation * 20));
        }
      } else if (param === 'dissolvedOxygen') {
        // Higher is better for DO
        qualityRating = Math.min(100, (value / standard.min) * 100);
      } else {
        // Lower is better for other parameters
        qualityRating = Math.min(100, (standard.max / value) * 100);
      }
      
      wqi += qualityRating;
      validParams++;
    }
  });
  
  if (validParams === 0) {
    return { value: 0, status: 'very_poor', confidence: 0 };
  }
  
  wqi = wqi / validParams;
  
  // Determine status based on WQI value
  let status = 'excellent';
  if (wqi < 25) status = 'very_poor';
  else if (wqi < 50) status = 'poor';
  else if (wqi < 70) status = 'fair';
  else if (wqi < 90) status = 'good';
  
  const confidence = Math.min(1, validParams / wqiParameters.length);
  
  return { value: wqi, status, confidence };
};

// Analyze individual parameter
export const analyzeParameter = (parameter, value) => {
  const standard = WATER_QUALITY_STANDARDS[parameter];
  
  if (!standard || value === null || value === undefined || isNaN(value)) {
    return {
      value,
      standard: null,
      status: 'unknown',
      unit: standard?.unit || 'unknown',
      riskLevel: 'unknown'
    };
  }
  
  let status = 'safe';
  let riskLevel = 'low';
  
  if (parameter === 'pH') {
    if (value < standard.min || value > standard.max) {
      status = 'unsafe';
      riskLevel = 'high';
    } else if (value < standard.min + 0.5 || value > standard.max - 0.5) {
      status = 'unsafe';
      riskLevel = 'medium';
    }
  } else if (parameter === 'dissolvedOxygen') {
    if (value < standard.min) {
      status = 'critical';
      riskLevel = 'critical';
    } else if (value < standard.min + 1) {
      status = 'unsafe';
      riskLevel = 'high';
    }
  } else {
    if (value > standard.max * 2) {
      status = 'critical';
      riskLevel = 'critical';
    } else if (value > standard.max) {
      status = 'unsafe';
      riskLevel = 'high';
    } else if (value > standard.max * 0.8) {
      status = 'unsafe';
      riskLevel = 'medium';
    }
  }
  
  return {
    value,
    standard: standard.max || standard.min,
    status,
    unit: standard.unit,
    riskLevel,
    deviation: parameter === 'pH' ? 
      Math.min(Math.abs(value - standard.min), Math.abs(value - standard.max)) :
      value - (standard.max || standard.min)
  };
};

// Analyze all parameters
export const analyzeAllParameters = (parameters) => {
  const results = {};
  let safeCount = 0;
  let unsafeCount = 0;
  let criticalCount = 0;
  
  Object.keys(parameters).forEach(param => {
    const analysis = analyzeParameter(param, parameters[param]);
    results[param] = analysis;
    
    if (analysis.status === 'safe') safeCount++;
    else if (analysis.status === 'unsafe') unsafeCount++;
    else if (analysis.status === 'critical') criticalCount++;
  });
  
  return {
    parameters: results,
    summary: {
      total: Object.keys(parameters).length,
      safe: safeCount,
      unsafe: unsafeCount,
      critical: criticalCount
    }
  };
};

// Calculate overall water quality status
export const calculateOverallStatus = (parameters) => {
  const analysis = analyzeAllParameters(parameters);
  const hmpi = calculateHMPI(parameters);
  const wqi = calculateWQI(parameters);
  
  let overallStatus = 'safe';
  let riskLevel = 'low';
  
  // Determine overall status
  if (analysis.summary.critical > 0 || hmpi.status === 'critical') {
    overallStatus = 'critical';
    riskLevel = 'critical';
  } else if (analysis.summary.unsafe > 2 || hmpi.status === 'unsafe') {
    overallStatus = 'unsafe';
    riskLevel = 'high';
  } else if (analysis.summary.unsafe > 0) {
    overallStatus = 'unsafe';
    riskLevel = 'medium';
  }
  
  return {
    overallStatus,
    riskLevel,
    hmpi,
    wqi,
    parameterAnalysis: analysis,
    confidence: Math.min(hmpi.confidence, wqi.confidence)
  };
};

// Generate key findings
export const generateKeyFindings = (analysis) => {
  const findings = [];
  const { parameters, hmpi, wqi, overallStatus } = analysis;
  
  // Overall status finding
  if (overallStatus === 'critical') {
    findings.push('Water quality is critical and poses immediate health risks');
  } else if (overallStatus === 'unsafe') {
    findings.push('Water quality is unsafe and requires immediate attention');
  } else {
    findings.push('Water quality is within acceptable limits');
  }
  
  // HMPI finding
  if (hmpi.value > 2) {
    findings.push(`Heavy metal pollution is critical (HMPI: ${hmpi.value.toFixed(2)})`);
  } else if (hmpi.value > 1) {
    findings.push(`Heavy metal pollution is elevated (HMPI: ${hmpi.value.toFixed(2)})`);
  }
  
  // WQI finding
  if (wqi.value < 50) {
    findings.push(`Water quality index is poor (WQI: ${wqi.value.toFixed(1)})`);
  } else if (wqi.value < 70) {
    findings.push(`Water quality index is fair (WQI: ${wqi.value.toFixed(1)})`);
  }
  
  // Parameter-specific findings
  Object.keys(parameters).forEach(param => {
    const paramAnalysis = parameters[param];
    if (paramAnalysis.status === 'critical') {
      findings.push(`${param} levels are critically high (${paramAnalysis.value} ${paramAnalysis.unit})`);
    } else if (paramAnalysis.status === 'unsafe') {
      findings.push(`${param} levels exceed safe limits (${paramAnalysis.value} ${paramAnalysis.unit})`);
    }
  });
  
  return findings;
};

// Generate recommendations
export const generateRecommendations = (analysis) => {
  const recommendations = [];
  const { parameters, hmpi, overallStatus } = analysis;
  
  if (overallStatus === 'critical') {
    recommendations.push('Immediate water treatment required before consumption');
    recommendations.push('Contact local water authority for emergency response');
  } else if (overallStatus === 'unsafe') {
    recommendations.push('Water treatment recommended before consumption');
    recommendations.push('Regular monitoring and testing advised');
  }
  
  // Heavy metal recommendations
  if (hmpi.value > 1) {
    recommendations.push('Implement heavy metal removal treatment');
    recommendations.push('Investigate source of heavy metal contamination');
  }
  
  // Parameter-specific recommendations
  Object.keys(parameters).forEach(param => {
    const paramAnalysis = parameters[param];
    if (paramAnalysis.status === 'critical' || paramAnalysis.status === 'unsafe') {
      switch (param) {
        case 'pH':
          recommendations.push('Adjust pH using appropriate treatment chemicals');
          break;
        case 'turbidity':
          recommendations.push('Implement filtration or sedimentation treatment');
          break;
        case 'dissolvedOxygen':
          recommendations.push('Improve aeration or reduce organic pollution');
          break;
        case 'totalColiforms':
        case 'fecalColiforms':
        case 'eColi':
          recommendations.push('Implement disinfection treatment (chlorination, UV, etc.)');
          break;
        default:
          recommendations.push(`Investigate and treat ${param} contamination`);
      }
    }
  });
  
  return [...new Set(recommendations)]; // Remove duplicates
};

// Calculate trend analysis
export const calculateTrends = (dataPoints) => {
  if (dataPoints.length < 2) {
    return {
      direction: 'insufficient_data',
      slope: 0,
      confidence: 0,
      trend: 'stable'
    };
  }
  
  // Sort by date
  const sortedData = dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Calculate linear regression
  const n = sortedData.length;
  const x = sortedData.map((_, index) => index);
  const y = sortedData.map(point => point.value);
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared
  const yMean = sumY / n;
  const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0);
  const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const rSquared = 1 - (ssRes / ssTot);
  
  // Determine trend direction
  let direction = 'stable';
  if (Math.abs(slope) > 0.1) {
    direction = slope > 0 ? 'increasing' : 'decreasing';
  }
  
  return {
    direction,
    slope,
    intercept,
    rSquared,
    confidence: Math.max(0, rSquared),
    trend: direction
  };
};

// Perform comprehensive analysis
export const performComprehensiveAnalysis = (data) => {
  try {
    const startTime = Date.now();
    
    // Analyze each data point
    const analysisResults = data.map(point => {
      const analysis = calculateOverallStatus(point.parameters);
      return {
        ...point,
        analysis,
        keyFindings: generateKeyFindings(analysis),
        recommendations: generateRecommendations(analysis)
      };
    });
    
    // Calculate aggregate metrics
    const totalSamples = analysisResults.length;
    const safeSamples = analysisResults.filter(r => r.analysis.overallStatus === 'safe').length;
    const unsafeSamples = analysisResults.filter(r => r.analysis.overallStatus === 'unsafe').length;
    const criticalSamples = analysisResults.filter(r => r.analysis.overallStatus === 'critical').length;
    
    const avgHMPI = analysisResults.reduce((sum, r) => sum + r.analysis.hmpi.value, 0) / totalSamples;
    const avgWQI = analysisResults.reduce((sum, r) => sum + r.analysis.wqi.value, 0) / totalSamples;
    
    // Calculate trends for key parameters
    const trends = {};
    const keyParameters = ['pH', 'dissolvedOxygen', 'turbidity', 'arsenic', 'lead'];
    
    keyParameters.forEach(param => {
      const paramData = analysisResults
        .filter(r => r.parameters[param] !== undefined)
        .map(r => ({ date: r.sampleDate, value: r.parameters[param] }));
      
      if (paramData.length > 1) {
        trends[param] = calculateTrends(paramData);
      }
    });
    
    const duration = Date.now() - startTime;
    
    logAnalysis('comprehensive', null, null, 'completed', duration, {
      sampleCount: totalSamples,
      safeCount: safeSamples,
      unsafeCount: unsafeSamples,
      criticalCount: criticalSamples
    });
    
    return {
      summary: {
        totalSamples,
        safeSamples,
        unsafeSamples,
        criticalSamples,
        safePercentage: (safeSamples / totalSamples) * 100,
        avgHMPI,
        avgWQI
      },
      analysisResults,
      trends,
      overallRecommendations: generateOverallRecommendations(analysisResults),
      dataQuality: assessDataQuality(data)
    };
  } catch (error) {
    logAnalysis('comprehensive', null, null, 'failed', 0, { error: error.message });
    throw error;
  }
};

// Generate overall recommendations
const generateOverallRecommendations = (analysisResults) => {
  const recommendations = [];
  
  const criticalCount = analysisResults.filter(r => r.analysis.overallStatus === 'critical').length;
  const unsafeCount = analysisResults.filter(r => r.analysis.overallStatus === 'unsafe').length;
  
  if (criticalCount > 0) {
    recommendations.push('Immediate action required - critical water quality issues detected');
  }
  
  if (unsafeCount > analysisResults.length * 0.3) {
    recommendations.push('Regular monitoring and treatment recommended');
  }
  
  if (analysisResults.some(r => r.analysis.hmpi.value > 1)) {
    recommendations.push('Heavy metal treatment system implementation advised');
  }
  
  return recommendations;
};

// Assess data quality
const assessDataQuality = (data) => {
  if (data.length === 0) {
    return { quality: 'poor', completeness: 0, reliability: 'low' };
  }
  
  const totalPossibleParams = Object.keys(WATER_QUALITY_STANDARDS).length;
  let totalParams = 0;
  let filledParams = 0;
  
  data.forEach(point => {
    Object.keys(point.parameters || {}).forEach(param => {
      totalParams++;
      if (point.parameters[param] !== null && point.parameters[param] !== undefined) {
        filledParams++;
      }
    });
  });
  
  const completeness = totalParams > 0 ? (filledParams / totalParams) * 100 : 0;
  
  let quality = 'excellent';
  if (completeness < 50) quality = 'poor';
  else if (completeness < 70) quality = 'fair';
  else if (completeness < 90) quality = 'good';
  
  let reliability = 'high';
  if (completeness < 50) reliability = 'low';
  else if (completeness < 70) reliability = 'medium';
  
  return { quality, completeness, reliability };
};

export {
  WATER_QUALITY_STANDARDS
};

export default {
  calculateHMPI,
  calculateWQI,
  analyzeParameter,
  analyzeAllParameters,
  calculateOverallStatus,
  generateKeyFindings,
  generateRecommendations,
  calculateTrends,
  performComprehensiveAnalysis,
  WATER_QUALITY_STANDARDS
};
