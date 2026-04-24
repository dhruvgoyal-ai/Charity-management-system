const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");

/**
 * protect
 * Verifies the Bearer token from the Authorization header,
 * attaches the full user document to req.user, and calls next().
 * Responds with 401 on any auth failure.
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify & decode token
    const decoded = verifyToken(token);

    // 3. Fetch fresh user from DB (catches deleted/deactivated accounts)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    // 4. Attach user to request and proceed
    req.user = user;
    next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Token has expired. Please log in again."
        : "Invalid token. Authentication failed.";

    return res.status(401).json({ success: false, message });
  }
};

/**
 * authorizeRoles(...roles)
 * Role-based access control middleware factory.
 * Must be used AFTER protect().
 *
 * Usage:
 *   router.delete("/users/:id", protect, authorizeRoles("admin"), deleteUser);
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(", ")}.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
