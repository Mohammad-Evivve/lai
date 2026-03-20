const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkSchema() {
  const { data, error } = await supabase.from('participants').select('*').limit(1);
  if (error) {
    console.error("Error:", error.message);
  } else {
    const cols = Object.keys(data[0] || {});
    console.log("PARTICIPANTS_COLUMNS=" + cols.join(','));
  }
}

checkSchema();
