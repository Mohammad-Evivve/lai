require('dotenv').config();
const https = require('https');

const url = new URL(process.env.SUPABASE_URL + '/rest/v1/diagnostic_results?select=id,organization_name,overall_score,team_id,created_at&limit=20&order=created_at.desc');
const options = {
  headers: {
    'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY,
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY}`
  }
};

https.get(url, options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
}).on('error', err => console.error(err));
