# Deployment Guide

This guide covers deploying the Interactive Product Analytics Dashboard to production using:
- **Frontend**: Netlify
- **Backend**: Render
- **Database**: Neon PostgreSQL

## Prerequisites

- GitHub account
- Netlify account
- Render account
- Neon account

## Database Setup (Neon PostgreSQL)

### 1. Create Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Click "Create Project"
3. Choose a region close to your users
4. Note your connection string (format below)

### 2. Get Connection String

Your Neon connection string will look like:
```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

### 3. Initialize Database

Run the schema on your Neon database:

```bash
# Option 1: Use Neon SQL Editor in the console
# Copy contents of backend/schema.sql and run in SQL Editor

# Option 2: Use psql locally
psql "postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require" -f backend/schema.sql
```

### 4. Seed Database (Optional)

Update `backend/seed.js` with your Neon connection string temporarily, then:

```bash
cd backend
npm install
node seed.js
```

## Backend Deployment (Render)

### 1. Prepare Backend

Ensure your backend code is in a GitHub repository.

### 2. Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `analytics-dashboard-api`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend` (if backend is in subdirectory)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free (or paid for production)

### 3. Set Environment Variables

In Render dashboard, add these environment variables:

```
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
JWT_SECRET=your-secure-random-string-min-32-characters
NODE_ENV=production
FRONTEND_URL=https://your-app.netlify.app
PORT=10000
```

**Important**: 
- Generate a strong JWT_SECRET (32+ characters)
- Use your actual Neon connection string
- Update FRONTEND_URL after deploying frontend

### 4. Deploy

Click "Create Web Service" - Render will automatically deploy.

Your backend URL will be: `https://your-service.onrender.com`

### 5. Verify Deployment

Test the health endpoint:
```bash
curl https://your-service.onrender.com/health
```

Should return: `{"status":"running"}`

## Frontend Deployment (Netlify)

### 1. Prepare Frontend

Ensure `netlify.toml` exists in `frontend/` directory (already created).

### 2. Deploy to Netlify

#### Option A: Netlify CLI (Recommended)

```bash
cd frontend
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

#### Option B: Netlify Dashboard

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub
4. Select your repository
5. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

### 3. Set Environment Variables

In Netlify dashboard → Site settings → Environment variables:

```
VITE_API_URL=https://your-service.onrender.com
```

Replace with your actual Render backend URL.

### 4. Redeploy

After setting environment variables, trigger a new deploy:
- Netlify Dashboard → Deploys → Trigger deploy → Deploy site

### 5. Update Backend CORS

Update the `FRONTEND_URL` environment variable in Render with your Netlify URL:

```
FRONTEND_URL=https://your-app.netlify.app
```

Then redeploy the backend service.

## Post-Deployment Configuration

### 1. Update CORS Origins

In `backend/server.js`, update the CORS configuration if needed:

```javascript
const corsOptions = {
  origin: [
    'https://your-app.netlify.app',
    'http://localhost:3000' // Keep for local development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### 2. Test the Application

1. Visit your Netlify URL: `https://your-app.netlify.app`
2. Try logging in with demo credentials:
   - Username: `demo_user`
   - Password: `demo123`
3. Test all features:
   - Filters
   - Bar chart clicks
   - Line chart display
   - Event tracking

### 3. Monitor Logs

- **Render**: Dashboard → Your service → Logs
- **Netlify**: Dashboard → Your site → Deploys → Deploy log
- **Neon**: Console → Your project → Monitoring

## Environment Variables Summary

### Backend (Render)
```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
JWT_SECRET=min-32-character-secure-random-string
NODE_ENV=production
FRONTEND_URL=https://your-app.netlify.app
PORT=10000
```

### Frontend (Netlify)
```env
VITE_API_URL=https://your-service.onrender.com
```

## Troubleshooting

### Backend Issues

**Problem**: Server won't start
- Check Render logs for errors
- Verify DATABASE_URL is correct
- Ensure JWT_SECRET is set
- Check Node version compatibility

**Problem**: CORS errors
- Verify FRONTEND_URL matches your Netlify URL
- Check CORS configuration in server.js
- Ensure credentials: true is set

**Problem**: Database connection fails
- Verify Neon connection string includes `?sslmode=require`
- Check database is not paused (Neon free tier)
- Verify SSL configuration in db.js

### Frontend Issues

**Problem**: API calls fail
- Verify VITE_API_URL is set correctly
- Check browser console for errors
- Ensure backend is running (test /health endpoint)
- Check CORS configuration

**Problem**: Build fails
- Check Node version (should be 18+)
- Verify all dependencies are in package.json
- Check for TypeScript errors
- Review Netlify build logs

### Database Issues

**Problem**: Tables don't exist
- Run schema.sql on Neon database
- Check SQL Editor in Neon console for errors
- Verify connection string is correct

**Problem**: No seed data
- Run seed.js with Neon connection string
- Check seed.js logs for errors
- Manually insert test data via Neon SQL Editor

## Security Checklist for Production

- [ ] Strong JWT_SECRET (32+ characters, random)
- [ ] HTTPS enabled (automatic on Netlify/Render)
- [ ] CORS restricted to your domain
- [ ] Environment variables set correctly
- [ ] Database SSL enabled
- [ ] Rate limiting configured
- [ ] Error messages don't expose sensitive info
- [ ] Passwords hashed with bcrypt
- [ ] SQL injection protection (parameterized queries)
- [ ] Input validation enabled

## Continuous Deployment

Both Netlify and Render support automatic deployments:

1. **Push to GitHub** → Automatic deployment
2. **Environment variables** → Redeploy required
3. **Database schema changes** → Manual migration needed

## Monitoring and Maintenance

### Health Checks

Set up monitoring for:
- Backend health endpoint: `https://your-service.onrender.com/health`
- Frontend availability: `https://your-app.netlify.app`
- Database connectivity

### Logs

- **Render**: Real-time logs in dashboard
- **Netlify**: Deploy logs and function logs
- **Neon**: Query performance and connection logs

### Backups

- **Neon**: Automatic backups (check your plan)
- **Code**: GitHub repository
- **Environment variables**: Document separately (securely)

## Cost Estimates

### Free Tier Limits

- **Netlify**: 100GB bandwidth, 300 build minutes/month
- **Render**: 750 hours/month (sleeps after 15 min inactivity)
- **Neon**: 3GB storage, 1 project (may pause after inactivity)

### Paid Plans

Consider upgrading for production:
- **Render**: $7/month (always-on, better performance)
- **Neon**: $19/month (no pause, more storage)
- **Netlify**: Usually free tier sufficient for frontend

## Support

- **Render**: https://render.com/docs
- **Netlify**: https://docs.netlify.com
- **Neon**: https://neon.tech/docs
