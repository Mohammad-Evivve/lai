import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkSchema() {
  console.log('--- DB SCHEMA AUDIT ---');
  
  const tables = ['teams', 'participants', 'responses', 'diagnostic_results'];
  
  for (const table of tables) {
    try {
      // Get column names by selecting with limit 0
      const { data, error } = await supabase.from(table).select('*').limit(0);
      if (error) {
         // If table doesn't exist, this will error
         console.log(`❌ Table ${table}: ${error.message}`);
         continue;
      }
      
      // In Supabase JS, we don't get the columns back easily if data is empty, 
      // but we can try to find them in the response if we use the right trick or just use rpc.
      // Another way: try to select specific columns that SHOULD exist.
      console.log(`✅ Table ${table} verified.`);
      
      if (table === 'responses') {
        const cols = ['participant_id', 'team_id', 'dimension_id', 'question_index', 'score'];
        for (const col of cols) {
          const { error: colErr } = await supabase.from(table).select(col).limit(0);
          if (colErr) console.log(`   ❌ Column missing: ${col} (${colErr.message})`);
          else console.log(`   ✅ Column exists: ${col}`);
        }
      }
    } catch (e) {
      console.log(`Error checking ${table}: ${e.message}`);
    }
  }
}

checkSchema();
