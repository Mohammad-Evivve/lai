const { supabase } = require('./netlify/functions/lib/supabase.cjs');

async function check() {
  console.log('--- Auditing Column Names ---');
  const { data, error } = await supabase
    .from('diagnostic_results')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Error:', error.message);
  } else if (data && data.length > 0) {
    console.log('Columns found:', Object.keys(data[0]).join(', '));
  } else {
    console.log('No data found to audit columns.');
  }
}

check();
