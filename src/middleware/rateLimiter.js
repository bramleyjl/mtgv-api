import rateLimit from 'express-rate-limit';
import logger from '../lib/logger.js';

/**
 * Rate limiting configuration for different route types
 */

// General API rate limit - 100 requests per 15 minutes per IP
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    type: 'RateLimitError',
  },
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      url: req.originalUrl,
    });
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      type: 'RateLimitError',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

// Strict rate limit for expensive operations - 10 requests per minute
export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many package creation requests. Please wait before trying again.',
    type: 'RateLimitError',
  },
  handler: (req, res) => {
    logger.warn('Strict rate limit exceeded', {
      ip: req.ip,
      url: req.originalUrl,
    });
    res.status(429).json({
      error: 'Too many package creation requests. Please wait before trying again.',
      type: 'RateLimitError',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

// Search/autocomplete rate limit - 30 requests per minute (more lenient)
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    logger.warn('Search rate limit exceeded', {
      ip: req.ip,
      url: req.originalUrl,
    });
    res.status(429).json({
      error: 'Too many search requests. Please slow down.',
      type: 'RateLimitError',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});
