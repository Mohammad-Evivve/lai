const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_INSIGHTS = process.env.EMAIL_FROM_INSIGHTS || 'Adaptive Express <insights@adaptiveness.institute>';
const FROM_NOTIFICATIONS = process.env.EMAIL_FROM_NOTIFICATIONS || 'The Adaptiveness Institute <notification@adaptiveness.institute>';

/**
 * Send an email via Resend
 * @param {Object} options - { from, to, subject, html }
 */
const sendEmail = async ({ from, to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: from || FROM_NOTIFICATIONS,
      to,
      subject,
      html
    });

    if (error) {
      console.error('Resend Error:', error);
      return { error };
    }

    return { success: true, id: data.id };
  } catch (err) {
    console.error('Email Send Exception:', err);
    return { error: err };
  }
};

/**
 * Get the sender address based on type
 * @param {string} type - 'insights' or 'notifications'
 */
const getSender = (type) => {
  if (type === 'insights') return FROM_INSIGHTS;
  return FROM_NOTIFICATIONS;
};

module.exports = {
  sendEmail,
  getSender,
  FROM_INSIGHTS,
  FROM_NOTIFICATIONS
};
