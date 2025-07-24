const config = require('../config/env');

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error details
  console.error('Error occurred:', {
    message: err.message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Default error response
  let error = {
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  };

  let statusCode = 500;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    error = {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.details || err.message,
      timestamp: new Date().toISOString()
    };
  }

  // Handle Joi validation errors
  if (err.isJoi) {
    statusCode = 400;
    error = {
      message: 'Invalid input data',
      code: 'VALIDATION_ERROR',
      details: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      })),
      timestamp: new Date().toISOString()
    };
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    error = {
      message: 'Invalid authentication token',
      code: 'INVALID_TOKEN',
      timestamp: new Date().toISOString()
    };
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    error = {
      message: 'Authentication token expired',
      code: 'TOKEN_EXPIRED',
      timestamp: new Date().toISOString()
    };
  }

  // Handle database errors
  if (err.code === 'SQLITE_CONSTRAINT' || err.code === '23505') {
    statusCode = 409;
    error = {
      message: 'Data conflict - resource already exists',
      code: 'CONFLICT',
      timestamp: new Date().toISOString()
    };
  }

  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY' || err.code === '23503') {
    statusCode = 400;
    error = {
      message: 'Invalid reference - related resource not found',
      code: 'INVALID_REFERENCE',
      timestamp: new Date().toISOString()
    };
  }

  // Handle file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    error = {
      message: 'File too large',
      code: 'FILE_TOO_LARGE',
      maxSize: err.limit,
      timestamp: new Date().toISOString()
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    error = {
      message: 'Unexpected file field',
      code: 'UNEXPECTED_FILE',
      timestamp: new Date().toISOString()
    };
  }

  // Handle rate limiting errors
  if (err.status === 429) {
    statusCode = 429;
    error = {
      message: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: err.retryAfter,
      timestamp: new Date().toISOString()
    };
  }

  // Handle custom application errors
  if (err.statusCode) {
    statusCode = err.statusCode;
    error = {
      message: err.message,
      code: err.code || 'APPLICATION_ERROR',
      details: err.details,
      timestamp: new Date().toISOString()
    };
  }

  // Handle network and external service errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    statusCode = 503;
    error = {
      message: 'Service temporarily unavailable',
      code: 'SERVICE_UNAVAILABLE',
      timestamp: new Date().toISOString()
    };
  }

  // Add stack trace in development
  if (config.nodeEnv === 'development') {
    error.stack = err.stack;
    error.originalError = err.message;
  }

  // Add request context for debugging
  if (config.nodeEnv === 'development') {
    error.request = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query
    };
  }

  // Send error response
  res.status(statusCode).json({ error });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND',
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * Async error wrapper for route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'APPLICATION_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create specific error types
 */
const createError = {
  badRequest: (message, details = null) => new AppError(message, 400, 'BAD_REQUEST', details),
  unauthorized: (message = 'Unauthorized') => new AppError(message, 401, 'UNAUTHORIZED'),
  forbidden: (message = 'Forbidden') => new AppError(message, 403, 'FORBIDDEN'),
  notFound: (message = 'Resource not found') => new AppError(message, 404, 'NOT_FOUND'),
  conflict: (message, details = null) => new AppError(message, 409, 'CONFLICT', details),
  unprocessableEntity: (message, details = null) => new AppError(message, 422, 'UNPROCESSABLE_ENTITY', details),
  tooManyRequests: (message = 'Too many requests') => new AppError(message, 429, 'TOO_MANY_REQUESTS'),
  internalServer: (message = 'Internal server error') => new AppError(message, 500, 'INTERNAL_SERVER_ERROR')
};

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Close server & exit process
  process.exit(1);
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  process.exit(1);
});

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  createError
};