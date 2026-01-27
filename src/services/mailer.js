// src/services/mailer.js
const nodemailer = require("nodemailer");
const mailConfig = require("../config/mail"); // adjust path if needed

function assertSmtp(c) {
  const { host, port, auth } = c.smtp;
  if (!host || !port || !auth?.user || !auth?.pass) {
    throw new Error("Missing SMTP_DEFAULT_* vars in Railway Variables.");
  }
}

let _transport;
function getTransport() {
  if (_transport) return _transport;
  assertSmtp(mailConfig);
  _transport = nodemailer.createTransport(mailConfig.smtp);
  return _transport;
}

async function sendMail({ to, subject, text, html, from }) {
  const transport = getTransport();
  const fromEmail = from || mailConfig.from;
  const fromValue = `${mailConfig.fromName} <${fromEmail}>`;

  return transport.sendMail({
    from: fromValue,
    to,
    subject,
    text,
    html,
  });
}

module.exports = { sendMail };
