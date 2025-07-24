const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/user.model');

/**
 * Middleware to authenticate JWT tokens
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'TOKEN_INVALID'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Middleware to check if user has premium plan
 */
const requirePremium = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  if (req.user.plan !== 'premium') {
    return res.status(403).json({ 
      error: 'Premium subscription required',
      code: 'PREMIUM_REQUIRED',
      upgradeUrl: '/upgrade'
    });
  }

  next();
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Generate JWT tokens
 */
const generateTokens = async (userId) => {
  const payload = { userId };
  
  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
  
  const refreshToken = await User.createRefreshToken(userId);
  
  return {
    accessToken,
    refreshToken
  };
};

/**
 * Verify refresh token and generate new access token
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    const tokenRecord = await User.findRefreshToken(refreshToken);
    
    if (!tokenRecord) {
      throw new Error('Invalid refresh token');
    }

    const user = await User.findById(tokenRecord.user_id);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate new access token
    const payload = { userId: user.id };
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan
      }
    };
  } catch (error) {
    throw new Error('Token refresh failed');
  }
};

/**
 * Middleware to check resource ownership
 */
const checkResourceOwnership = (resourceIdParam = 'id', resourceModel) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const userId = req.user.id;

      // For goals, check user_id
      if (resourceModel === 'Goal') {
        const Goal = require('../models/goal.model');
        const resource = await Goal.findById(resourceId);
        
        if (!resource) {
          return res.status(404).json({ error: 'Resource not found' });
        }
        
        if (resource.user_id !== userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }
      
      // For contributions, check through goal ownership
      if (resourceModel === 'Contribution') {
        const Contribution = require('../models/contribution.model');
        const Goal = require('../models/goal.model');
        
        const contribution = await Contribution.findById(resourceId);
        if (!contribution) {
          return res.status(404).json({ error: 'Resource not found' });
        }
        
        const goal = await Goal.findById(contribution.goal_id);
        if (!goal || goal.user_id !== userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      next();
    } catch (error) {
      console.error('Resource ownership check error:', error);
      return res.status(500).json({ error: 'Authorization error' });
    }
  };
};

/**
 * Rate limiting for authentication endpoints
 */
const authRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: {
    error: 'Too many authentication attempts, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authenticateToken,
  requirePremium,
  optionalAuth,
  generateTokens,
  refreshAccessToken,
  checkResourceOwnership,
  authRateLimit
};