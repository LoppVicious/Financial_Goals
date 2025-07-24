const express = require('express');
const { 
  authenticateToken, 
  generateTokens, 
  refreshAccessToken,
  authRateLimit 
} = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { asyncHandler, createError } = require('../middleware/errorHandler');
const User = require('../models/user.model');

const router = express.Router();
const Joi = require('joi');
/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', 
  authRateLimit,
  validate(schemas.userRegistration),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw createError.conflict('User with this email already exists');
    }

    // Create new user
    const user = await User.create({ name, email, password });
    
    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan
      },
      token: accessToken,
      refreshToken
    });
  })
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login',
  authRateLimit,
  validate(schemas.userLogin),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      throw createError.unauthorized('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw createError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan
      },
      token: accessToken,
      refreshToken
    });
  })
);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh',
  validate(schemas.refreshToken),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    try {
      const result = await refreshAccessToken(refreshToken);
      
      res.json({
        message: 'Token refreshed successfully',
        token: result.accessToken,
        user: result.user
      });
    } catch (error) {
      throw createError.unauthorized('Invalid refresh token');
    }
  })
);

/**
 * POST /api/auth/logout
 * Logout user (invalidate refresh token)
 */
router.post('/logout',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await User.deleteRefreshToken(refreshToken);
    }

    res.json({
      message: 'Logout successful'
    });
  })
);

/**
 * POST /api/auth/logout-all
 * Logout from all devices (invalidate all refresh tokens)
 */
router.post('/logout-all',
  authenticateToken,
  asyncHandler(async (req, res) => {
    await User.deleteAllRefreshTokens(req.user.id);

    res.json({
      message: 'Logged out from all devices'
    });
  })
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me',
  authenticateToken,
  asyncHandler(async (req, res) => {
    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        plan: req.user.plan,
        created_at: req.user.created_at
      }
    });
  })
);

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile',
  authenticateToken,
  validate(Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    email: Joi.string().email().lowercase().optional()
  })),
  asyncHandler(async (req, res) => {
    const { name, email } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== req.user.id) {
        throw createError.conflict('Email already in use');
      }
      updates.email = email;
    }

    const updatedUser = await User.update(req.user.id, updates);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        plan: updatedUser.plan
      }
    });
  })
);

/**
 * PUT /api/auth/password
 * Change user password
 */
router.put('/password',
  authenticateToken,
  validate(Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(128).required()
  })),
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Get user with password hash
    const user = await User.findByEmail(req.user.email);
    
    // Verify current password
    const isValidPassword = await User.verifyPassword(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw createError.unauthorized('Current password is incorrect');
    }

    // Update password
    await User.updatePassword(req.user.id, newPassword);

    // Invalidate all refresh tokens to force re-login on all devices
    await User.deleteAllRefreshTokens(req.user.id);

    res.json({
      message: 'Password updated successfully. Please log in again.'
    });
  })
);

/**
 * DELETE /api/auth/account
 * Delete user account
 */
router.delete('/account',
  authenticateToken,
  validate(Joi.object({
    password: Joi.string().required(),
    confirmation: Joi.string().valid('DELETE').required()
  })),
  asyncHandler(async (req, res) => {
    const { password } = req.body;

    // Get user with password hash
    const user = await User.findByEmail(req.user.email);
    
    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw createError.unauthorized('Password is incorrect');
    }

    // Delete user account (this will cascade delete all related data)
    await User.delete(req.user.id);

    res.json({
      message: 'Account deleted successfully'
    });
  })
);

module.exports = router;