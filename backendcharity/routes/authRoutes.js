const express = require("express");
const router = express.Router();
const { register, login, getMe, logout, listNgos } = require("../controllers/auth.controller");
const { protect }    = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimitMiddleware");

// Apply stricter rate limit to auth routes — only in production
if (process.env.NODE_ENV !== "development") {
  router.use(authLimiter);
}

// ─── Public Routes ────────────────────────────────────────────────────────────
// POST /api/v1/auth/register
router.post("/register", register);

// POST /api/v1/auth/login
router.post("/login", login);

// POST /api/v1/auth/logout
router.post("/logout", logout);

// GET /api/v1/auth/ngos
router.get("/ngos", listNgos);

// ─── Protected Routes ─────────────────────────────────────────────────────────
// GET /api/v1/auth/me  — returns the logged-in user's profile
router.get("/me", protect, getMe);

module.exports = router;
