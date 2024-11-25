/**
 * Rate limiting middleware configuration
 * Uses express-rate-limit to protect against brute force and DoS attacks
 * by limiting the number of requests from a single IP address
 */
const rateLimit = require('express-rate-limit');
const { TooManyRequestsError } = require('../errors/client.errors');

/**
 * Configure rate limiter with the following options:
 * - windowMs: Time window for tracking requests (1 minute)
 * - max: Maximum number of requests allowed per IP in the time window
 * - message: Error message returned when limit is exceeded
 * - handler: Custom error handler that throws TooManyRequestsError
 */
const rateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 5000, // limit each IP to 5000 requests per windowMs
    message: 'Too many requests from this IP, please try again after a minute',
    handler: (_req, _res, next) => {
        // Use custom error handler to maintain consistent error responses
        next(new TooManyRequestsError());
    }
});

// Export configured rate limiter middleware
module.exports = rateLimiter; 