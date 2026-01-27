// src/validators/auth.schemas.js
const { z } = require("zod");

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  resetToken: z.string().min(10),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

module.exports = {
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
};
