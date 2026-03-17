const { supabase } = require('./netlify/functions/lib/supabase.cjs');

async function auditRegions() {
  console.log('Auditing regions in diagnostic_results...');
  const { data, error } = await supabase
    .from('diagnostic_results')
    .select('region')
    .limit(1000);

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  const regionCounts = {};
  data.forEach(r => {
    const reg = r.region || 'NULL/EMPTY';
    regionCounts[reg] = (regionCounts[reg] || 0) + 1;
  });

  console.log('Region Distribution:', JSON.stringify(regionCounts, null, 2));
}

auditRegions();
