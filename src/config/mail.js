// config/mail.js
function getBool(v, fallback = false) {
  if (v === undefined || v === null || v === "") return fallback;
  return String(v).toLowerCase() === "true";
}

const SMTP_PORT = Number(process.env.SMTP_DEFAULT_PORT || 465);

module.exports = {
  appName: process.env.APP_NAME || "Dream Water Supply",

  smtp: {
    host: process.env.SMTP_DEFAULT_HOST,
    port: SMTP_PORT,
    secure: getBool(process.env.SMTP_DEFAULT_SECURE, SMTP_PORT === 465), // 465=true typically
    auth: {
      user: process.env.SMTP_DEFAULT_USER,
      pass: process.env.SMTP_DEFAULT_PASS,
    },
  },

  addresses: {
    support: process.env.MAIL_SUPPORT_ADDRESS || process.env.SMTP_DEFAULT_USER,
    billing: process.env.MAIL_BILLING_ADDRESS || process.env.SMTP_DEFAULT_USER,
  },

  from: process.env.MAIL_SUPPORT_ADDRESS || process.env.SMTP_DEFAULT_USER,
  fromName: process.env.MAIL_FROM_NAME || process.env.APP_NAME || "Dream Water Supply",
};
