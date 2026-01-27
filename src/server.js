require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { notFoundHandler, errorHandler } = require("./middleware/errors");
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

/**
 * CORS
 */
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

/**
 * Body parsing
 */
app.use(express.json({ limit: "2mb" }));

/**
 * Routes
 */
app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes); // includes login, forgot-password, verify-otp, reset-password

/**
 * Errors (MUST be last)
 */
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Boot
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ API running on port ${PORT}`)
);
