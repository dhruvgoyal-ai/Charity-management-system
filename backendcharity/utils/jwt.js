const jwt = require("jsonwebtoken");

// ─── Helpers (lazy-read env so dotenv loads first) ─────────────────────────

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not defined");
  return secret;
};

/**
 * Generate a signed access token for the given payload.
 * @param {Object} payload - Data to embed (e.g. { id, role })
 * @returns {string} Signed JWT
 */
const generateAccessToken = (payload) =>
  jwt.sign(payload, getSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

/**
 * Generate a longer-lived refresh token.
 * @param {Object} payload
 * @returns {string} Signed JWT
 */
const generateRefreshToken = (payload) =>
  jwt.sign(payload, getSecret(), {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });

/**
 * Verify a JWT and return its decoded payload.
 * Throws if the token is invalid or expired.
 * @param {string} token
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => jwt.verify(token, getSecret());

module.exports = { generateAccessToken, generateRefreshToken, verifyToken };
