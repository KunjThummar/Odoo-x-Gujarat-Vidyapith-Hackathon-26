const nodemailer = require('nodemailer');

let transporter;

// create a reusable transporter instance (singleton)
const createTransporter = () => {
  if (transporter) return transporter;

  const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM } = process.env;

  // if environment variables are missing we fall back to a dummy console transport
  if (!MAIL_HOST || !MAIL_PORT || !MAIL_USER || !MAIL_PASS) {
    console.warn('Mail configuration not found, emails will be logged to the console');
    transporter = {
      sendMail: (options) => {
        console.log('--- simulated email ---');
        console.log(options);
        console.log('-----------------------');
        return Promise.resolve();
      },
    };
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: parseInt(MAIL_PORT, 10),
    secure: MAIL_PORT == '465', // true for 465, false for other ports
    auth: { user: MAIL_USER, pass: MAIL_PASS },
  });

  return transporter;
};

/**
 * sendEmail
 *  - options: { to, subject, text, html }
 *  - returns a promise
 */
const sendEmail = async (options) => {
  const t = createTransporter();
  const from = process.env.MAIL_FROM || process.env.MAIL_USER;
  const msg = { from, ...options };
  return t.sendMail(msg);
};

module.exports = { sendEmail };
