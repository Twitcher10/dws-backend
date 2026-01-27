// src/services/mailer.js
const nodemailer = require("nodemailer");

function toBool(v, fallback = false) {
  if (v === undefined || v === null || v === "") return fallback;
  return String(v).toLowerCase() === "true";
}

function buildTransport() {
  const host = process.env.SMTP_DEFAULT_HOST;
  const port = Number(process.env.SMTP_DEFAULT_PORT || 465);
  const secure = toBool(process.env.SMTP_DEFAULT_SECURE, port === 465);

  const user = process.env.SMTP_DEFAULT_USER;
  const pass = process.env.SMTP_DEFAULT_PASS;

  if (!host || !user || !pass) {
    // This is the exact thing we want to see in Railway logs too
    throw new Error(
      "Missing SMTP env vars. Need SMTP_DEFAULT_HOST, SMTP_DEFAULT_USER, SMTP_DEFAULT_PASS"
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },

    // ✅ prevent hanging forever if SMTP is misconfigured
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
}

async function sendMail({ to, subject, text, html, from }) {
  const transport = buildTransport();

  const fromName =
    process.env.MAIL_FROM_NAME || process.env.APP_NAME || "Dream Water Supply";

  // If caller passed `from`, use that. Else default to support address, else SMTP user.
  const fromEmail =
    from || process.env.MAIL_SUPPORT_ADDRESS || process.env.SMTP_DEFAULT_USER;

  return transport.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    text,
    html,
  });
}

module.exports = { sendMail };
