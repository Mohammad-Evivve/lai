const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env from the root .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function backfill() {
  console.log('🚀 Starting v1.3.0 Backfill: Tagging all records as BEHAVIORAL...');

  const { data, error } = await supabase
    .from('diagnostic_results')
    .update({ source_type: 'BEHAVIORAL' })
    .is('source_type', null);

  if (error) {
    console.error('❌ Backfill Error:', error.message);
  } else {
    console.log('✅ Backfill Complete: All untagged records are now marked as BEHAVIORAL.');
  }
}

backfill();
