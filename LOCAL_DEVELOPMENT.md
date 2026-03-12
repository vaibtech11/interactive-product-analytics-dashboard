# Local Development Guide

This guide covers setting up and running the Interactive Product Analytics Dashboard locally.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL (local or Neon account)
- Git

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd interactive-product-analytics-dashboard
```

### 2. Database Setup

#### Option A: Local PostgreSQL

```bash
# Create database
createdb analytics_dashboard

# Run schema
psql analytics_dashboard < backend/schema.sql
```

#### Option B: Neon PostgreSQL (Recommended)

1. Create free account at [Neon](https://neon.tech)
2. Create new project
3. Copy connection string
4. Run schema in Neon SQL Editor

### 3. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/analytics_dashboard
# OR for Neon:
# DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
JWT_SECRET=your-local-development-secret-min-32-chars
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Generate secure JWT_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Initialize and seed database:

```bash
npm run schema  # Initialize tables
npm run seed    # Add sample data
```

Start backend server:

```bash
npm start
# OR for development with auto-reload:
npm run dev
```

Backend will run on `http://localhost:5000`

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Start frontend development server:

```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Development Workflow

### Running the Application

1. **Terminal 1** - Backend:
   ```bash
   cd backend
   npm run dev
   ```

2. **Terminal 2** - Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Browser**: Open `http://localhost:3000`

### Default Login Credentials

After seeding:
- Username: `demo_user`
- Password: `demo123`

### Project Structure

```
interactive-product-analytics-dashboard/
├── backend/
│   ├── server.js              # Express server
│   ├── db.js                  # Database connection
│   ├── seed.js                # Database seeding
│   ├── schema.sql             # Database schema
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── track.js          # Event tracking routes
│   │   └── analytics.js      # Analytics routes
│   ├── middleware/
│   │   ├── authMiddleware.js # JWT verification
│   │   └── rateLimiter.js    # Rate limiting
│   └── validation/
│       └── validators.js      # Input validation
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx     # Login page
│   │   │   └── Dashboard.jsx # Main dashboard
│   │   ├── components/
│   │   │   ├── Filters.jsx   # Filter panel
│   │   │   ├── BarChart.jsx  # Bar chart
│   │   │   ├── LineChart.jsx # Line chart
│   │   │   ├── ErrorMessage.jsx
│   │   │   └── EmptyState.jsx
│   │   └── utils/
│   │       ├── api.js        # API client
│   │       └── cookies.js    # Cookie utilities
│   └── index.html
└── README.md
```

## Available Scripts

### Backend

```bash
npm start          # Start server
npm run dev        # Start with auto-reload
npm run seed       # Seed database
npm run schema     # Apply schema
```

### Frontend

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

## Testing

### Test Backend Endpoints

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'

# Login
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo_user","password":"demo123"}'

# Track event (requires token)
curl -X POST http://localhost:5000/track \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"feature_name":"test_feature"}'

# Get analytics (requires token)
curl http://localhost:5000/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Frontend

1. Open `http://localhost:3000`
2. Login with demo credentials
3. Test filters
4. Click bar chart
5. Verify line chart updates
6. Check browser console for errors

## Common Development Tasks

### Reset Database

```bash
cd backend
psql $DATABASE_URL < schema.sql
npm run seed
```

### Add New User

```bash
cd backend
node -e "
const bcrypt = require('bcrypt');
const { query } = require('./db.js');
(async () => {
  const hash = await bcrypt.hash('password', 10);
  await query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', ['newuser', hash]);
  console.log('User created');
  process.exit(0);
})();
"
```

### View Database

```bash
# Local PostgreSQL
psql analytics_dashboard

# Neon
psql "postgresql://user:pass@host.neon.tech/db?sslmode=require"

# Useful queries
SELECT * FROM users;
SELECT * FROM feature_clicks ORDER BY timestamp DESC LIMIT 10;
SELECT feature_name, COUNT(*) FROM feature_clicks GROUP BY feature_name;
```

### Clear Rate Limits

Rate limits are stored in memory and reset when server restarts:

```bash
cd backend
npm start  # Restart server
```

## Troubleshooting

### Backend Issues

**Port already in use**:
```bash
# Find process using port 5000
lsof -i :5000
# Kill process
kill -9 <PID>
```

**Database connection error**:
- Check DATABASE_URL is correct
- Verify PostgreSQL is running (local)
- Check Neon database is not paused
- Ensure SSL configuration matches (local vs Neon)

**JWT errors**:
- Verify JWT_SECRET is set in .env
- Check token is being sent in Authorization header
- Ensure token hasn't expired (7 days)

### Frontend Issues

**API calls fail**:
- Verify backend is running on port 5000
- Check VITE_API_URL in .env
- Open browser DevTools → Network tab
- Check CORS errors in console

**Build errors**:
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check Node version: `node --version` (should be 18+)

**Environment variables not loading**:
- Restart dev server after changing .env
- Vite requires VITE_ prefix for client-side variables
- Backend doesn't require prefix

## Development Best Practices

### Code Style

- Use ES6+ features
- Async/await for promises
- Parameterized queries for SQL
- Input validation on all endpoints
- Error handling with try/catch

### Security

- Never commit .env files
- Use strong JWT_SECRET (32+ chars)
- Validate all user inputs
- Use parameterized SQL queries
- Hash passwords with bcrypt

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "Add feature description"

# Push to remote
git push origin feature/your-feature

# Create pull request on GitHub
```

### Database Migrations

When changing schema:

1. Update `schema.sql`
2. Create migration script if needed
3. Test locally first
4. Document changes in commit message
5. Update seed.js if needed

## Environment Variables Reference

### Backend (.env)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| PORT | No | Server port | 5000 |
| DATABASE_URL | Yes | PostgreSQL connection | postgresql://... |
| JWT_SECRET | Yes | JWT signing secret | min-32-chars |
| NODE_ENV | No | Environment | development |
| FRONTEND_URL | No | CORS origin | http://localhost:3000 |

### Frontend (.env)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| VITE_API_URL | Yes | Backend API URL | http://localhost:5000 |

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Recharts Documentation](https://recharts.org/)

## Getting Help

- Check error messages in terminal
- Review browser console for frontend errors
- Check backend logs for API errors
- Verify environment variables are set
- Ensure database is accessible
- Test endpoints with curl
- Review SECURITY.md for security issues
- Check DEPLOYMENT.md for production setup
