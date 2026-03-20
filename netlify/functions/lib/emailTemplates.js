/**
 * Email Templates for LAI Institutional Communication
 * Following the Structure: Header, Event, Interpretation, CTA
 */

const { generateAppLink } = require('./linkUtils');

const baseStyles = `
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #0f172a;
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const headerStyles = `
  border-bottom: 2px solid #0f172a;
  padding-bottom: 15px;
  margin-bottom: 30px;
`;

const institutionLabel = `
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.2em;
  color: #64748b;
  text-transform: uppercase;
  display: block;
  margin-bottom: 4px;
`;

const nameLabel = `
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #0f172a;
`;

const buttonStyles = `
  display: inline-block;
  padding: 14px 28px;
  background-color: #0f172a;
  color: #ffffff;
  text-decoration: none;
  font-weight: bold;
  font-size: 14px;
  border-radius: 4px;
  margin: 24px 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const footerStyles = `
  margin-top: 50px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  font-size: 10px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: center;
`;

const wrap = (content) => `
  <div style="${baseStyles}">
    <div style="${headerStyles}">
      <span style="${institutionLabel}">Leadership Adaptiveness Institute</span>
      <span style="${nameLabel}">Institutional Communication</span>
    </div>
    <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; border: 1px solid #f1f5f9;">
      ${content}
    </div>
    <div style="${footerStyles}">
      &copy; 2026 Leadership Adaptiveness Institute<br/>
      Global Behavioral Evidence & Research
    </div>
  </div>
`;

const ESSENTIAL = {
  /**
   * 1. Participant Report Email
   */
  participantReport: (data) => {
    const reportUrl = generateAppLink(`/report/perception/${data.reportId}`);
    const diagnosticUrl = generateAppLink('/diagnostic');
    
    return wrap(`
      <p style="font-weight: bold; font-size: 18px; margin-bottom: 20px;">Your Leadership Adaptiveness Profile is Ready</p>
      
      <p style="color: #475569; font-size: 14px; margin-bottom: 24px;">
        <strong>EVENT:</strong> Your observations have been processed within the LAI behavioral framework.<br/><br/>
        <strong>INTERPRETATION:</strong> This profile reflects how your leadership system is currently perceived. It is important to note that most systems behave differently under pressure than they do in static observation.
      </p>

      <div style="text-align: center;">
        <a href="${reportUrl}" style="${buttonStyles}">View Your Profile</a>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 13px; color: #1e293b; font-weight: bold; margin-bottom: 10px;">Next Step: Measure Behavior Under Pressure</p>
        <p style="font-size: 12px; color: #64748b; margin-bottom: 15px;">
          To reveal the 'Divergent Dimensions' between intent and execution, we recommend a full behavioral measurement cycle for your team.
        </p>
        <a href="${diagnosticUrl}" style="font-size: 12px; font-weight: bold; color: #0f172a; text-decoration: underline;">Explore Behavioral Diagnostic &rarr;</a>
      </div>
      
      <p style="font-size: 11px; color: #94a3b8; margin-top: 30px; font-style: italic;">
        Drawn from over 20,000 simulated environments and 100,000+ leadership data points.
      </p>
    `);
  },

  /**
   * 2. State of Cognition Report Email
   */
  socReportDelivery: (data) => {
    const downloadUrl = generateAppLink('/assets/State_of_Cognition_2026_Institutional.pdf');
    return wrap(`
      <p style="font-weight: bold; font-size: 18px; margin-bottom: 20px;">State of Cognition Report — Institutional Release</p>
      
      <p style="color: #475569; font-size: 14px; margin-bottom: 24px;">
        <strong>EVENT:</strong> Institutional request for the flagship behavioral signals report.<br/><br/>
        <strong>INTERPRETATION:</strong> This institutional release represents the 2026 global baseline for leadership system responsiveness across 10 regions and 5 core dimensions.
      </p>

      <div style="text-align: center;">
        <a href="${downloadUrl}" style="${buttonStyles}">Download Full Report</a>
      </div>
      
      <p style="font-size: 12px; color: #64748b; margin-top: 20px; font-weight: bold;">
        Drawn from over 20,000 simulated environments and 100,000+ leadership data points.
      </p>
    `);
  },

  /**
   * 3. Institutional Onboarding Email (Team Creator)
   */
  teamOnboarding: (data) => {
    const manageUrl = generateAppLink('/observatory', { team: data.teamCode });
    return wrap(`
      <p style="font-weight: bold; font-size: 18px; margin-bottom: 20px;">Your Measurement Cycle Has Been Initiated</p>
      
      <p style="color: #475569; font-size: 14px; margin-bottom: 24px;">
        <strong>EVENT:</strong> A new leadership system measurement cycle has been initialized for <strong>${data.organization}</strong>.<br/><br/>
        <strong>INTERPRETATION:</strong> You are now authorized to collect and synthesize behavioral signals from your team. Each participant contributes a unique signal; patterns emerge only when these signals converge.
      </p>

      <div style="background-color: #ffffff; padding: 20px; border-radius: 4px; border: 1px dashed #cbd5e1; margin: 20px 0; text-align: center;">
        <span style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 5px;">Team Access Code</span>
        <span style="font-size: 32px; font-weight: 900; letter-spacing: 0.1em; color: #0f172a;">${data.teamCode}</span>
      </div>

      <div style="text-align: center;">
        <a href="${manageUrl}" style="${buttonStyles}">Manage Measurement Cycle</a>
      </div>
    `);
  }
};const INTERNAL = {
  salesAlert: (data) => {
    const typeLabel = data.event_type === 'diagnostic_start' ? 'NEW LEAD' : 'DIAGNOSTIC COMPLETED';
    return wrap(`
      <h2 style="font-size: 16px; border-left: 4px solid #0f172a; padding-left: 12px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">${typeLabel}</h2>
      <p style="font-size: 14px; margin-bottom: 20px;">A high-intent event has been recorded from the Leadership Adaptiveness Diagnostic.</p>
      
      <div style="background-color: #ffffff; padding: 20px; border-radius: 4px; border: 1px solid #e2e8f0;">
        <p><strong>Name:</strong> ${data.name || 'N/A'}</p>
        <p><strong>Email:</strong> ${data.email || 'N/A'}</p>
        <p><strong>Organization:</strong> ${data.organization || data.organization_name || 'N/A'}</p>
        <p><strong>Role:</strong> ${data.role_level || 'N/A'}</p>
        <p><strong>Industry:</strong> ${data.industry || 'N/A'}</p>
        ${data.report_link ? `<p><strong>Report:</strong> <a href="${data.report_link}" style="color: #0f172a;">View Profile</a></p>` : ''}
      </div>

      <p style="font-size: 11px; color: #64748b; margin-top: 20px; font-style: italic;">Signals classified as SALES high-intent lead context.</p>
    `);
  },
  
  opsAlert: (data) => {
    const isCritical = ['failed_at_send', 'resend_abuse', 'provider_restrictions'].includes(data.status);
    const borderColor = isCritical ? '#dc2626' : '#f59e0b';
    const textColor = isCritical ? '#991b1b' : '#92400e';
    const bgColor = isCritical ? '#fef2f2' : '#fffbeb';
    
    return wrap(`
      <h2 style="font-size: 16px; color: ${borderColor}; text-transform: uppercase; letter-spacing: 0.1em;">[EMAIL OPS] ${data.event_type.replace(/_/g, ' ').toUpperCase()}</h2>
      <p style="background-color: ${bgColor}; border: 1px solid ${borderColor}; padding: 12px; color: ${textColor}; font-weight: bold;">
        Internal Signal: ${data.status.toUpperCase()}<br/>
        Type: ${data.event_type}
      </p>
      
      <div style="margin: 20px 0; font-size: 13px;">
        <p><strong>Recipient:</strong> ${data.recipient || 'N/A'}</p>
        <p><strong>Report ID:</strong> ${data.report_id || 'N/A'}</p>
        <p><strong>Error:</strong> ${data.error_message || 'N/A'}</p>
        ${data.generated_link ? `<p><strong>Access Link:</strong> <a href="${data.generated_link}" style="color: #0f172a;">${data.generated_link}</a></p>` : ''}
      </div>

      <p style="font-size: 11px; color: #64748b; margin-top: 20px;">
        Trace ID: ${data.provider_message_id || 'N/A'}<br/>
        Timestamp: ${new Date().toISOString()}
      </p>
      <p style="font-size: 11px; color: #94a3b8; font-style: italic;">Classified as TECH operational signal. Logs remain the source of truth.</p>
    `);
  }
};

module.exports = { ESSENTIAL, INTERNAL };
