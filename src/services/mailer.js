const nodemailer = require("nodemailer");
const { MAIL, assertMailEnv } = require("../config/mail");

let transporter;

function getTransporter() {
  if (!transporter) {
    assertMailEnv();
    transporter = nodemailer.createTransport({
      host: MAIL.host,
      port: MAIL.port,
      secure: MAIL.secure,
      auth: MAIL.auth,
    });
  }
  return transporter;
}

async function sendMail({ to, subject, html, text, from }) {
  const t = getTransporter();

  const fromAddress = from || MAIL.supportFrom;
  const fromHeader = `${MAIL.fromName} <${fromAddress}>`;

  return t.sendMail({
    from: fromHeader,
    to,
    subject,
    text,
    html,
  });
}

module.exports = { sendMail };
