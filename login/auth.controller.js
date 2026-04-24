const User = require("../models/User");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Validate password strength:
 *  - Minimum 8 characters
 *  - At least one uppercase letter
 *  - At least one lowercase letter
 *  - At least one digit
 *  - At least one special character
 */
const validatePasswordStrength = (password) => {
  const rules = [
    { regex: /.{8,}/, message: "at least 8 characters" },
    { regex: /[A-Z]/, message: "at least one uppercase letter" },
    { regex: /[a-z]/, message: "at least one lowercase letter" },
    { regex: /[0-9]/, message: "at least one number" },
    {
      regex: /[!@#$%^&*(),.?":{}|<>]/,
      message: "at least one special character",
    },
  ];

  const failed = rules.filter((r) => !r.regex.test(password));
  return failed.length === 0
    ? { valid: true }
    : { valid: false, errors: failed.map((r) => r.message) };
};

/**
 * Build a sanitized user object safe to return in responses.
 * Never exposes the hashed password.
 */
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Body: { name, email, password, role? }
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    // 2. Validate password strength
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        success: false,
        message: "Password does not meet requirements.",
        errors: passwordCheck.errors,
      });
    }

    // 3. Check for duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // 4. Create user (password hashed by pre-save hook in User model)
    const user = await User.create({ name, email, password, role });

    // 5. Issue tokens
    const tokenPayload = { id: user._id, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    // Handle Mongoose validation errors cleanly
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: errors[0], errors });
    }
    console.error("[register]", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate presence
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // 2. Find user + verify credentials (static method on User model)
    //    findByCredentials throws a generic error on any failure to prevent
    //    user enumeration attacks.
    const user = await User.findByCredentials(email, password);

    // 3. Issue tokens
    const tokenPayload = { id: user._id, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    // Surface credential errors as 401, everything else as 500
    if (err.message === "Invalid email or password") {
      return res.status(401).json({ success: false, message: err.message });
    }
    console.error("[login]", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * GET /api/auth/me   (protected)
 * Returns the currently authenticated user.
 */
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: { user: sanitizeUser(req.user) },
  });
};

module.exports = { register, login, getMe };
