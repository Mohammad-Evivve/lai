const { supabase } = require('./netlify/functions/lib/supabase.cjs');

async function check() {
  const { data, error } = await supabase
    .from('diagnostic_results')
    .select('*')
    .or('organization_name.ilike.%PG Miners%,organization_name.ilike.%Netflix%');

  if (error) {
    console.error(error);
    return;
  }

  data.forEach(r => {
    console.log(`--- Record for ${r.organization_name} ---`);
    Object.entries(r).forEach(([key, val]) => {
      const s = String(val).toLowerCase();
      if (s.includes('western')) {
        console.log(`  MATCH in ${key}: "${val}"`);
      }
    });
  });
}

check();
