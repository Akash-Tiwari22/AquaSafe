# AquaSafe Backend API

A comprehensive backend API for the AquaSafe Water Quality Monitoring Dashboard built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **File Upload & Processing**: CSV/Excel file processing with validation
- **Water Quality Analysis**: HMPI calculation, WQI analysis, and comprehensive metrics
- **Data Management**: CRUD operations for water quality data
- **Report Generation**: PDF and Excel report generation
- **Real-time Updates**: Socket.IO integration for live updates
- **Email Notifications**: Automated email alerts and notifications
- **Predictive Analytics**: Machine learning models for water quality forecasting

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with refresh tokens
- **File Processing**: Multer, XLSX, CSV-parser
- **Report Generation**: jsPDF, ExcelJS
- **Email**: Nodemailer
- **Real-time**: Socket.IO
- **Logging**: Winston
- **Validation**: Joi, express-validator

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-first-fab/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/aquasafe
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

4. **Database Setup**
   ```bash
   # Run migrations
   npm run migrate
   
   # Seed sample data
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/verify-email` - Verify email address
- `GET /api/auth/me` - Get current user

### Data Management
- `GET /api/data` - Get water quality data
- `POST /api/data` - Create new data entry
- `GET /api/data/:id` - Get specific data
- `PUT /api/data/:id` - Update data
- `DELETE /api/data/:id` - Delete data
- `GET /api/data/aggregated/metrics` - Get aggregated metrics
- `GET /api/data/aggregated/trends` - Get trend analysis
- `GET /api/data/export` - Export data

### File Upload
- `POST /api/upload/water-quality` - Upload water quality file
- `POST /api/upload/validate` - Validate data without saving
- `GET /api/upload/sample-data` - Generate sample data
- `GET /api/upload/template` - Download CSV template
- `GET /api/upload/standards` - Get water quality standards

### Analysis
- `POST /api/analysis` - Create new analysis
- `GET /api/analysis` - Get user analyses
- `GET /api/analysis/:id` - Get specific analysis
- `PUT /api/analysis/:id` - Update analysis
- `DELETE /api/analysis/:id` - Delete analysis
- `POST /api/analysis/:id/rerun` - Rerun analysis
- `POST /api/analysis/:id/share` - Share analysis

### Reports
- `POST /api/reports` - Create new report
- `GET /api/reports` - Get user reports
- `GET /api/reports/:id` - Get specific report
- `GET /api/reports/:id/download` - Download report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report
- `POST /api/reports/:id/regenerate` - Regenerate report

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard overview
- `GET /api/dashboard/metrics` - Get detailed metrics
- `GET /api/dashboard/parameters` - Get parameter analysis
- `GET /api/dashboard/locations` - Get location analysis
- `GET /api/dashboard/alerts` - Get alerts and incidents
- `GET /api/dashboard/statistics` - Get comprehensive statistics

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Update password
- `PUT /api/users/preferences` - Update preferences
- `POST /api/users/verify-email` - Resend verification email
- `DELETE /api/users/account` - Delete account

## Data Models

### User
- Personal information (name, email, organization)
- Authentication data (password, tokens)
- Preferences and settings
- Subscription information

### WaterQualityData
- Sample information (date, location)
- Water quality parameters (pH, temperature, heavy metals, etc.)
- Calculated metrics (HMPI, WQI, overall status)
- Processing status and metadata

### Analysis
- Analysis configuration and parameters
- Results and findings
- Quality assessment
- Sharing and collaboration

### Report
- Report configuration and content
- File information and generation status
- Download tracking and sharing

## Water Quality Parameters

The system supports comprehensive water quality parameters:

### Physical Parameters
- pH, Temperature, Turbidity
- Total Dissolved Solids (TDS)
- Electrical Conductivity

### Chemical Parameters
- Dissolved Oxygen, BOD, COD
- Total Alkalinity, Total Hardness

### Heavy Metals
- Arsenic, Lead, Mercury, Cadmium
- Chromium, Nickel, Copper, Zinc
- Iron, Manganese

### Nutrients
- Nitrate, Nitrite, Phosphate, Ammonia

### Microbiological
- Total Coliforms, Fecal Coliforms, E.coli

## Analysis Features

### HMPI (Heavy Metal Pollution Index)
- Calculates heavy metal contamination levels
- Provides risk assessment (safe/unsafe/critical)
- Confidence scoring based on data completeness

### WQI (Water Quality Index)
- Comprehensive water quality assessment
- Multi-parameter evaluation
- Status classification (excellent/good/fair/poor/very_poor)

### Trend Analysis
- Time-series analysis
- Seasonal pattern detection
- Predictive forecasting

### Statistical Analysis
- Descriptive statistics
- Correlation analysis
- Regression modeling

## Report Generation

### Supported Formats
- PDF (with charts and tables)
- Excel (with multiple sheets)
- CSV (raw data export)

### Report Types
- Summary reports
- Detailed analysis reports
- Executive summaries
- Technical reports
- Compliance reports

## Security Features

- JWT-based authentication
- Role-based access control
- Rate limiting
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Password hashing with bcrypt

## Monitoring & Logging

- Comprehensive logging with Winston
- Request/response logging
- Error tracking and reporting
- Performance monitoring
- Database operation logging

## Development

### Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
npm run migrate    # Run database migrations
npm run seed       # Seed database with sample data
```

### Project Structure
```
src/
├── database/
│   ├── models/          # Mongoose models
│   ├── migrate.js       # Database migrations
│   └── seed.js          # Database seeding
├── middleware/
│   ├── auth.js          # Authentication middleware
│   ├── upload.js        # File upload middleware
│   └── errorHandler.js  # Error handling
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── data.js          # Data management routes
│   ├── upload.js        # File upload routes
│   ├── analysis.js      # Analysis routes
│   ├── reports.js       # Report generation routes
│   ├── dashboard.js     # Dashboard routes
│   └── users.js         # User management routes
├── utils/
│   ├── logger.js        # Logging utilities
│   ├── email.js         # Email utilities
│   ├── fileProcessor.js # File processing utilities
│   ├── waterQualityAnalysis.js # Analysis algorithms
│   └── reportGenerator.js # Report generation
└── server.js            # Main server file
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/aquasafe |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_REFRESH_SECRET` | JWT refresh secret | - |
| `SMTP_HOST` | SMTP server host | - |
| `SMTP_PORT` | SMTP server port | 587 |
| `SMTP_USER` | SMTP username | - |
| `SMTP_PASS` | SMTP password | - |
| `CORS_ORIGIN` | CORS allowed origin | http://localhost:3000 |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please contact the development team or create an issue in the repository.
