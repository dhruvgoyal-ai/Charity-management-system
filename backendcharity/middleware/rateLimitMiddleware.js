const rateLimit = require("express-rate-limit");

const isDev = process.env.NODE_ENV === "development";

// General API limiter — much looser in development
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
});

// Auth route limiter — still looser in development to avoid blocking tests
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

module.exports = { apiLimiter, authLimiter };
