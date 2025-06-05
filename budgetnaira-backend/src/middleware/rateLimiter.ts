import rateLimit from 'express-rate-limit';

// Rate limiting
export const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000 // More lenient in development
});

// More strict rate limiting for auth routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // More lenient in development
  message: 'Too many login attempts, please try again later.'
});