require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase configuration missing!');
  console.error('Ensure SUPABASE_URL and SUPABASE_KEY (service_role) are set in Netlify Environment Variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
