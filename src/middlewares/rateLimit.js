import rateLimit from 'express-rate-limit';

// for api limitng
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // 100 reqs max per IP
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// for booking limiting
export const bookingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Max 10 bookings per minute per IP
  message: {
    success: false,
    message: 'Too many booking requests, please slow down.'
  },
});