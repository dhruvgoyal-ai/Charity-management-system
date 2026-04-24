const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

/**
 * Generate a signed access token for the given payload.
 * @param {Object} payload - Data to embed (e.g. { id, role })
 * @returns {string} Signed JWT
 */
const generateAccessToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

/**
 * Generate a longer-lived refresh token.
 * @param {Object} payload
 * @returns {string} Signed JWT
 */
const generateRefreshToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });

/**
 * Verify a JWT and return its decoded payload.
 * Throws if the token is invalid or expired.
 * @param {string} token
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

module.exports = { generateAccessToken, generateRefreshToken, verifyToken };
