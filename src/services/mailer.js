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
    throw new Error(
      "Missing SMTP env vars. Need SMTP_DEFAULT_HOST, SMTP_DEFAULT_USER, SMTP_DEFAULT_PASS"
    );
  }

  console.log("SMTP CONFIG:", {
    host,
    port,
    secure,
    user,
  });

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,

    logger: true,
    debug: true,

    // testing only
    tls: {
      rejectUnauthorized: false,
    },
  });
}

async function sendMail({ to, subject, text, html }) {
  const transport = buildTransport();

  await transport.verify();
  console.log("SMTP READY");

  const fromName =
    process.env.MAIL_FROM_NAME || process.env.APP_NAME || "Dream Water Supply";

  const fromEmail = process.env.SMTP_DEFAULT_USER;

  return transport.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    text,
    html,
  });
}

module.exports = { sendMail };