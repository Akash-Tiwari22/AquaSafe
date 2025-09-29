import XLSX from 'xlsx';
import csv from 'csv-parser';
import fs from 'fs';
import { createReadStream } from 'fs';
import { logger, logFileOperation } from './logger.js';
import { AppError } from '../middleware/errorHandler.js';

// Process CSV file
export const processCSV = async (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = createReadStream(filePath);
    
    const parser = csv({
      mapHeaders: ({ header }) => (header ? String(header).trim() : header),
      mapValues: ({ value }) => (typeof value === 'string' ? value.trim() : value),
      skipLines: 0
    });
    
    stream
      .on('error', (error) => {
        logger.error('CSV read stream failed', { filePath, error: error.message });
        reject(new AppError('Failed to read CSV file', 400));
      })
      .pipe(parser)
      .on('data', (data) => {
        const cleanedData = cleanWaterQualityData(data);
        if (cleanedData) {
          results.push(cleanedData);
        }
      })
      .on('end', () => {
        logger.info('CSV processing completed', { 
          filePath, 
          recordCount: results.length 
        });
        resolve(results);
      })
      .on('error', (error) => {
        logger.error('CSV processing failed', { filePath, error: error.message });
        reject(new AppError('Failed to process CSV file', 400));
      });
  });
};

// Process Excel file
export const processExcel = async (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath, { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new AppError('Excel file has no sheets', 400);
    }
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new AppError('Failed to read Excel worksheet', 400);
    }
    
    const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    
    const results = rawData
      .map((data) => cleanWaterQualityData(data))
      .filter((data) => data !== null);
    
    logger.info('Excel processing completed', { 
      filePath, 
      recordCount: results.length 
    });
    
    return results;
  } catch (error) {
    logger.error('Excel processing failed', { filePath, error: error.message });
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to process Excel file', 400);
  }
};

// Clean and validate water quality data
const cleanWaterQualityData = (rawData) => {
  try {
    // Define parameter mappings (case-insensitive)
    const parameterMappings = {
      // Physical parameters
      'ph': 'pH',
      'temperature': 'temperature',
      'temp': 'temperature',
      'turbidity': 'turbidity',
      'total dissolved solids': 'totalDissolvedSolids',
      'tds': 'totalDissolvedSolids',
      'electrical conductivity': 'electricalConductivity',
      'ec': 'electricalConductivity',
      
      // Chemical parameters
      'dissolved oxygen': 'dissolvedOxygen',
      'do': 'dissolvedOxygen',
      'biochemical oxygen demand': 'biochemicalOxygenDemand',
      'bod': 'biochemicalOxygenDemand',
      'chemical oxygen demand': 'chemicalOxygenDemand',
      'cod': 'chemicalOxygenDemand',
      'total alkalinity': 'totalAlkalinity',
      'total hardness': 'totalHardness',
      
      // Heavy metals
      'arsenic': 'arsenic',
      'as': 'arsenic',
      'lead': 'lead',
      'pb': 'lead',
      'mercury': 'mercury',
      'hg': 'mercury',
      'cadmium': 'cadmium',
      'cd': 'cadmium',
      'chromium': 'chromium',
      'cr': 'chromium',
      'nickel': 'nickel',
      'ni': 'nickel',
      'copper': 'copper',
      'cu': 'copper',
      'zinc': 'zinc',
      'zn': 'zinc',
      'iron': 'iron',
      'fe': 'iron',
      'manganese': 'manganese',
      'mn': 'manganese',
      
      // Nutrients
      'nitrate': 'nitrate',
      'no3': 'nitrate',
      'nitrite': 'nitrite',
      'no2': 'nitrite',
      'phosphate': 'phosphate',
      'po4': 'phosphate',
      'ammonia': 'ammonia',
      'nh3': 'ammonia',
      
      // Microbiological
      'total coliforms': 'totalColiforms',
      'fecal coliforms': 'fecalColiforms',
      'e.coli': 'eColi',
      'e coli': 'eColi'
    };
    
    // Clean and map data
    const cleanedData = {};
    
    // Helper to normalize header (strip units and parentheses)
    const normalizeHeader = (k) => {
      if (!k) return '';
      // Extract content before '(' to drop unit annotations like (µg/L)
      const base = String(k).split('(')[0].trim().toLowerCase();
      return base;
    };
    
    // Detect if a header hints at micro units (µg/L or ug/L)
    const headerHintsMicro = (k) => {
      const lower = String(k).toLowerCase();
      return lower.includes('µg') || lower.includes('ug') || lower.includes('micro');
    };
    
    const heavyMetalsSet = new Set(['arsenic','lead','mercury','cadmium','chromium','nickel','copper','zinc','iron','manganese']);
    
    // Process each field in raw data
    Object.keys(rawData || {}).forEach(key => {
      const normalizedKey = normalizeHeader(key);
      const mappedKey = parameterMappings[normalizedKey] || parameterMappings[key.toLowerCase().trim()];
      
      if (mappedKey && rawData[key] !== null && rawData[key] !== undefined && rawData[key] !== '') {
        let value = parseFloat(rawData[key]);
        if (!isNaN(value) && value >= 0) {
          // If heavy metal and header suggests micro units, convert µg/L -> mg/L
          if (heavyMetalsSet.has(mappedKey) && headerHintsMicro(key)) {
            value = value / 1000; // 1000 µg = 1 mg
          }
          cleanedData[mappedKey] = value;
        }
      }
    });
    
    // Extract sample date
    let sampleDate = new Date();
    if (rawData && (rawData.date || rawData.sample_date || rawData.timestamp)) {
      const dateValue = rawData.date || rawData.sample_date || rawData.timestamp;
      const parsedDate = new Date(dateValue);
      if (!isNaN(parsedDate.getTime())) {
        sampleDate = parsedDate;
      }
    }
    
    // Extract location information
    const location = {
      name: (rawData && (rawData.location || rawData.site || rawData.station)) || 'Unknown',
      coordinates: {
        latitude: rawData ? (parseFloat(rawData.latitude || rawData.lat) || null) : null,
        longitude: rawData ? (parseFloat(rawData.longitude || rawData.lng || rawData.lon) || null) : null
      },
      region: rawData ? (rawData.region || null) : null,
      state: rawData ? (rawData.state || null) : null,
      country: rawData ? (rawData.country || null) : null
    };
    
    // Only return data if we have at least some parameters
    if (Object.keys(cleanedData).length === 0) {
      return null;
    }
    
    return {
      sampleDate,
      location,
      parameters: cleanedData
    };
  } catch (error) {
    logger.error('Data cleaning failed', { error: error.message, rawData });
    return null;
  }
};

// Process file based on type
export const processFile = async (filePath, fileType) => {
  try {
    logFileOperation('process_start', filePath, 0, null, true);
    
    let data;
    switch (fileType.toLowerCase()) {
      case 'csv':
        data = await processCSV(filePath);
        break;
      case 'xlsx':
      case 'xls':
        data = await processExcel(filePath);
        break;
      default:
        throw new AppError('Unsupported file type', 400);
    }
    
    if (!data || data.length === 0) {
      throw new AppError('No valid data found in file', 400);
    }
    
    logFileOperation('process_complete', filePath, 0, null, true, { 
      recordCount: data.length 
    });
    
    return data;
  } catch (error) {
    logFileOperation('process_failed', filePath, 0, null, false, { 
      error: error.message 
    });
    throw error;
  }
};

// Validate water quality data
export const validateWaterQualityData = (data) => {
  const errors = [];
  
  // Check required fields
  if (!data.sampleDate) {
    errors.push('Sample date is required');
  }
  
  if (!data.parameters || Object.keys(data.parameters).length === 0) {
    errors.push('At least one water quality parameter is required');
  }
  
  // Validate parameter values
  if (data.parameters) {
    Object.keys(data.parameters).forEach(param => {
      const value = data.parameters[param];
      if (typeof value !== 'number' || isNaN(value) || value < 0) {
        errors.push(`Invalid value for parameter ${param}: ${value}`);
      }
    });
  }
  
  // Validate date
  if (data.sampleDate && isNaN(new Date(data.sampleDate).getTime())) {
    errors.push('Invalid sample date');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generate sample data for testing
export const generateSampleData = (count = 10) => {
  const sampleData = [];
  const parameters = [
    'pH', 'temperature', 'turbidity', 'totalDissolvedSolids', 'electricalConductivity',
    'dissolvedOxygen', 'biochemicalOxygenDemand', 'chemicalOxygenDemand',
    'arsenic', 'lead', 'mercury', 'cadmium', 'chromium', 'nickel', 'copper', 'zinc', 'iron', 'manganese',
    'nitrate', 'nitrite', 'phosphate', 'ammonia',
    'totalColiforms', 'fecalColiforms', 'eColi'
  ];
  
  for (let i = 0; i < count; i++) {
    const data = {
      sampleDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
      location: {
        name: `Sample Site ${i + 1}`,
        coordinates: {
          latitude: 28.6139 + (Math.random() - 0.5) * 0.1,
          longitude: 77.2090 + (Math.random() - 0.5) * 0.1
        },
        region: 'Delhi NCR',
        state: 'Delhi',
        country: 'India'
      },
      parameters: {}
    };
    
    // Generate random values for parameters
    parameters.forEach(param => {
      const baseValue = getBaseValue(param);
      const variation = baseValue * 0.3; // 30% variation
      const value = baseValue + (Math.random() - 0.5) * variation;
      data.parameters[param] = Math.max(0, value);
    });
    
    sampleData.push(data);
  }
  
  return sampleData;
};

// Get base value for parameter
const getBaseValue = (parameter) => {
  const baseValues = {
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
  };
  
  return baseValues[parameter] || 1.0;
};

// Export data to CSV
export const exportToCSV = (data, filename) => {
  try {
    const csvContent = convertToCSV(data);
    const filePath = `./exports/${filename}`;
    
    // Ensure exports directory exists
    const fs = require('fs');
    if (!fs.existsSync('./exports')) {
      fs.mkdirSync('./exports', { recursive: true });
    }
    
    fs.writeFileSync(filePath, csvContent);
    
    logger.info('Data exported to CSV', { filename, recordCount: data.length });
    return filePath;
  } catch (error) {
    logger.error('CSV export failed', { error: error.message });
    throw new AppError('Failed to export data to CSV', 500);
  }
};

// Convert data to CSV format
const convertToCSV = (data) => {
  if (!data || data.length === 0) {
    return '';
  }
  
  // Get all unique parameters
  const allParameters = new Set();
  data.forEach(record => {
    if (record.parameters) {
      Object.keys(record.parameters).forEach(param => allParameters.add(param));
    }
  });
  
  const parameters = Array.from(allParameters);
  
  // Create header
  const header = ['Sample Date', 'Location', 'Latitude', 'Longitude', ...parameters];
  
  // Create rows
  const rows = data.map(record => {
    const row = [
      record.sampleDate ? new Date(record.sampleDate).toISOString().split('T')[0] : '',
      record.location?.name || '',
      record.location?.coordinates?.latitude || '',
      record.location?.coordinates?.longitude || '',
      ...parameters.map(param => record.parameters?.[param] || '')
    ];
    return row;
  });
  
  // Combine header and rows
  const csvContent = [header, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
  
  return csvContent;
};

export default {
  processCSV,
  processExcel,
  processFile,
  validateWaterQualityData,
  generateSampleData,
  exportToCSV,
  cleanWaterQualityData
};
