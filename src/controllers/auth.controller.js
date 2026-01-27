// src/controllers/auth.controller.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { query } = require("../db/query");
const { sendMail } = require("../services/mailer");
const {
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} = require("../validators/auth.schemas");

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// short-lived token only for password reset
function signResetToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
}

function makeOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

// --- LOGIN (as you had, only minor cleanup) ---
async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.flatten(),
      });
    }

    const { email, password } = parsed.data;

    const r = await query(
      "SELECT id, email, password_hash, role, full_name, is_active FROM users WHERE email = $1 LIMIT 1",
      [email.toLowerCase()]
    );

    if (r.rowCount === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const u = r.rows[0];

    if (u.is_active === false) {
      return res.status(403).json({ message: "Account disabled" });
    }

    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken({ id: u.id, email: u.email, role: u.role });

    return res.json({
      token,
      user: {
        id: u.id,
        email: u.email,
        role: u.role,
        fullName: u.full_name,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ---------- FORGOT PASSWORD / OTP ----------

async function forgotPassword(req, res, next) {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.flatten(),
      });
    }

    const email = parsed.data.email.trim().toLowerCase();

    // Don't reveal if user exists (security)
    const userRes = await query(
      "SELECT id, email, is_active FROM users WHERE email=$1 LIMIT 1",
      [email]
    );

    if (userRes.rowCount === 0) {
      return res.json({
        ok: true,
        message: "If the email exists, an OTP has been sent.",
      });
    }

    const u = userRes.rows[0];

    if (u.is_active === false) {
      return res.json({
        ok: true,
        message: "If the email exists, an OTP has been sent.",
      });
    }

    const otp = makeOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await query(
      `INSERT INTO password_reset_otps (user_id, email, otp_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [u.id, email, otpHash, expiresAt.toISOString()]
    );

    const appName = process.env.APP_NAME || "Dream Water Supply";
    const fromEmail =
      process.env.MAIL_SUPPORT_ADDRESS || process.env.SMTP_DEFAULT_USER;

    await sendMail({
      to: email,
      subject: `${appName} Password Reset OTP`,
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <p>Your OTP is:</p>
          <h2 style="letter-spacing:3px;margin:10px 0">${otp}</h2>
          <p>This code expires in <b>10 minutes</b>.</p>
          <p>If you didn't request this, ignore this email.</p>
        </div>
      `,
      from: fromEmail,
    });

    return res.json({
      ok: true,
      message: "If the email exists, an OTP has been sent.",
    });
  } catch (err) {
    next(err);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.flatten(),
      });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const otp = parsed.data.otp.trim();

    const userRes = await query("SELECT id FROM users WHERE email=$1 LIMIT 1", [
      email,
    ]);
    if (userRes.rowCount === 0) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    const u = userRes.rows[0];

    const r = await query(
      `SELECT id, otp_hash, expires_at, attempts
       FROM password_reset_otps
       WHERE user_id=$1
       ORDER BY created_at DESC
       LIMIT 1`,
      [u.id]
    );

    if (r.rowCount === 0) return res.status(401).json({ message: "Invalid OTP" });

    const row = r.rows[0];

    if (Number(row.attempts) >= 5) {
      return res
        .status(429)
        .json({ message: "Too many attempts. Request a new OTP." });
    }

    const expired = new Date(row.expires_at).getTime() < Date.now();
    if (expired) {
      return res.status(401).json({ message: "OTP expired. Request a new one." });
    }

    const otpHash = hashOtp(otp);
    if (otpHash !== row.otp_hash) {
      await query(`UPDATE password_reset_otps SET attempts = attempts + 1 WHERE id=$1`, [
        row.id,
      ]);
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // OTP OK → issue reset token
    const resetToken = signResetToken({
      id: u.id,
      email,
      purpose: "reset-password",
    });

    return res.json({ ok: true, resetToken });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.flatten(),
      });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const resetToken = parsed.data.resetToken.trim();
    const newPassword = parsed.data.newPassword;

    let payload;
    try {
      payload = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid or expired reset token" });
    }

    if (payload.purpose !== "reset-password" || payload.email !== email) {
      return res.status(401).json({ message: "Invalid reset token" });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);

    await query("UPDATE users SET password_hash=$1 WHERE id=$2", [
      password_hash,
      payload.id,
    ]);

    // Invalidate OTPs for this user
    await query("DELETE FROM password_reset_otps WHERE user_id=$1", [payload.id]);

    return res.json({ ok: true, message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
