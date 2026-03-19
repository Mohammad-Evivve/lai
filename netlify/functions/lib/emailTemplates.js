/**
 * Email Templates for LAI System (CJS for Netlify)
 */

const baseStyles = `
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #0f172a;
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const headerStyles = `
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 20px;
  margin-bottom: 30px;
`;

const buttonStyles = `
  display: inline-block;
  padding: 12px 24px;
  background-color: #2dd4bf;
  color: #0f172a;
  text-decoration: none;
  font-weight: bold;
  border-radius: 6px;
  margin: 20px 0;
`;

const footerStyles = `
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const wrap = (content) => `
  <div style="${baseStyles}">
    <div style="${headerStyles}">
      <span style="font-weight: 900; letter-spacing: -0.05em; font-size: 20px;">LAI</span>
    </div>
    ${content}
    <div style="${footerStyles}">
      Leadership Adaptiveness Institute &copy; 2026<br/>
      Sent from the LAI Intelligence Layer
    </div>
  </div>
`;

export const INTERNAL = {
  diagnosticCompleted: (data) => wrap(`
    <h2 style="font-size: 18px; color: #64748b; text-transform: uppercase;">Internal Alert: Diagnostic Completed</h2>
    <p><strong>Name:</strong> ${data.name || 'N/A'}</p>
    <p><strong>Email:</strong> ${data.email || 'N/A'}</p>
    <p><strong>Organization:</strong> ${data.organization_name || 'N/A'}</p>
    <p><strong>Report Link:</strong> <a href="${data.report_link}">${data.report_link}</a></p>
  `),
  teamInvitation: (data) => wrap(`
    <h2 style="font-family: serif; font-size: 24px;">Your leadership system is measuring its adaptiveness</h2>
    <p>Dear Colleague,</p>
    <p><strong>${data.inviter || 'A member of your leadership team'}</strong> has invited you to contribute to the **${data.organization || 'your organization'}** Adaptiveness Profile.</p>
    <div style="text-align: center;">
      <a href="https://adaptiveness.institute/diagnostic?team=${data.team_code}" style="${buttonStyles}">Join Measurement Cycle</a>
    </div>
  `)
};

export const TEAM_INVITATION = (data) => INTERNAL.teamInvitation(data);
