# Deployment Checklist

Use this checklist to ensure successful deployment.

## Pre-Deployment

### Code Preparation
- [ ] All code committed to GitHub
- [ ] .env files in .gitignore
- [ ] No sensitive data in code
- [ ] All dependencies in package.json
- [ ] Build scripts tested locally

### Database (Neon)
- [ ] Neon account created
- [ ] Project created
- [ ] Connection string copied
- [ ] schema.sql executed
- [ ] Database seeded (optional)
- [ ] SSL mode enabled (?sslmode=require)

### Backend (Render)
- [ ] Render account created
- [ ] Repository connected
- [ ] Build command: `npm install`
- [ ] Start command: `node server.js`
- [ ] Environment variables set:
  - [ ] DATABASE_URL
  - [ ] JWT_SECRET (32+ chars)
  - [ ] NODE_ENV=production
  - [ ] FRONTEND_URL (update after frontend deploy)
- [ ] Service deployed successfully
- [ ] Health endpoint tested

### Frontend (Netlify)
- [ ] Netlify account created
- [ ] Repository connected
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Environment variable set:
  - [ ] VITE_API_URL (Render backend URL)
- [ ] Site deployed successfully
- [ ] Site accessible

## Post-Deployment

### Configuration
- [ ] Update FRONTEND_URL in Render
- [ ] Redeploy backend after CORS update
- [ ] Test CORS (frontend can call backend)
- [ ] Verify SSL/HTTPS working

### Testing
- [ ] Health endpoint responds
- [ ] Registration works
- [ ] Login works
- [ ] JWT authentication works
- [ ] Event tracking works
- [ ] Analytics display correctly
- [ ] Filters work
- [ ] Charts render
- [ ] Rate limiting active

### Security
- [ ] Strong JWT_SECRET in use
- [ ] CORS restricted to frontend domain
- [ ] HTTPS enabled
- [ ] Security headers present
- [ ] Rate limiting configured
- [ ] No sensitive data exposed

### Monitoring
- [ ] Backend logs accessible
- [ ] Frontend logs accessible
- [ ] Database monitoring enabled
- [ ] Error tracking setup (optional)

## Troubleshooting

If deployment fails, check:
- [ ] Environment variables correct
- [ ] Database connection string valid
- [ ] CORS configuration matches domains
- [ ] Build logs for errors
- [ ] Node version compatibility
