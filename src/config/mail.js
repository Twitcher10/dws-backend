const SMTP_PORT = Number(process.env.SMTP_PORT || 587);

module.exports = {
  appName: process.env.APP_NAME || "Dream Water Supply",

  smtp: {
    host: process.env.SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // 465 = SSL, 587 = STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  },

  addresses: {
    support: process.env.MAIL_SUPPORT_ADDRESS || process.env.SMTP_FROM_EMAIL,
    billing: process.env.MAIL_BILLING_ADDRESS || process.env.SMTP_FROM_EMAIL,
  },

  from:
    process.env.SMTP_FROM_EMAIL ||
    process.env.MAIL_SUPPORT_ADDRESS ||
    process.env.SMTP_USER,
};
