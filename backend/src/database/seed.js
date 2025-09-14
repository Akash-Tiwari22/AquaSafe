import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger.js';

// Load environment variables
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aquasafe', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('🗄️  MongoDB Connected for seeding');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Seed users
const seedUsers = async () => {
  try {
    const { User } = await import('./models/User.js');
    
    // Clear existing users
    await User.deleteMany({});
    
    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@aquasafe.com',
      password: 'admin123',
      organization: 'AquaSafe',
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          alerts: true
        },
        dashboard: {
          defaultView: 'overview',
          widgets: ['metrics', 'charts', 'alerts', 'trends']
        }
      },
      subscription: {
        plan: 'enterprise',
        isActive: true
      }
    });
    
    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@aquasafe.com',
      password: 'test123',
      organization: 'Test Organization',
      role: 'user',
      isEmailVerified: true,
      isActive: true,
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          push: false,
          alerts: true
        },
        dashboard: {
          defaultView: 'analysis',
          widgets: ['metrics', 'charts']
        }
      },
      subscription: {
        plan: 'basic',
        isActive: true
      }
    });
    
    // Create analyst user
    const analystUser = new User({
      name: 'Analyst User',
      email: 'analyst@aquasafe.com',
      password: 'analyst123',
      organization: 'Water Quality Lab',
      role: 'analyst',
      isEmailVerified: true,
      isActive: true,
      preferences: {
        theme: 'dark',
        notifications: {
          email: true,
          push: true,
          alerts: true
        },
        dashboard: {
          defaultView: 'analysis',
          widgets: ['metrics', 'charts', 'alerts', 'trends', 'predictions']
        }
      },
      subscription: {
        plan: 'premium',
        isActive: true
      }
    });
    
    await Promise.all([adminUser.save(), testUser.save(), analystUser.save()]);
    
    logger.info('✅ Users seeded successfully');
    return { adminUser, testUser, analystUser };
  } catch (error) {
    logger.error('User seeding failed:', error);
    throw error;
  }
};

// Seed water quality data
const seedWaterQualityData = async (users) => {
  try {
    const { WaterQualityData } = await import('./models/WaterQualityData.js');
    
    // Clear existing data
    await WaterQualityData.deleteMany({});
    
    const { testUser, analystUser } = users;
    const sampleData = [];
    
    // Generate sample data for test user
    for (let i = 0; i < 20; i++) {
      const sampleDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const location = {
        name: `Sample Site ${i + 1}`,
        coordinates: {
          latitude: 28.6139 + (Math.random() - 0.5) * 0.1,
          longitude: 77.2090 + (Math.random() - 0.5) * 0.1
        },
        region: 'Delhi NCR',
        state: 'Delhi',
        country: 'India'
      };
      
      // Generate random parameters
      const parameters = {
        pH: {
          value: 6.5 + Math.random() * 2,
          unit: 'pH units',
          standard: 7.0,
          status: 'safe'
        },
        temperature: {
          value: 20 + Math.random() * 15,
          unit: '°C',
          standard: 30,
          status: 'safe'
        },
        turbidity: {
          value: Math.random() * 10,
          unit: 'NTU',
          standard: 5,
          status: 'safe'
        },
        dissolvedOxygen: {
          value: 5 + Math.random() * 5,
          unit: 'mg/L',
          standard: 5,
          status: 'safe'
        },
        arsenic: {
          value: Math.random() * 0.02,
          unit: 'mg/L',
          standard: 0.01,
          status: Math.random() > 0.8 ? 'unsafe' : 'safe'
        },
        lead: {
          value: Math.random() * 0.02,
          unit: 'mg/L',
          standard: 0.01,
          status: Math.random() > 0.9 ? 'unsafe' : 'safe'
        },
        mercury: {
          value: Math.random() * 0.002,
          unit: 'mg/L',
          standard: 0.001,
          status: Math.random() > 0.95 ? 'critical' : 'safe'
        },
        nitrate: {
          value: Math.random() * 50,
          unit: 'mg/L',
          standard: 45,
          status: Math.random() > 0.7 ? 'unsafe' : 'safe'
        }
      };
      
      const waterQualityData = new WaterQualityData({
        userId: testUser._id,
        fileName: `sample_data_${i + 1}.csv`,
        fileType: 'csv',
        fileSize: 1024 + Math.random() * 5000,
        dataSource: 'uploaded',
        sampleDate,
        location,
        parameters,
        processingStatus: 'completed',
        processedAt: new Date()
      });
      
      // Calculate metrics
      await waterQualityData.calculateMetrics();
      sampleData.push(waterQualityData);
    }
    
    // Generate sample data for analyst user
    for (let i = 0; i < 15; i++) {
      const sampleDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
      const location = {
        name: `Research Site ${i + 1}`,
        coordinates: {
          latitude: 19.0760 + (Math.random() - 0.5) * 0.1,
          longitude: 72.8777 + (Math.random() - 0.5) * 0.1
        },
        region: 'Mumbai',
        state: 'Maharashtra',
        country: 'India'
      };
      
      // Generate more comprehensive parameters
      const parameters = {
        pH: {
          value: 6.0 + Math.random() * 3,
          unit: 'pH units',
          standard: 7.0,
          status: 'safe'
        },
        temperature: {
          value: 18 + Math.random() * 20,
          unit: '°C',
          standard: 30,
          status: 'safe'
        },
        turbidity: {
          value: Math.random() * 15,
          unit: 'NTU',
          standard: 5,
          status: Math.random() > 0.6 ? 'unsafe' : 'safe'
        },
        totalDissolvedSolids: {
          value: 100 + Math.random() * 800,
          unit: 'mg/L',
          standard: 500,
          status: Math.random() > 0.7 ? 'unsafe' : 'safe'
        },
        electricalConductivity: {
          value: 200 + Math.random() * 1200,
          unit: 'μS/cm',
          standard: 1000,
          status: Math.random() > 0.8 ? 'unsafe' : 'safe'
        },
        dissolvedOxygen: {
          value: 3 + Math.random() * 8,
          unit: 'mg/L',
          standard: 5,
          status: Math.random() > 0.3 ? 'unsafe' : 'safe'
        },
        biochemicalOxygenDemand: {
          value: Math.random() * 8,
          unit: 'mg/L',
          standard: 3,
          status: Math.random() > 0.4 ? 'unsafe' : 'safe'
        },
        arsenic: {
          value: Math.random() * 0.03,
          unit: 'mg/L',
          standard: 0.01,
          status: Math.random() > 0.6 ? 'unsafe' : 'safe'
        },
        lead: {
          value: Math.random() * 0.03,
          unit: 'mg/L',
          standard: 0.01,
          status: Math.random() > 0.7 ? 'unsafe' : 'safe'
        },
        mercury: {
          value: Math.random() * 0.003,
          unit: 'mg/L',
          standard: 0.001,
          status: Math.random() > 0.8 ? 'critical' : 'safe'
        },
        cadmium: {
          value: Math.random() * 0.006,
          unit: 'mg/L',
          standard: 0.003,
          status: Math.random() > 0.7 ? 'unsafe' : 'safe'
        },
        chromium: {
          value: Math.random() * 0.1,
          unit: 'mg/L',
          standard: 0.05,
          status: Math.random() > 0.6 ? 'unsafe' : 'safe'
        },
        nitrate: {
          value: Math.random() * 60,
          unit: 'mg/L',
          standard: 45,
          status: Math.random() > 0.5 ? 'unsafe' : 'safe'
        },
        nitrite: {
          value: Math.random() * 5,
          unit: 'mg/L',
          standard: 3,
          status: Math.random() > 0.6 ? 'unsafe' : 'safe'
        },
        phosphate: {
          value: Math.random() * 0.2,
          unit: 'mg/L',
          standard: 0.1,
          status: Math.random() > 0.5 ? 'unsafe' : 'safe'
        },
        totalColiforms: {
          value: Math.random() * 10,
          unit: 'MPN/100mL',
          standard: 0,
          status: Math.random() > 0.3 ? 'critical' : 'safe'
        },
        fecalColiforms: {
          value: Math.random() * 5,
          unit: 'MPN/100mL',
          standard: 0,
          status: Math.random() > 0.4 ? 'critical' : 'safe'
        }
      };
      
      const waterQualityData = new WaterQualityData({
        userId: analystUser._id,
        fileName: `research_data_${i + 1}.xlsx`,
        fileType: 'xlsx',
        fileSize: 2048 + Math.random() * 8000,
        dataSource: 'uploaded',
        sampleDate,
        location,
        parameters,
        processingStatus: 'completed',
        processedAt: new Date()
      });
      
      // Calculate metrics
      await waterQualityData.calculateMetrics();
      sampleData.push(waterQualityData);
    }
    
    // Save all data
    await WaterQualityData.insertMany(sampleData);
    
    logger.info('✅ Water quality data seeded successfully');
  } catch (error) {
    logger.error('Water quality data seeding failed:', error);
    throw error;
  }
};

// Seed analyses
const seedAnalyses = async (users) => {
  try {
    const { Analysis } = await import('./models/Analysis.js');
    const { WaterQualityData } = await import('./models/WaterQualityData.js');
    
    // Clear existing analyses
    await Analysis.deleteMany({});
    
    const { testUser, analystUser } = users;
    
    // Get some data for analysis
    const testUserData = await WaterQualityData.find({ userId: testUser._id }).limit(5);
    const analystUserData = await WaterQualityData.find({ userId: analystUser._id }).limit(10);
    
    // Create analysis for test user
    const testAnalysis = new Analysis({
      userId: testUser._id,
      dataId: testUserData[0]._id,
      analysisType: 'comprehensive',
      title: 'Water Quality Analysis - Delhi NCR',
      description: 'Comprehensive analysis of water quality data from Delhi NCR region',
      parameters: {
        timeRange: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date()
        },
        selectedParameters: ['pH', 'temperature', 'turbidity', 'arsenic', 'lead'],
        analysisMethod: 'statistical',
        confidenceLevel: 0.95
      },
      status: 'completed',
      processingStarted: new Date(Date.now() - 60000),
      processingCompleted: new Date(),
      results: {
        summary: {
          overallStatus: 'safe',
          riskLevel: 'low',
          keyFindings: [
            'Water quality is generally within acceptable limits',
            'Some samples show elevated arsenic levels',
            'Temperature variations are within normal range'
          ],
          recommendations: [
            'Continue regular monitoring',
            'Investigate arsenic sources',
            'Implement treatment if needed'
          ]
        },
        statistics: {
          descriptive: {
            mean: 7.2,
            median: 7.1,
            mode: 7.0,
            standardDeviation: 0.3,
            variance: 0.09,
            range: 1.2
          }
        },
        trends: {
          direction: 'stable',
          trendStrength: 'weak',
          trendSlope: 0.01,
          seasonalPattern: false,
          cyclicalPattern: false
        }
      },
      qualityAssessment: {
        dataQuality: 'good',
        completeness: 85,
        accuracy: 90,
        reliability: 'high',
        limitations: ['Limited historical data'],
        assumptions: ['Standard measurement protocols followed']
      },
      tags: ['delhi', 'water-quality', 'comprehensive'],
      category: 'water_quality'
    });
    
    // Create analysis for analyst user
    const analystAnalysis = new Analysis({
      userId: analystUser._id,
      dataId: analystUserData[0]._id,
      analysisType: 'trend',
      title: 'Water Quality Trends - Mumbai Region',
      description: 'Trend analysis of water quality parameters in Mumbai region over 60 days',
      parameters: {
        timeRange: {
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          endDate: new Date()
        },
        selectedParameters: ['pH', 'turbidity', 'dissolvedOxygen', 'arsenic', 'lead', 'mercury'],
        analysisMethod: 'trend_analysis',
        confidenceLevel: 0.95
      },
      status: 'completed',
      processingStarted: new Date(Date.now() - 120000),
      processingCompleted: new Date(),
      results: {
        summary: {
          overallStatus: 'unsafe',
          riskLevel: 'medium',
          keyFindings: [
            'Declining water quality trends observed',
            'Heavy metal contamination increasing',
            'Dissolved oxygen levels decreasing'
          ],
          recommendations: [
            'Immediate intervention required',
            'Implement heavy metal treatment',
            'Investigate pollution sources',
            'Increase monitoring frequency'
          ]
        },
        trends: {
          direction: 'declining',
          trendStrength: 'moderate',
          trendSlope: -0.15,
          seasonalPattern: true,
          cyclicalPattern: false
        }
      },
      qualityAssessment: {
        dataQuality: 'excellent',
        completeness: 95,
        accuracy: 95,
        reliability: 'high',
        limitations: ['Short-term data only'],
        assumptions: ['Consistent sampling methodology']
      },
      tags: ['mumbai', 'trends', 'heavy-metals', 'declining'],
      category: 'trend_analysis'
    });
    
    await Promise.all([testAnalysis.save(), analystAnalysis.save()]);
    
    logger.info('✅ Analyses seeded successfully');
  } catch (error) {
    logger.error('Analysis seeding failed:', error);
    throw error;
  }
};

// Seed reports
const seedReports = async (users) => {
  try {
    const { Report } = await import('./models/Report.js');
    const { Analysis } = await import('./models/Analysis.js');
    
    // Clear existing reports
    await Report.deleteMany({});
    
    const { testUser, analystUser } = users;
    
    // Get analyses for reports
    const testAnalysis = await Analysis.findOne({ userId: testUser._id });
    const analystAnalysis = await Analysis.findOne({ userId: analystUser._id });
    
    // Create report for test user
    const testReport = new Report({
      userId: testUser._id,
      analysisId: testAnalysis._id,
      title: 'Water Quality Summary Report - Delhi NCR',
      description: 'Summary report of water quality analysis for Delhi NCR region',
      reportType: 'summary',
      format: 'pdf',
      configuration: {
        includeCharts: true,
        includeTables: true,
        includeMaps: false,
        includeRawData: false,
        chartTheme: 'aqua',
        pageSize: 'A4',
        orientation: 'portrait'
      },
      status: 'completed',
      generationStarted: new Date(Date.now() - 30000),
      generationCompleted: new Date(),
      progress: 100,
      fileInfo: {
        fileName: 'water_quality_summary_delhi.pdf',
        filePath: './reports/water_quality_summary_delhi.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        checksum: 'abc123def456'
      },
      tags: ['delhi', 'summary', 'pdf'],
      category: 'water_quality'
    });
    
    // Create report for analyst user
    const analystReport = new Report({
      userId: analystUser._id,
      analysisId: analystAnalysis._id,
      title: 'Water Quality Trend Analysis - Mumbai',
      description: 'Detailed trend analysis report for Mumbai region water quality',
      reportType: 'detailed',
      format: 'excel',
      configuration: {
        includeCharts: true,
        includeTables: true,
        includeMaps: true,
        includeRawData: true,
        chartTheme: 'aqua',
        pageSize: 'A4',
        orientation: 'landscape'
      },
      status: 'completed',
      generationStarted: new Date(Date.now() - 60000),
      generationCompleted: new Date(),
      progress: 100,
      fileInfo: {
        fileName: 'water_quality_trends_mumbai.xlsx',
        filePath: './reports/water_quality_trends_mumbai.xlsx',
        fileSize: 2048000,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        checksum: 'def456ghi789'
      },
      tags: ['mumbai', 'trends', 'excel', 'detailed'],
      category: 'trend_analysis'
    });
    
    await Promise.all([testReport.save(), analystReport.save()]);
    
    logger.info('✅ Reports seeded successfully');
  } catch (error) {
    logger.error('Report seeding failed:', error);
    throw error;
  }
};

// Main seed function
const seed = async () => {
  try {
    await connectDB();
    
    logger.info('🌱 Starting database seeding...');
    
    const users = await seedUsers();
    await seedWaterQualityData(users);
    await seedAnalyses(users);
    await seedReports(users);
    
    logger.info('🎉 Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
};

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed();
}

export default seed;
