import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_INSIGHTS = process.env.EMAIL_FROM_INSIGHTS || 'Adaptive Express <insights@adaptiveness.institute>';
export const FROM_NOTIFICATIONS = process.env.EMAIL_FROM_NOTIFICATIONS || 'The Adaptiveness Institute <notification@adaptiveness.institute>';

export const sendEmail = async ({ from, to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: from || FROM_NOTIFICATIONS,
      to,
      subject,
      html
    });
    if (error) {
      console.error('[EMAIL] Send error:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error('[EMAIL] Exception:', err.message);
    return { success: false, error: err.message };
  }
};

export const getSender = (type) => {
  if (type === 'insights') return FROM_INSIGHTS;
  return FROM_NOTIFICATIONS;
};
