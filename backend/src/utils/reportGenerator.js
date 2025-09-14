import jsPDF from 'jspdf';
import 'jspdf-autotable';
import XLSX from 'xlsx';
import { logger } from './logger.js';
import { WATER_QUALITY_STANDARDS } from './waterQualityAnalysis.js';

// Generate PDF report
export const generatePDFReport = async (report, data) => {
  try {
    const doc = new jsPDF({
      orientation: report.configuration.orientation || 'portrait',
      unit: 'mm',
      format: report.configuration.pageSize || 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;
    
    // Add header
    if (report.configuration.logo) {
      // Add logo (placeholder for now)
      doc.setFontSize(24);
      doc.setTextColor(74, 144, 226); // AquaSafe blue
      doc.text('🌊 AquaSafe', 20, yPosition);
    } else {
      doc.setFontSize(24);
      doc.setTextColor(74, 144, 226);
      doc.text('🌊 AquaSafe', 20, yPosition);
    }
    
    yPosition += 15;
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(report.title, 20, yPosition);
    yPosition += 10;
    
    // Add description
    if (report.description) {
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(report.description, 20, yPosition);
      yPosition += 15;
    }
    
    // Add report metadata
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);
    doc.text(`Report Type: ${report.reportType}`, pageWidth - 60, yPosition);
    yPosition += 10;
    
    // Add executive summary
    if (report.content?.executiveSummary) {
      yPosition = addSection(doc, 'Executive Summary', report.content.executiveSummary, yPosition, pageWidth);
    }
    
    // Add key findings
    if (report.content?.keyFindings && report.content.keyFindings.length > 0) {
      yPosition = addKeyFindings(doc, report.content.keyFindings, yPosition, pageWidth);
    }
    
    // Add data summary
    yPosition = addDataSummary(doc, data, yPosition, pageWidth);
    
    // Add parameter analysis
    if (report.configuration.includeTables) {
      yPosition = addParameterAnalysis(doc, data, yPosition, pageWidth);
    }
    
    // Add recommendations
    if (report.content?.recommendations && report.content.recommendations.length > 0) {
      yPosition = addRecommendations(doc, report.content.recommendations, yPosition, pageWidth);
    }
    
    // Add footer
    if (report.configuration.footer) {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(report.configuration.footer, 20, pageHeight - 10);
    }
    
    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10);
    }
    
    // Save file
    const fileName = `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
    const filePath = `./reports/${fileName}`;
    
    // Ensure reports directory exists
    const fs = require('fs');
    if (!fs.existsSync('./reports')) {
      fs.mkdirSync('./reports', { recursive: true });
    }
    
    doc.save(filePath);
    
    logger.info('PDF report generated successfully', { fileName, filePath });
    
    return {
      filePath,
      fileName,
      mimeType: 'application/pdf'
    };
    
  } catch (error) {
    logger.error('PDF report generation failed', { error: error.message });
    throw error;
  }
};

// Generate Excel report
export const generateExcelReport = async (report, data) => {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = generateSummaryData(data);
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Raw data sheet
    const rawData = generateRawData(data);
    const rawDataSheet = XLSX.utils.json_to_sheet(rawData);
    XLSX.utils.book_append_sheet(workbook, rawDataSheet, 'Raw Data');
    
    // Parameter analysis sheet
    const parameterData = generateParameterAnalysis(data);
    const parameterSheet = XLSX.utils.json_to_sheet(parameterData);
    XLSX.utils.book_append_sheet(workbook, parameterSheet, 'Parameter Analysis');
    
    // Location analysis sheet
    const locationData = generateLocationAnalysis(data);
    const locationSheet = XLSX.utils.json_to_sheet(locationData);
    XLSX.utils.book_append_sheet(workbook, locationSheet, 'Location Analysis');
    
    // Save file
    const fileName = `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.xlsx`;
    const filePath = `./reports/${fileName}`;
    
    // Ensure reports directory exists
    const fs = require('fs');
    if (!fs.existsSync('./reports')) {
      fs.mkdirSync('./reports', { recursive: true });
    }
    
    XLSX.writeFile(workbook, filePath);
    
    logger.info('Excel report generated successfully', { fileName, filePath });
    
    return {
      filePath,
      fileName,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    
  } catch (error) {
    logger.error('Excel report generation failed', { error: error.message });
    throw error;
  }
};

// Helper function to add section to PDF
const addSection = (doc, title, content, yPosition, pageWidth) => {
  // Check if we need a new page
  if (yPosition > doc.internal.pageSize.getHeight() - 50) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Add section title
  doc.setFontSize(14);
  doc.setTextColor(74, 144, 226);
  doc.text(title, 20, yPosition);
  yPosition += 8;
  
  // Add content
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const lines = doc.splitTextToSize(content, pageWidth - 40);
  doc.text(lines, 20, yPosition);
  yPosition += lines.length * 5 + 10;
  
  return yPosition;
};

// Helper function to add key findings
const addKeyFindings = (doc, findings, yPosition, pageWidth) => {
  if (yPosition > doc.internal.pageSize.getHeight() - 50) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Add section title
  doc.setFontSize(14);
  doc.setTextColor(74, 144, 226);
  doc.text('Key Findings', 20, yPosition);
  yPosition += 8;
  
  // Add findings
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  findings.forEach((finding, index) => {
    if (yPosition > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(`• ${finding}`, 25, yPosition);
    yPosition += 6;
  });
  
  return yPosition + 10;
};

// Helper function to add data summary
const addDataSummary = (doc, data, yPosition, pageWidth) => {
  if (yPosition > doc.internal.pageSize.getHeight() - 50) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Add section title
  doc.setFontSize(14);
  doc.setTextColor(74, 144, 226);
  doc.text('Data Summary', 20, yPosition);
  yPosition += 8;
  
  // Calculate summary statistics
  const totalSamples = data.length;
  const safeSamples = data.filter(d => d.analysis?.overallStatus === 'safe').length;
  const unsafeSamples = data.filter(d => d.analysis?.overallStatus === 'unsafe').length;
  const criticalSamples = data.filter(d => d.analysis?.overallStatus === 'critical').length;
  
  const avgHMPI = data.reduce((sum, d) => sum + (d.analysis?.hmpi?.value || 0), 0) / totalSamples;
  const avgWQI = data.reduce((sum, d) => sum + (d.analysis?.wqi?.value || 0), 0) / totalSamples;
  
  // Add summary table
  const summaryData = [
    ['Metric', 'Value'],
    ['Total Samples', totalSamples.toString()],
    ['Safe Samples', safeSamples.toString()],
    ['Unsafe Samples', unsafeSamples.toString()],
    ['Critical Samples', criticalSamples.toString()],
    ['Average HMPI', avgHMPI.toFixed(2)],
    ['Average WQI', avgWQI.toFixed(2)],
    ['Safe Percentage', ((safeSamples / totalSamples) * 100).toFixed(1) + '%']
  ];
  
  doc.autoTable({
    head: [summaryData[0]],
    body: summaryData.slice(1),
    startY: yPosition,
    theme: 'grid',
    headStyles: { fillColor: [74, 144, 226] },
    margin: { left: 20, right: 20 }
  });
  
  yPosition = doc.lastAutoTable.finalY + 10;
  
  return yPosition;
};

// Helper function to add parameter analysis
const addParameterAnalysis = (doc, data, yPosition, pageWidth) => {
  if (yPosition > doc.internal.pageSize.getHeight() - 50) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Add section title
  doc.setFontSize(14);
  doc.setTextColor(74, 144, 226);
  doc.text('Parameter Analysis', 20, yPosition);
  yPosition += 8;
  
  // Get all parameters
  const allParameters = new Set();
  data.forEach(sample => {
    if (sample.parameters) {
      Object.keys(sample.parameters).forEach(param => allParameters.add(param));
    }
  });
  
  // Analyze each parameter
  const parameterData = [];
  allParameters.forEach(param => {
    const values = data
      .filter(sample => sample.parameters && sample.parameters[param] !== undefined)
      .map(sample => sample.parameters[param].value);
    
    if (values.length > 0) {
      const sortedValues = values.sort((a, b) => a - b);
      const mean = sortedValues.reduce((a, b) => a + b, 0) / sortedValues.length;
      const median = sortedValues[Math.floor(sortedValues.length / 2)];
      const min = sortedValues[0];
      const max = sortedValues[sortedValues.length - 1];
      
      parameterData.push([
        param,
        values.length.toString(),
        mean.toFixed(2),
        median.toFixed(2),
        min.toFixed(2),
        max.toFixed(2)
      ]);
    }
  });
  
  if (parameterData.length > 0) {
    const tableData = [
      ['Parameter', 'Count', 'Mean', 'Median', 'Min', 'Max'],
      ...parameterData
    ];
    
    doc.autoTable({
      head: [tableData[0]],
      body: tableData.slice(1),
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [74, 144, 226] },
      margin: { left: 20, right: 20 }
    });
    
    yPosition = doc.lastAutoTable.finalY + 10;
  }
  
  return yPosition;
};

// Helper function to add recommendations
const addRecommendations = (doc, recommendations, yPosition, pageWidth) => {
  if (yPosition > doc.internal.pageSize.getHeight() - 50) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Add section title
  doc.setFontSize(14);
  doc.setTextColor(74, 144, 226);
  doc.text('Recommendations', 20, yPosition);
  yPosition += 8;
  
  // Add recommendations
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  recommendations.forEach((recommendation, index) => {
    if (yPosition > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(`${index + 1}. ${recommendation}`, 25, yPosition);
    yPosition += 6;
  });
  
  return yPosition + 10;
};

// Generate summary data for Excel
const generateSummaryData = (data) => {
  const totalSamples = data.length;
  const safeSamples = data.filter(d => d.analysis?.overallStatus === 'safe').length;
  const unsafeSamples = data.filter(d => d.analysis?.overallStatus === 'unsafe').length;
  const criticalSamples = data.filter(d => d.analysis?.overallStatus === 'critical').length;
  
  const avgHMPI = data.reduce((sum, d) => sum + (d.analysis?.hmpi?.value || 0), 0) / totalSamples;
  const avgWQI = data.reduce((sum, d) => sum + (d.analysis?.wqi?.value || 0), 0) / totalSamples;
  
  return [
    { Metric: 'Total Samples', Value: totalSamples },
    { Metric: 'Safe Samples', Value: safeSamples },
    { Metric: 'Unsafe Samples', Value: unsafeSamples },
    { Metric: 'Critical Samples', Value: criticalSamples },
    { Metric: 'Average HMPI', Value: avgHMPI.toFixed(2) },
    { Metric: 'Average WQI', Value: avgWQI.toFixed(2) },
    { Metric: 'Safe Percentage', Value: ((safeSamples / totalSamples) * 100).toFixed(1) + '%' }
  ];
};

// Generate raw data for Excel
const generateRawData = (data) => {
  return data.map(sample => ({
    'Sample Date': sample.sampleDate ? new Date(sample.sampleDate).toLocaleDateString() : '',
    'Location': sample.location?.name || '',
    'Latitude': sample.location?.coordinates?.latitude || '',
    'Longitude': sample.location?.coordinates?.longitude || '',
    'HMPI': sample.analysis?.hmpi?.value || 0,
    'WQI': sample.analysis?.wqi?.value || 0,
    'Overall Status': sample.analysis?.overallStatus || 'unknown',
    'Risk Level': sample.analysis?.riskLevel || 'unknown',
    ...Object.keys(sample.parameters || {}).reduce((acc, param) => {
      acc[param] = sample.parameters[param].value || 0;
      return acc;
    }, {})
  }));
};

// Generate parameter analysis for Excel
const generateParameterAnalysis = (data) => {
  const allParameters = new Set();
  data.forEach(sample => {
    if (sample.parameters) {
      Object.keys(sample.parameters).forEach(param => allParameters.add(param));
    }
  });
  
  const parameterData = [];
  allParameters.forEach(param => {
    const values = data
      .filter(sample => sample.parameters && sample.parameters[param] !== undefined)
      .map(sample => sample.parameters[param].value);
    
    if (values.length > 0) {
      const sortedValues = values.sort((a, b) => a - b);
      const mean = sortedValues.reduce((a, b) => a + b, 0) / sortedValues.length;
      const median = sortedValues[Math.floor(sortedValues.length / 2)];
      const min = sortedValues[0];
      const max = sortedValues[sortedValues.length - 1];
      
      // Calculate standard deviation
      const variance = sortedValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / sortedValues.length;
      const stdDev = Math.sqrt(variance);
      
      parameterData.push({
        Parameter: param,
        Count: values.length,
        Mean: mean.toFixed(2),
        Median: median.toFixed(2),
        Min: min.toFixed(2),
        Max: max.toFixed(2),
        'Std Dev': stdDev.toFixed(2)
      });
    }
  });
  
  return parameterData;
};

// Generate location analysis for Excel
const generateLocationAnalysis = (data) => {
  const locationMap = new Map();
  
  data.forEach(sample => {
    const locationName = sample.location?.name || 'Unknown';
    if (!locationMap.has(locationName)) {
      locationMap.set(locationName, {
        location: locationName,
        latitude: sample.location?.coordinates?.latitude || '',
        longitude: sample.location?.coordinates?.longitude || '',
        samples: [],
        hmpiValues: [],
        wqiValues: []
      });
    }
    
    const locationData = locationMap.get(locationName);
    locationData.samples.push(sample);
    if (sample.analysis?.hmpi?.value) {
      locationData.hmpiValues.push(sample.analysis.hmpi.value);
    }
    if (sample.analysis?.wqi?.value) {
      locationData.wqiValues.push(sample.analysis.wqi.value);
    }
  });
  
  const locationData = [];
  locationMap.forEach((data, locationName) => {
    const totalSamples = data.samples.length;
    const safeSamples = data.samples.filter(s => s.analysis?.overallStatus === 'safe').length;
    const avgHMPI = data.hmpiValues.length > 0 ? 
      data.hmpiValues.reduce((a, b) => a + b, 0) / data.hmpiValues.length : 0;
    const avgWQI = data.wqiValues.length > 0 ? 
      data.wqiValues.reduce((a, b) => a + b, 0) / data.wqiValues.length : 0;
    
    locationData.push({
      Location: locationName,
      Latitude: data.latitude,
      Longitude: data.longitude,
      'Total Samples': totalSamples,
      'Safe Samples': safeSamples,
      'Safe Percentage': ((safeSamples / totalSamples) * 100).toFixed(1) + '%',
      'Average HMPI': avgHMPI.toFixed(2),
      'Average WQI': avgWQI.toFixed(2)
    });
  });
  
  return locationData;
};

export default {
  generatePDFReport,
  generateExcelReport
};
