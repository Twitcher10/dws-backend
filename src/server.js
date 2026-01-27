require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { notFoundHandler, errorHandler } = require("./middleware/errors");
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));

app.use(express.json({ limit: "2mb" }));

app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);
pp.use("/api/auth", authRoutes);
app.use("/api/auth", passwordResetRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ API running on port ${PORT}`));