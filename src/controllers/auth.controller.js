const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { query } = require("../db/query");
const { loginSchema } = require("../validators/auth.schemas");

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}

async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.flatten()
      });
    }

    const { email, password } = parsed.data;

    const r = await query(
      "SELECT id, email, password_hash, role, full_name, is_active FROM users WHERE email = $1 LIMIT 1",
      [email]
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
        fullName: u.full_name
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { login };