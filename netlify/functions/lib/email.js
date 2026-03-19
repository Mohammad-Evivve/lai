const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const getSender = (type) => 'Leadership Adaptiveness Institute <mmemon@evivve.com>';

const sendEmail = async ({ from, to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: from || getSender(),
      to,
      subject,
      html
    });
    return { success: !error, data, error };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = { sendEmail, getSender };
