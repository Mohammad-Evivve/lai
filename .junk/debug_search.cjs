const { supabase } = require('./netlify/functions/lib/supabase.cjs');

async function debug() {
  console.log('--- Debugging \"Western\" Search Hits ---');
  
  const { data: orgs, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .or('name.ilike.%PG Miners%,name.ilike.%Netflix%');

  if (orgError) {
    console.error('Org Fetch Error:', orgError);
  } else {
    console.log('Organizations Found:');
    orgs.forEach(o => console.log(` - ID: ${o.id}, Name: "${o.name}", Region: "${o.region}", Industry: "${o.industry}"`));
  }

  const { data: results, error: resError } = await supabase
    .from('diagnostic_results')
    .select('*')
    .or('organization_name.ilike.%PG Miners%,organization_name.ilike.%Netflix%');

  if (resError) {
    console.error('Results Fetch Error:', resError);
  } else {
    console.log('\nDiagnostic Results (Signals) Found:');
    results.forEach(r => {
      console.log(` - Org: "${r.organization_name}", Region: "${r.region}", Industry: "${r.industry}", Source: "${r.source_type}"`);
      if (JSON.stringify(r).toLowerCase().includes('western')) {
        console.log('   >>> MATCH FOUND IN THIS RECORD! <<<');
      }
    });
  }
}

debug();
