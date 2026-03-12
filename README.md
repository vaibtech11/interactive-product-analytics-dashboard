# Interactive Product Analytics Dashboard

A full-stack analytics dashboard for tracking product events and visualizing user behavior.

## Documentation

- [Project Summary](PROJECT_SUMMARY.md) - Complete project overview
- [Audit Report](AUDIT_REPORT.md) - Full project audit and verification
- [Local Development Guide](LOCAL_DEVELOPMENT.md) - Setup and run locally
- [Deployment Guide](DEPLOYMENT.md) - Deploy to Netlify, Render, and Neon
- [Security Documentation](SECURITY.md) - Security best practices
- [Error Handling](ERROR_HANDLING.md) - Error handling implementation
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist

## Tech Stack

- Frontend: React, TailwindCSS, Recharts
- Backend: Node.js, Express
- Database: PostgreSQL (Neon compatible)
- Authentication: JWT + bcrypt
- Security: Rate limiting, CORS, input validation, SQL injection protection

## Quick Start

### Local Development

```bash
# 1. Clone repository
git clone <repository-url>
cd interactive-product-analytics-dashboard

# 2. Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm run schema  # Initialize database
npm run seed    # Add sample data
npm start       # Start backend on port 5000

# 3. Setup frontend (in new terminal)
cd frontend
npm install
cp .env.example .env
# Edit .env with VITE_API_URL=http://localhost:5000
npm run dev     # Start frontend on port 3000

# 4. Open browser
# Visit http://localhost:3000
# Login with: demo_user / demo123
```

See [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md) for detailed instructions.

## Project Structure

```
/backend
  server.js
  db.js
  seed.js
  routes/
    auth.js
    track.js
    analytics.js
  middleware/
    authMiddleware.js
  validation/
    validators.js
/frontend
  src/
    pages/
      Login.jsx
      Dashboard.jsx
    components/
      Filters.jsx
      BarChart.jsx
      LineChart.jsx
    utils/
      api.js
      cookies.js
```

## Environment Variables

### Backend (.env)
```
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-secret-key-here-minimum-32-characters-recommended
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Security Note**: 
- JWT_SECRET should be at least 32 characters long
- Use a cryptographically secure random string in production
- Never commit .env file to version control

For Neon PostgreSQL, your DATABASE_URL will look like:
```
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

## Setup Instructions

### Database Setup (Neon PostgreSQL)
1. Create a free account at [Neon](https://neon.tech)
2. Create a new project and database
3. Copy the connection string (it will include SSL parameters)
4. Add it to your backend `.env` file as `DATABASE_URL`

### Backend Setup
```bash
cd backend
npm install
# Create .env file with your database credentials and JWT secret

# Option 1: Apply schema manually (recommended for production)
npm run schema

# Option 2: Auto-initialize on server start (development)
# Tables will be created automatically when you run npm start

# Seed database with sample data (10 users, 100 feature clicks)
npm run seed

# Start the server
npm start
```

### Database Schema
The application uses three main tables:
- **users**: User accounts with username, email, password, age, and gender
- **feature_clicks**: Tracks user interactions with product features
- **events**: General event tracking for analytics

Seed data includes:
- 10 users with varied demographics (ages 23-52, different genders)
- 100 feature click records across 4 features:
  - date_filter
  - gender_filter
  - age_filter
  - bar_chart_click
- Timestamps spread across the last 30 days

See `backend/schema.sql` for the complete schema definition.

### Frontend Setup
```bash
cd frontend
npm install
# Create .env file with API URL
npm run dev
```

## API Endpoints

### Authentication
- POST /register - Register new user
  - Body: `{ username, password, age?, gender? }`
  - Validates: username (3-50 chars, alphanumeric + underscore), password (min 6 chars), age (13-120), gender (Male/Female/Other)
  - Returns: `{ success, message, token, user }`
  - Errors: 400 (validation failed, duplicate username), 500 (server error)

- POST /login - Login user
  - Body: `{ username, password }` or `{ email, password }`
  - Returns: `{ success, token, user }`
  - Errors: 401 (invalid credentials), 500 (server error)

### Event Tracking
- POST /track - Track feature interaction (authenticated)
  - Body: `{ feature_name }`
  - Examples: `date_filter`, `gender_filter`, `age_filter`, `bar_chart_click`
  - Validates: feature_name (required, alphanumeric + underscore/hyphen)
  - Returns: `{ success, message, data: { id, user_id, feature_name, timestamp } }`
  - Errors: 400 (invalid/empty feature_name), 401 (unauthorized), 500 (server error)

### Analytics
- GET /analytics - Main analytics endpoint (authenticated)
  - Query params: `start_date?`, `end_date?`, `age?`, `gender?`, `feature_name?` (all optional)
  - Validates: start_date <= end_date, age (13-120), gender (Male/Female/Other)
  - Returns both datasets:
    - `barChart`: Total clicks per feature `[{ feature_name, total }]`
    - `lineChart`: Clicks over time for selected feature `[{ day, clicks }]` (only if feature_name provided)
  - Uses optimized queries with indexes on feature_name, timestamp, user_id
  
- GET /analytics/feature-summary - Get total clicks per feature (authenticated)
  - Query params: `startDate?`, `endDate?` (YYYY-MM-DD format)
  - Returns: `{ data: [{ feature_name, count }] }`
  
- GET /analytics/feature-timeline - Get clicks over time for a feature (authenticated)
  - Query params: `feature_name` (required), `startDate?`, `endDate?`
  - Returns: `{ feature_name, data: [{ day, count }] }`
  - Errors: 400 (missing/invalid feature_name or dates), 401 (unauthorized), 500 (server error)

### Health Check
- GET /health - Server health check (returns `{ status: "running" }`)

## Default Credentials (after seeding)
- Email: demo@example.com
- Password: demo123

## Deployment

This application is designed to be deployed on:
- **Frontend**: Netlify (static hosting)
- **Backend**: Render (Node.js hosting)
- **Database**: Neon (PostgreSQL)

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions.

### Quick Deployment Steps

1. **Database (Neon)**:
   - Create project on Neon
   - Run `schema.sql` to initialize tables
   - Copy connection string

2. **Backend (Render)**:
   - Connect GitHub repo to Render
   - Set environment variables (DATABASE_URL, JWT_SECRET, FRONTEND_URL)
   - Deploy with start command: `node server.js`

3. **Frontend (Netlify)**:
   - Connect GitHub repo to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variable: `VITE_API_URL`

## Security Features

This application implements comprehensive security best practices:

- **Password Security**: Bcrypt hashing with 10 salt rounds, passwords never stored in plaintext
- **Authentication**: JWT tokens with 7-day expiration
- **SQL Injection Protection**: All queries use parameterized statements
- **Input Validation**: Express-validator for all user inputs
- **CORS**: Configured to allow only specified frontend origin
- **Rate Limiting**: 
  - Track endpoint: 100 requests/15 minutes
  - Auth endpoints: 5 requests/15 minutes
  - General API: 1000 requests/15 minutes
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, HSTS, XSS-Protection
- **Payload Limits**: 10MB maximum to prevent memory exhaustion

See [SECURITY.md](SECURITY.md) for detailed security documentation.

## Scaling the Analytics System

If the dashboard needed to handle 1 million write-events per minute, the architecture would move to an event-driven pipeline. Instead of writing events directly to PostgreSQL, the backend would publish interaction events to a message queue such as Apache Kafka or RabbitMQ. Worker services would consume these events asynchronously and batch-write them into an analytics-optimized database such as ClickHouse, BigQuery, or a partitioned PostgreSQL cluster. This architecture separates ingestion from storage, increases write throughput, and allows the system to scale horizontally while keeping dashboard queries fast.
