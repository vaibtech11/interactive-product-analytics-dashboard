import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db.js';
import authRoutes from './routes/auth.js';
import trackRoutes from './routes/track.js';
import analyticsRoutes from './routes/analytics.js';
import { apiRateLimiter, authRateLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration - Security Best Practice
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://interactive-product-analytics-dashboa.netlify.app"
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general rate limiting to all API routes
app.use('/api', apiRateLimiter);

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Health check route (no rate limiting)
app.get('/health', (req, res) => {
  res.json({ status: 'running' });
});

// API Routes with rate limiting
app.use('/auth', authRateLimiter, authRoutes);
app.use('/track', trackRoutes); // Rate limiting applied in track.js
app.use('/analytics', analyticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Don't expose internal error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(err.status || 500).json({ 
    error: 'Internal server error',
    message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: 'The requested resource was not found' 
  });
});

// Start server function
const startServer = async () => {
  try {
    // Validate required environment variables
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    if (process.env.JWT_SECRET.length < 32) {
      console.warn('WARNING: JWT_SECRET should be at least 32 characters for security');
    }

    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
      console.log('Security features enabled:');
      console.log('  ✓ CORS configured');
      console.log('  ✓ Rate limiting enabled');
      console.log('  ✓ Security headers set');
      console.log('  ✓ Input validation active');
      console.log('  ✓ SQL injection protection');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Only start server if this file is run directly

  startServer();


// Export app for testing
export default app;
