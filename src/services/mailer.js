// src/services/mailer.js
const nodemailer = require("nodemailer");

function getBool(v) {
  return String(v).toLowerCase() === "true";
}

function buildTransport() {
  const host = process.env.SMTP_DEFAULT_HOST || process.env.MAIL_HOST;
  const port = Number(process.env.SMTP_DEFAULT_PORT || process.env.MAIL_PORT || 465);
  const secure = getBool(process.env.SMTP_DEFAULT_SECURE || process.env.MAIL_SECURE || "true");

  const user = process.env.SMTP_DEFAULT_USER || process.env.MAIL_USERNAME;
  const pass = process.env.SMTP_DEFAULT_PASS || process.env.MAIL_PASSWORD;

  if (!host || !port || !user || !pass) {
    throw new Error(
      "Missing SMTP env vars. Need SMTP_DEFAULT_HOST/PORT/SECURE/USER/PASS"
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

async function sendMail({ to, subject, text, html, from }) {
  const transport = buildTransport();
  const fromName = process.env.MAIL_FROM_NAME || process.env.APP_NAME || "Dream Water Supply";
  const fromValue = from ? `${fromName} <${from}>` : `${fromName} <${process.env.SMTP_DEFAULT_USER}>`;

  return transport.sendMail({
    from: fromValue,
    to,
    subject,
    text,
    html,
  });
}

module.exports = { sendMail };
