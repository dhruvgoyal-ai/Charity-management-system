const express = require("express");
const dotenv  = require("dotenv");
const cors    = require("cors");
const helmet  = require("helmet");
const morgan  = require("morgan");

const connectDB      = require("./config/db");
const routes         = require("./routes/index");
const errorHandler   = require("./middleware/errorMiddleware");
const { apiLimiter } = require("./middleware/rateLimitMiddleware");
const AppError       = require("./utils/AppError");

// ─── Load environment variables ────────────────────────────────────────────
dotenv.config();

// ─── Connect to MongoDB ────────────────────────────────────────────────────
connectDB();

const app = express();

// ─── Security middleware ───────────────────────────────────────────────────
app.use(helmet());                          // Sets secure HTTP headers
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
// Rate limiting — disabled in development so testing is never blocked
if (process.env.NODE_ENV !== "development") {
  //app.use(apiLimiter);
}

// ─── Request parsing ───────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));   // JSON body (size-limited)
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ─── Dev logging ──────────────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
   app.use(morgan("dev"));
}

// ─── Health check ─────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "CharityHub API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API routes ───────────────────────────────────────────────────────────
app.use("/api/v1", routes);

// ─── 404 — unmatched routes ───────────────────────────────────────────────
app.all("*", (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found on this server.`, 404));
});

// ─── Global error handler (must be last) ──────────────────────────────────
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// ─── Handle unhandled promise rejections ──────────────────────────────────
process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// ─── Handle uncaught exceptions ───────────────────────────────────────────
process.on("uncaughtException", (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = app;
