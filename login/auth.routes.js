const express = require("express");
const { register, login, getMe } = require("../controllers/auth.controller");
const { protect, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

// ─── Public Routes ────────────────────────────────────────────────────────────
router.post("/register", register);
router.post("/login", login);

// ─── Protected Routes ─────────────────────────────────────────────────────────
router.get("/me", protect, getMe);

// ─── Role-restricted Example ──────────────────────────────────────────────────
// Only admins can hit this route — demonstrates authorizeRoles usage
router.get("/admin-only", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ success: true, message: `Welcome, admin ${req.user.name}!` });
});

// Donors and NGOs (not admins)
router.get(
  "/dashboard",
  protect,
  authorizeRoles("donor", "ngo"),
  (req, res) => {
    res.json({
      success: true,
      message: `Welcome to your dashboard, ${req.user.name}!`,
    });
  }
);

module.exports = router;
