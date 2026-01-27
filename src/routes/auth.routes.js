// src/routes/auth.routes.js
const router = require("express").Router();
const {
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/requireAuth");

router.post("/login", login);
router.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
