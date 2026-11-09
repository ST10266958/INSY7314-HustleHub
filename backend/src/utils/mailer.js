const nodemailer = require('nodemailer');
const logger = require('../config/logger');
const { smtp, clientOrigin, nodeEnv } = require('../config/env');

let transporter;
function getTransporter() {
  if (!smtp.host) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: smtp.user ? { user: smtp.user, pass: smtp.pass } : undefined,
    });
  }
  return transporter;
}

/**
 * Emails a password reset link. The token travels in the URL fragment (#token=...) so it is never
 * sent to a server, written to access logs or leaked through the Referer header.
 * Without SMTP settings, development builds log the link instead so the flow can still be demonstrated.
 */
async function sendPasswordResetEmail(to, token, minutes) {
  const link = `${clientOrigin.replace(/\/$/, '')}/reset-password#token=${token}`;
  const mailer = getTransporter();

  if (!mailer) {
    if (nodeEnv === 'production') {
      logger.error('Password reset email not sent: SMTP_HOST is not configured.');
    } else {
      logger.info(`DEV ONLY - password reset link for ${to}: ${link}`);
    }
    return;
  }

  try {
    await mailer.sendMail({
      from: smtp.from,
      to,
      subject: 'Reset your HustleHub+ password',
      text: `We received a request to reset your password.\n\nOpen this link within ${minutes} minutes:\n${link}\n\nIf you did not ask for this, you can ignore this email and your password will stay the same.`,
    });
  } catch (err) {
    logger.error('Failed to send password reset email', { message: err.message });
  }
}

module.exports = { sendPasswordResetEmail };
