const baseStyles = "font-family: sans-serif; line-height: 1.6; color: #0f172a;";
const wrap = (content) => `<div style="${baseStyles}">${content}</div>`;

const INTERNAL = {
  diagnosticCompleted: (data) => wrap(`
    <h2>Diagnostic Completed</h2>
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Report:</strong> <a href="${data.report_link}">${data.report_link}</a></p>
  `)
};

module.exports = { INTERNAL };
