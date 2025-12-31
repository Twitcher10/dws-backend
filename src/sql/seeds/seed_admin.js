require("dotenv").config();
const bcrypt = require("bcryptjs");
const { pool } = require("../../db/pool");

(async () => {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@dreamsupply.co.zw";
  const password = process.env.SEED_ADMIN_PASSWORD || "Dream.2020";
  const fullName = process.env.SEED_ADMIN_NAME || "Dream Admin";
  const role = process.env.SEED_ADMIN_ROLE || "admin";

  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    [fullName, email, hash, role]
  );

  console.log("✅ Seeded admin (if not exists):", email);
  await pool.end();
})().catch(e => {
  console.error(e);
  process.exit(1);
});