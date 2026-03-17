const { supabase } = require('./netlify/functions/lib/supabase.cjs');

async function check() {
  console.log('--- Database Table Audit ---');
  
  const tables = ['organizations', 'diagnostic_results', 'signal_logs', 'scraper_logs', 'research_resources'];
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(0);
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: Exists`);
    }
  }
}

check();
