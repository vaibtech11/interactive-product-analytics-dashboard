import jwt from 'jsonwebtoken';

/**
 * JWT Authentication Middleware
 * Protects routes by verifying JWT tokens from Authorization header
 * 
 * Usage: app.use('/protected-route', authMiddleware, routeHandler)
 */
export const authMiddleware = (req, res, next) => {
  try {
    // Read token from Authorization header: "Bearer TOKEN"
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No authorization header provided' 
      });
    }

    // Extract token from "Bearer TOKEN" format
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No token provided' 
      });
    }

    // Verify JWT using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user_id to request object for use in protected routes
    req.userId = decoded.userId;
    req.user = {
      id: decoded.userId,
      username: decoded.username
    };
    
    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // Handle JWT verification errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Token expired' 
      });
    }
    
    // Generic error
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Authentication failed' 
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user info if token is valid, but doesn't block request if invalid
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.user = {
          id: decoded.userId,
          username: decoded.username
        };
      }
    }
  } catch (error) {
    // Silently fail for optional auth
    console.log('Optional auth failed:', error.message);
  }
  
  next();
};

export default authMiddleware;
