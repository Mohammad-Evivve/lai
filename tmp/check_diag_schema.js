const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkDiagSchema() {
  const { data, error } = await supabase.from('diagnostic_results').select('*').limit(1);
  if (error) {
    console.error("Error:", error.message);
  } else {
    const cols = Object.keys(data[0] || {});
    console.log("DIAGNOSTIC_RESULTS_COLUMNS=" + cols.join(','));
  }
}

checkDiagSchema();
