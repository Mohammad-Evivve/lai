const { supabase } = require('./netlify/functions/lib/supabase.cjs');
async function run() {
  // Use information_schema to get column names
  const { data, error } = await supabase
    .rpc('sql', { query: `SELECT column_name FROM information_schema.columns WHERE table_name = 'diagnostic_results' ORDER BY ordinal_position;` })
    .catch(() => ({ data: null, error: { message: 'rpc not available' } }));
    
  if (!data) {
    // Fallback: just fetch one row and print keys
    const r2 = await supabase.from('diagnostic_results').select('*').limit(1).single();
    if (r2.data) {
      process.stdout.write(JSON.stringify(Object.keys(r2.data)) + '\n');
    } else {
      console.error(r2.error?.message);
    }
    return;
  }
  console.log(JSON.stringify(data));
}
run();
