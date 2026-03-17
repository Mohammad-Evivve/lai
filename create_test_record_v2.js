const http = require('http');

const data = JSON.stringify({
  name: "Verification Lead",
  email: "verify@lai.institute",
  organization_name: "LAI Internal",
  overall_score: 75,
  signal_detection_score: 80,
  cognitive_framing_score: 70,
  decision_alignment_score: 65,
  resource_calibration_score: 60,
  integrated_responsiveness_score: 75,
  participation_mode: "individual"
});

const options = {
  hostname: 'localhost',
  port: 8889,
  path: '/api/diagnostic',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (d) => { body += d; });
  res.on('end', () => {
    console.log(body);
  });
});

req.on('error', (e) => {
  console.error('SERVER ERROR:', e.message);
});

req.write(data);
req.end();
