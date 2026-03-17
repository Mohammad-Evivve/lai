const { supabase } = require('./netlify/functions/lib/supabase.cjs');

async function check() {
  const [resultsRes, orgsRes] = await Promise.all([
    supabase.from('diagnostic_results').select('*'),
    supabase.from('organizations').select('id, name, is_verified, domain, headquarters')
  ]);

  const allSignals = resultsRes.data || [];
  const verifiedOrgs = orgsRes.data || [];
  const orgMetadataMap = new Map(verifiedOrgs.map(o => [o.id, o]));
  const orgByNameMap = new Map(verifiedOrgs.map(o => [o.name.toLowerCase(), o]));

  const entityGroups = new Map();
  for (const s of allSignals) {
    const key = s.verified_entity_id || s.organization_name;
    if (!entityGroups.has(key)) entityGroups.set(key, []);
    entityGroups.get(key).push(s);
  }
  for (const org of verifiedOrgs) {
    if (!entityGroups.has(org.id)) entityGroups.set(org.id, []);
  }

  const search = 'western';
  
  entityGroups.forEach((signals, key) => {
    const first = signals[0];
    let verifiedOrg = orgMetadataMap.get(key) || (first?.verified_entity_id ? orgMetadataMap.get(first.verified_entity_id) : null);
    if (!verifiedOrg && first?.organization_name) {
      verifiedOrg = orgByNameMap.get(first.organization_name.toLowerCase());
    }
    const orgName = verifiedOrg ? verifiedOrg.name : (first?.organization_name || 'Unknown');
    const region = first?.region || 'Global';
    
    const breakdown = { observed: 0, perceived: 0, inferred: 0 };
    for (const s of signals) {
        const rawType = (s.source_type || s.metadata?.source || 'BEHAVIORAL').toUpperCase();
        if (rawType === 'DIAGNOSTIC' || rawType === 'SELF-REPORTED') breakdown.perceived++;
        else if (rawType === 'RESEARCH' || rawType === 'INFERRED') breakdown.inferred++;
        else breakdown.observed++;
    }

    const obj = {
      organization: orgName,
      region: region,
      source_breakdown: `${breakdown.observed} Observed | ${breakdown.perceived} Perceived | ${breakdown.inferred} Inferred`
    };

    if (orgName.toLowerCase().includes(search) || region.toLowerCase().includes(search)) {
        console.log('MATCH:', orgName, '| Region:', region);
    }
  });

  console.log('--- Done ---');
}

check();
