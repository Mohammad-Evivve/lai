const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function check() {
  const { data, error } = await supabase.from('signal_logs').select('*').limit(1);
  if (error) {
    console.log('signal_logs error:', error.message);
  } else {
    console.log('signal_logs exists');
  }

  const { data: orgs, error: orgError } = await supabase.from('organizations').select('*').limit(1);
  if (orgError) {
    console.log('organizations error:', orgError.message);
  } else {
    console.log('organizations exists');
  }
}

check();
