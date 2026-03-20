/**
 * Email Templates for LAI System
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

const FLOW_1 = {
  step0: (link) => wrap(`
    <h2 style="font-family: serif; font-size: 24px;">The signal from your leadership system is incomplete</h2>
    <p>You recently started the Leadership Adaptiveness Diagnostic, but the data set remains partial.</p>
    <p>Without the behavioral synthesis, your system's adaptiveness remains a series of invisible patterns.</p>
    <a href="${link}" style="${buttonStyles}">Resume Diagnostic</a>
  `),
  step1: (link) => wrap(`
    <h2 style="font-family: serif; font-size: 24px;">Most leadership patterns remain invisible from here</h2>
    <p>A partial diagnostic is a blind spot. Closing the gap requires a complete view of your system's responsiveness.</p>
    <a href="${link}" style="${buttonStyles}">Complete My Analysis</a>
  `),
  step2: (link) => wrap(`
    <h2 style="font-family: serif; font-size: 24px;">Your system view is still pending</h2>
    <p>This is the final reminder to complete your baseline adaptiveness measurement for 2026.</p>
    <a href="${link}" style="${buttonStyles}">Access Final Step</a>
  `)
};

const FLOW_2 = {
  step0: (reportId, user) => wrap(`
    <h2 style="font-family: serif; font-size: 24px;">Your leadership system is already showing signals</h2>
    <p>Dear ${user.name || 'Leader'},</p>
    <p>The diagnostic you completed for ${user.company || 'your organization'} has been processed. Your preliminary Adaptiveness Report is now ready for review.</p>
    <a href="https://lai.institute/report/perception/${reportId}" style="${buttonStyles}">View My Report</a>
  `),
  step1: (reportId) => wrap(`
    <h2 style="font-family: serif; font-size: 24px;">A pattern we’re seeing across leadership systems</h2>
    <p>Most organizations detect signals 14 months before they can reallocate resources. Is your system following the same lag?</p>
    <a href="https://lai.institute/report/perception/${reportId}" style="${buttonStyles}">Check My Velocity</a>
  `),
  step2: (reportId) => wrap(`
    <h2 style="font-family: serif; font-size: 24px;">Your system may be overestimating its adaptiveness</h2>
    <p>The gap between perceived and behavioral adaptiveness is the primary driver of strategic obsolescence.</p>
    <a href="https://lai.institute/report/perception/${reportId}" style="${buttonStyles}">Final Report Access</a>
  `)
};

const FLOW_3 = {
  step0: () => wrap(`
    <h2 style="font-family: serif; font-size: 24px;">Your leadership system is telling two different stories</h2>
    <p>The delta between your intent and your system's execution is where competitive advantage is lost.</p>
    <p>Explore how to align your system via the LAI Framework.</p>
  `),
  step1: () => wrap(`
    <h2 style="font-family: serif; font-size: 24px;">Alignment is not tested in meetings</h2>
    <p>It is tested in resource reallocation under pressure. Our latest research shows a significant variance in your sector.</p>
  `),
  step2: () => wrap(`
    <h2 style="font-family: serif; font-size: 24px;">Observe real decision patterns before your next offsite</h2>
    <p>Moving from individual insights to systemic alignment requires behavioral evidence.</p>
  `)
};

const FLOW_4 = {
  step0: (reportId) => wrap(`
    <h2 style="font-family: serif; font-size: 24px;">New signal added to your leadership system</h2>
    <p>A new diagnostic has been completed by a member of your team. The aggregate data for your organization has been updated.</p>
    <a href="https://lai.institute/report/perception/${reportId}" style="${buttonStyles}">View Updated Signals</a>
  `),
  teamUpdate: (reportId) => wrap(`
    <h2 style="font-family: serif; font-size: 24px;">New diagnostic completed matching your team</h2>
    <p>Your institutional dataset has gained a new signal. Review the updated Adaptiveness Gap for your organization.</p>
    <a href="https://lai.institute/report/perception/${reportId}" style="${buttonStyles}">View Team Update</a>
  `)
};

const INTERNAL = {
  diagnosticCompleted: (data) => wrap(`
    <h2 style="font-size: 18px; color: #64748b; text-transform: uppercase;">Internal Alert: Diagnostic Completed</h2>
    <p><strong>Name:</strong> ${data.name || 'N/A'}</p>
    <p><strong>Email:</strong> ${data.email || 'N/A'}</p>
    <p><strong>Organization:</strong> ${data.organization_name || 'N/A'}</p>
    <p><strong>Role:</strong> ${data.role_level || 'N/A'}</p>
    <p><strong>Top Dimension:</strong> ${data.top_dimension || 'N/A'}</p>
    <p><strong>Lowest Dimension:</strong> ${data.lowest_dimension || 'N/A'}</p>
    <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;"/>
    <a href="${data.report_link}" style="color: #2dd4bf; text-decoration: none; font-weight: bold;">View Full Report Analysis &rarr;</a>
  `),
  diagnosticStarted: (data) => wrap(`
    <h2 style="font-size: 18px; border-left: 4px solid #2dd4bf; padding-left: 12px; color: #0f172a; text-transform: uppercase;">New High-Intent Lead: Diagnostic Started</h2>
    <p>A user has just initiated the Leadership Adaptiveness Diagnostic.</p>
    <p><strong>Name:</strong> ${data.name || 'N/A'}</p>
    <p><strong>Email:</strong> ${data.email || 'N/A'}</p>
    <p><strong>Organization:</strong> ${data.organization || 'N/A'}</p>
    <p><strong>Role:</strong> ${data.role_level || 'N/A'}</p>
    <p><strong>Industry:</strong> ${data.industry || 'N/A'}</p>
    <p style="font-size: 12px; color: #64748b; margin-top: 20px;">Automated follow-ups (Flow 1) will trigger if they exit before completion.</p>
  `),
  demoRequested: (data) => wrap(`
    <h2 style="font-size: 18px; border-left: 4px solid #f43f5e; padding-left: 12px; color: #0f172a; text-transform: uppercase;">Direct Inquiry: Demo Requested</h2>
    <p>A user has requested a direct consultation/demo via the flagship form.</p>
    <p><strong>Name:</strong> ${data.name || 'N/A'}</p>
    <p><strong>Email:</strong> ${data.email || 'N/A'}</p>
    <p><strong>Organization:</strong> ${data.organization || 'N/A'}</p>
    <p style="margin-top: 20px;"><strong>Action Required:</strong> Please contact this lead within 24 hours.</p>
  `),
  intakeSubmitted: (data) => wrap(`
    <h2 style="font-size: 18px; color: #64748b; text-transform: uppercase;">High Intent: Offsite Intake</h2>
    <p><strong>Organization:</strong> ${data.org_name || 'N/A'}</p>
    <p><strong>Contact:</strong> ${data.contact_name || 'N/A'}</p>
    <p><strong>Status:</strong> Intake phase initiated.</p>
  `),
  teamInvitation: (data) => wrap(`
    <h2 style="font-family: serif; font-size: 24px;">Your leadership system is measuring its adaptiveness</h2>
    <p>Dear Colleague,</p>
    <p><strong>${data.inviter || 'A member of your leadership team'}</strong> has invited you to contribute to the **${data.organization || 'your organization'}** Adaptiveness Profile.</p>
    <p>Your input is critical to revealing the 'Divergent Dimensions'—the gaps between perception and action that define institutional resilience.</p>
    <div style="text-align: center;">
      <a href="https://lai.institute/diagnostic?team=${data.team_code}" style="${buttonStyles}">Join Measurement Cycle</a>
    </div>
    <p style="font-size: 12px; color: #64748b; margin-top: 20px;">Team Access Code: <strong style="color: #0f172a;">${data.team_code}</strong></p>
  `)
};

module.exports = {
  FLOW_1,
  FLOW_2,
  FLOW_3,
  FLOW_4,
  INTERNAL
};
