const MAIL = {
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: String(process.env.MAIL_SECURE || "false") === "true", // true for 465
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
  fromName: process.env.MAIL_FROM_NAME || process.env.APP_NAME || "App",
  supportFrom: process.env.MAIL_SUPPORT_ADDRESS,
  billingFrom: process.env.MAIL_BILLING_ADDRESS,
};

function assertMailEnv() {
  const required = ["MAIL_HOST", "MAIL_PORT", "MAIL_USERNAME", "MAIL_PASSWORD", "MAIL_SUPPORT_ADDRESS"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Missing mail env vars: ${missing.join(", ")}`);
}

module.exports = { MAIL, assertMailEnv };
