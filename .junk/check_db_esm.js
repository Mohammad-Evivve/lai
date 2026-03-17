import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function check() {
  console.log('--- DB SCHEMA CHECK (ESM) ---');
  
  const tables = ['teams', 'participants', 'responses', 'diagnostic_results'];
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(0);
    console.log(`${table}: ${error ? '❌ ' + error.message : '✅ Exists'}`);
  }
}

check();
