const { Resend } = require('resend');

let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

const getSender = (type) => 'Leadership Adaptiveness Institute <mmemon@evivve.com>';

const sendEmail = async ({ from, to, subject, html, type = 'unspecified' }) => {
  try {
    if (!resend) throw new Error('Resend API Key is missing');
    const { data, error } = await resend.emails.send({
      from: from || getSender(),
      to,
      subject,
      html
    });

    if (error) {
      console.error("Email send failed:", {
        type,
        recipient: to,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return { success: false, error };
    }

    console.log("Email sent successfully:", {
      type,
      recipient: to,
      timestamp: new Date().toISOString()
    });
    return { success: true, data };
  } catch (err) {
    console.error("Email send exception:", {
      type,
      recipient: to,
      error: err.message,
      timestamp: new Date().toISOString()
    });
    return { success: false, error: err.message };
  }
};

module.exports = { sendEmail, getSender };
