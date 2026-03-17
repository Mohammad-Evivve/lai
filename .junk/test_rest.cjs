const https = require('https');
require('dotenv').config();

const url = new URL(process.env.SUPABASE_URL + '/rest/v1/diagnostic_results?limit=1');
const options = {
  headers: {
    'apikey': process.env.SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
  }
};

console.log(`Checking REST access to: ${url.href}`);

https.get(url, options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response Header Content-Type:', res.headers['content-type']);
    console.log('Body:', data);
  });
}).on('error', err => console.error('REST Error:', err.message));
