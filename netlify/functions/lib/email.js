const { Resend } = require('resend');

let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

const getSender = (type) => 'Leadership Adaptiveness Institute <mmemon@evivve.com>';

const sendEmail = async ({ from, to, subject, html, type = 'unspecified' }) => {
  const result = {
    status: 'attempted',
    provider_message_id: null,
    provider_response: null,
    error_message: null,
    success: false
  };

  try {
    if (!resend) {
      result.status = 'failed_at_send';
      result.error_message = 'Resend API Key is missing';
      return result;
    }

    const { data, error } = await resend.emails.send({
      from: from || getSender(),
      to,
      subject,
      html
    });

    result.provider_response = data || error;

    if (error) {
      result.status = 'failed_at_send';
      result.error_message = error.message;
      console.error("Email send failed:", { type, recipient: to, error: error.message });
      return result;
    }

    // Resend successful send returns data with an id
    if (data && data.id) {
      result.status = 'accepted_by_provider';
      result.provider_message_id = data.id;
      result.success = true;
      console.log("Email accepted by provider:", { type, recipient: to, id: data.id });
    } else {
      result.status = 'delivery_unknown';
      console.warn("Email sent but no ID returned:", { type, recipient: to });
    }
    
    return result;
  } catch (err) {
    result.status = 'failed_at_send';
    result.error_message = err.message;
    console.error("Email send exception:", { type, recipient: to, error: err.message });
    return result;
  }
};

module.exports = { sendEmail, getSender };
