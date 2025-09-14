import mongoose from 'mongoose';
import dotenv from 'dotenv';
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
    logger.info('🗄️  MongoDB Connected for migration');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Create indexes
const createIndexes = async () => {
  try {
    const { User } = await import('./models/User.js');
    const { WaterQualityData } = await import('./models/WaterQualityData.js');
    const { Analysis } = await import('./models/Analysis.js');
    const { Report } = await import('./models/Report.js');
    
    logger.info('Creating indexes...');
    
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ organization: 1 });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ isActive: 1 });
    
    // WaterQualityData indexes
    await WaterQualityData.collection.createIndex({ userId: 1, sampleDate: -1 });
    await WaterQualityData.collection.createIndex({ dataSource: 1 });
    await WaterQualityData.collection.createIndex({ 'calculatedMetrics.overallStatus': 1 });
    await WaterQualityData.collection.createIndex({ 'location.coordinates': '2dsphere' });
    await WaterQualityData.collection.createIndex({ uploadDate: -1 });
    await WaterQualityData.collection.createIndex({ processingStatus: 1 });
    
    // Analysis indexes
    await Analysis.collection.createIndex({ userId: 1, createdAt: -1 });
    await Analysis.collection.createIndex({ dataId: 1 });
    await Analysis.collection.createIndex({ analysisType: 1 });
    await Analysis.collection.createIndex({ status: 1 });
    await Analysis.collection.createIndex({ isPublic: 1 });
    await Analysis.collection.createIndex({ tags: 1 });
    await Analysis.collection.createIndex({ category: 1 });
    
    // Report indexes
    await Report.collection.createIndex({ userId: 1, createdAt: -1 });
    await Report.collection.createIndex({ analysisId: 1 });
    await Report.collection.createIndex({ status: 1 });
    await Report.collection.createIndex({ isPublic: 1 });
    await Report.collection.createIndex({ tags: 1 });
    await Report.collection.createIndex({ category: 1 });
    await Report.collection.createIndex({ expiresAt: 1 });
    
    logger.info('✅ All indexes created successfully');
  } catch (error) {
    logger.error('Index creation failed:', error);
    throw error;
  }
};

// Create collections if they don't exist
const createCollections = async () => {
  try {
    const { User } = await import('./models/User.js');
    const { WaterQualityData } = await import('./models/WaterQualityData.js');
    const { Analysis } = await import('./models/Analysis.js');
    const { Report } = await import('./models/Report.js');
    
    logger.info('Creating collections...');
    
    // Create collections by inserting and immediately deleting a document
    await User.collection.insertOne({ _id: new mongoose.Types.ObjectId() });
    await User.collection.deleteOne({ _id: new mongoose.Types.ObjectId() });
    
    await WaterQualityData.collection.insertOne({ _id: new mongoose.Types.ObjectId() });
    await WaterQualityData.collection.deleteOne({ _id: new mongoose.Types.ObjectId() });
    
    await Analysis.collection.insertOne({ _id: new mongoose.Types.ObjectId() });
    await Analysis.collection.deleteOne({ _id: new mongoose.Types.ObjectId() });
    
    await Report.collection.insertOne({ _id: new mongoose.Types.ObjectId() });
    await Report.collection.deleteOne({ _id: new mongoose.Types.ObjectId() });
    
    logger.info('✅ All collections created successfully');
  } catch (error) {
    logger.error('Collection creation failed:', error);
    throw error;
  }
};

// Main migration function
const migrate = async () => {
  try {
    await connectDB();
    await createCollections();
    await createIndexes();
    
    logger.info('🎉 Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate();
}

export default migrate;
