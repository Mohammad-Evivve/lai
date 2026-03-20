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
    return wrap(`
      <p style="font-weight: bold; font-size: 18px; margin-bottom: 20px;">Your Leadership Adaptiveness Profile is Ready</p>
      
      <p style="color: #475569; font-size: 14px; margin-bottom: 24px;">
        <strong>EVENT:</strong> Your responses have been processed within the LAI behavioral framework.<br/><br/>
        <strong>INTERPRETATION:</strong> This profile reflects how you perceive your leadership system’s adaptiveness. It does not yet measure how your system behaves under pressure (Team Diagnostic required for full behavioral synthesis).
      </p>

      <div style="text-align: center;">
        <a href="${reportUrl}" style="${buttonStyles}">View Your Profile</a>
      </div>
      
      <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">
        Secure Access ID: ${data.reportId}
      </p>
    `);
  },

  /**
   * 2. State of Cognition Report Email
   */
  socReportDelivery: (data) => {
    const downloadUrl = generateAppLink('/assets/State_of_Cognition_2026_Institutional.pdf'); // Placeholder
    return wrap(`
      <p style="font-weight: bold; font-size: 18px; margin-bottom: 20px;">Requested Research: The State of Cognition 2026</p>
      
      <p style="color: #475569; font-size: 14px; margin-bottom: 24px;">
        <strong>EVENT:</strong> Institutional request for the flagship behavioral signals report.<br/><br/>
        <strong>INTERPRETATION:</strong> This report represents the 2026 global baseline for leadership system responsiveness across 10 regions and 5 core dimensions.
      </p>

      <div style="text-align: center;">
        <a href="${downloadUrl}" style="${buttonStyles}">Download Full Report</a>
      </div>
      
      <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
        Evidence count: 100,000+ Behavioral Points
      </p>
    `);
  },

  /**
   * 3. Institutional Onboarding Email (Team Creator)
   */
  teamOnboarding: (data) => {
    const manageUrl = generateAppLink('/observatory', { team: data.teamCode });
    return wrap(`
      <p style="font-weight: bold; font-size: 18px; margin-bottom: 20px;">Institutional Onboarding: Team Measurement Cycle Initiated</p>
      
      <p style="color: #475569; font-size: 14px; margin-bottom: 24px;">
        <strong>EVENT:</strong> A new leadership system measurement cycle has been initialized for <strong>${data.organization}</strong>.<br/><br/>
        <strong>INTERPRETATION:</strong> You are now authorized to collect and synthesize behavioral signals from your team. This will reveal the 'Divergent Dimensions' between intent and execution.
      </p>

      <div style="background-color: #ffffff; padding: 20px; border-radius: 4px; border: 1px dashed #cbd5e1; margin: 20px 0; text-align: center;">
        <span style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 5px;">Your Team Access Code</span>
        <span style="font-size: 32px; font-weight: 900; letter-spacing: 0.1em; color: #0f172a;">${data.teamCode}</span>
      </div>

      <div style="text-align: center;">
        <a href="${manageUrl}" style="${buttonStyles}">Manage Team Measurement</a>
      </div>
    `);
  }
};

const INTERNAL = {
  diagnosticCompleted: (data) => wrap(`
    <h2 style="font-size: 16px; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em;">Internal Alert: Diagnostic Completed</h2>
    <p><strong>Name:</strong> ${data.name || 'N/A'}</p>
    <p><strong>Email:</strong> ${data.email || 'N/A'}</p>
    <p><strong>Organization:</strong> ${data.organization_name || 'N/A'}</p>
    <p><strong>Report:</strong> <a href="${data.report_link}" style="color: #0f172a;">${data.report_link}</a></p>
  `)
};

module.exports = { ESSENTIAL, INTERNAL };
