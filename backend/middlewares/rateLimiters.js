const rateLimit = require('express-rate-limit');

/**
 * Authentication Rate Limiter
 * Limits login/register attempts to 15 per 15-minute window per IP
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

/**
 * AI Operations Rate Limiter
 * Limits expensive AI generation/analysis to 40 requests per 15-minute window per user (or IP if unauthenticated)
 */
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  keyGenerator: (req) => {
    return req.user?._id?.toString() || req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'AI usage rate limit reached. Please wait a few moments before running further analyses.'
  }
});

/**
 * AI Burst Protection
 * Prevents spamming AI buttons simultaneously (max 5 requests per 10 seconds)
 */
const aiBurstLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 5,
  keyGenerator: (req) => {
    return req.user?._id?.toString() || req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many rapid requests. Please wait a moment.'
  }
});

module.exports = {
  authRateLimiter,
  aiRateLimiter,
  aiBurstLimiter
};
