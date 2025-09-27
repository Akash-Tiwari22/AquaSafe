import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5001;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Simple upload endpoint
app.post('/api/upload/water-quality-public', upload.single('file'), (req, res) => {
  try {
    console.log('File received:', req.file);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Simulate processing
    const mockAnalysis = {
      totalSamples: 3,
      safeSamples: 2,
      unsafeSamples: 1,
      criticalSamples: 0,
      safePercentage: 66.7,
      avgHMPI: 45.2,
      avgWQI: 78.5
    };

    res.json({
      success: true,
      message: 'File processed successfully',
      data: {
        fileName: req.file.originalname,
        totalRecords: 3,
        validRecords: 3,
        invalidRecords: 0,
        analysis: mockAnalysis
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File processing failed',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Standards endpoint
app.get('/api/upload/standards', (req, res) => {
  res.json({
    success: true,
    data: {
      pH: { min: 6.5, max: 8.5, unit: 'pH units' },
      arsenic: { max: 0.01, unit: 'mg/L' },
      lead: { max: 0.01, unit: 'mg/L' }
    }
  });
});

app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
});
