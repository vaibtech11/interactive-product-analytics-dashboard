# Security Best Practices Implementation

This document outlines all security measures implemented in the Interactive Product Analytics Dashboard.

## ✓ Password Security

### Bcrypt Password Hashing
- **Implementation**: All passwords are hashed using bcrypt with 10 salt rounds
- **Location**: `backend/routes/auth.js`
- **Code**:
  ```javascript
  const password_hash = await bcrypt.hash(password, 10);
  ```
- **Storage**: Only `password_hash` is stored in database, never plaintext passwords
- **Verification**: Uses `bcrypt.compare()` for secure password comparison

### Database Schema
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,  -- Only hashed passwords stored
  ...
);
```

## ✓ JWT Authentication

### Token Generation
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Secret**: Stored in environment variable `JWT_SECRET`
- **Expiration**: 7 days
- **Payload**: Contains only `userId` and `username` (no sensitive data)

### Token Verification
- **Location**: `backend/middleware/authMiddleware.js`
- **Checks**:
  - Token presence in Authorization header
  - Token format (Bearer TOKEN)
  - Token validity and signature
  - Token expiration
- **Error Handling**:
  - Invalid token: 401 Unauthorized
  - Expired token: 401 Unauthorized with specific message
  - Missing token: 401 Unauthorized

## ✓ SQL Injection Protection

### Parameterized Queries
All database queries use parameterized placeholders ($1, $2, etc.) to prevent SQL injection.

**Examples**:
```javascript
// ✓ SECURE - Parameterized query
await query(
  'SELECT * FROM users WHERE username = $1',
  [username]
);

// ✗ INSECURE - String concatenation (NOT USED)
// await query(`SELECT * FROM users WHERE username = '${username}'`);
```

### Implementation Locations
- `backend/routes/auth.js` - All user queries
- `backend/routes/track.js` - Event tracking queries
- `backend/routes/analytics.js` - Analytics queries
- `backend/db.js` - Database initialization

## ✓ Input Validation

### Express-Validator
- **Package**: `express-validator@^7.0.1`
- **Location**: `backend/validation/validators.js`

### Validation Rules

#### Registration
```javascript
- username: 3-50 chars, alphanumeric + underscore only
- password: minimum 6 characters
- age: 13-120 (optional)
- gender: Male, Female, or Other (optional)
```

#### Analytics Filters
```javascript
- dates: YYYY-MM-DD format, start_date <= end_date
- age: 13-120 range
- gender: Male, Female, or Other enum
- feature_name: alphanumeric + underscore/hyphen, max 255 chars
```

### Sanitization
- Trim whitespace from inputs
- Validate format before processing
- Reject invalid characters
- Length limits enforced

## ✓ CORS Configuration

### Settings
```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### Security Benefits
- Restricts cross-origin requests to specified frontend URL
- Prevents unauthorized domains from accessing API
- Allows credentials (cookies, authorization headers)
- Limits HTTP methods to necessary ones only

## ✓ Rate Limiting

### Track Endpoint Rate Limiting
- **Limit**: 100 requests per 15 minutes per IP
- **Purpose**: Prevent abuse of event tracking
- **Response**: 429 Too Many Requests with retry-after header

### Authentication Rate Limiting
- **Limit**: 5 requests per 15 minutes per IP
- **Purpose**: Prevent brute force attacks
- **Skip**: Successful requests don't count toward limit
- **Response**: 429 Too Many Requests

### General API Rate Limiting
- **Limit**: 1000 requests per 15 minutes per IP
- **Purpose**: Prevent API abuse
- **Scope**: All /api/* routes

### Implementation
```javascript
import rateLimit from 'express-rate-limit';

export const trackRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
```

## Additional Security Measures

### Security Headers
```javascript
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Payload Size Limits
- JSON payload: 10MB maximum
- URL-encoded payload: 10MB maximum
- Prevents memory exhaustion attacks

### Environment Variables
- Sensitive data stored in `.env` file
- Never committed to version control
- Required variables validated on startup
- JWT_SECRET minimum length warning (32 chars recommended)

### Error Handling
- Production mode hides internal error details
- Generic error messages prevent information leakage
- Detailed errors only in development mode
- All errors logged server-side

### Database Security
- SSL/TLS connection to database (Neon compatible)
- Connection pooling with proper cleanup
- Prepared statements for all queries
- Foreign key constraints for data integrity
- Indexes for performance (not security, but prevents DoS via slow queries)

## Security Checklist

- [x] Bcrypt password hashing (10 rounds)
- [x] JWT authentication with expiration
- [x] SQL injection protection (parameterized queries)
- [x] Input validation (express-validator)
- [x] CORS configuration (restricted origins)
- [x] Rate limiting (/track endpoint: 100/15min)
- [x] Rate limiting (auth endpoints: 5/15min)
- [x] Rate limiting (general API: 1000/15min)
- [x] Passwords never stored in plaintext
- [x] Security headers set
- [x] Payload size limits
- [x] Environment variable validation
- [x] Error message sanitization
- [x] HTTPS enforcement (Strict-Transport-Security header)
- [x] XSS protection headers
- [x] Clickjacking protection (X-Frame-Options)

## Testing Security

### Test Rate Limiting
```bash
# Test track endpoint rate limit
for i in {1..101}; do
  curl -X POST -H "Authorization: Bearer TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"feature_name":"test"}' \
    http://localhost:5000/track
done
```

### Test SQL Injection Protection
```bash
# This should be safely handled (returns error, not SQL injection)
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR '\''1'\''='\''1","password":"test"}' \
  http://localhost:5000/login
```

### Test Invalid JWT
```bash
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:5000/analytics
```

## Production Deployment Checklist

1. Set strong JWT_SECRET (min 32 characters, random)
2. Set FRONTEND_URL to production domain
3. Enable HTTPS/TLS
4. Set NODE_ENV=production
5. Use strong database password
6. Enable database SSL
7. Configure firewall rules
8. Set up monitoring and alerting
9. Regular security updates
10. Backup strategy in place

## Reporting Security Issues

If you discover a security vulnerability, please email security@example.com.
Do not create public GitHub issues for security vulnerabilities.
