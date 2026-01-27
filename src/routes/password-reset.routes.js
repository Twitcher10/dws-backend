const router = require("express").Router();
const {
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("../controllers/password-reset.controller");

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
