const { supabase } = require('./netlify/functions/lib/supabase.cjs');

async function debugMicrosoft() {
    const [resultsRes, orgsRes] = await Promise.all([
      supabase.from('diagnostic_results').select('*'),
      supabase.from('organizations').select('id, name, is_verified, domain, headquarters')
    ]);

    const allSignals = resultsRes.data || [];
    const verifiedOrgs = orgsRes.data || [];
    
    const normalizedVerifiedOrgs = [];
    const nameToCanonicalId = new Map();
    const idToCanonicalIdMap = new Map();
    
    for (const org of verifiedOrgs) {
      if (!org.name) continue;
      const normName = org.name.trim().toLowerCase();
      if (!nameToCanonicalId.has(normName)) {
        nameToCanonicalId.set(normName, org.id);
        normalizedVerifiedOrgs.push(org);
        idToCanonicalIdMap.set(org.id, org.id);
      } else {
        idToCanonicalIdMap.set(org.id, nameToCanonicalId.get(normName));
      }
    }

    const orgMetadataMap = new Map(normalizedVerifiedOrgs.map(o => [o.id, o]));
    const orgByNameMap = new Map(normalizedVerifiedOrgs.map(o => [o.name.trim().toLowerCase(), o]));
    const entityGroups = new Map();
    
    const blacklist = ['Karen', 'Powerpuff Girls', 'Test', 'gew', 'nrwe', 'test'];
    const filteredSignals = allSignals.filter(row => {
      const name = row.organization_name?.toLowerCase() || '';
      return !blacklist.some(b => name === b.toLowerCase());
    });

    for (const s of filteredSignals) {
      let key = s.verified_entity_id ? idToCanonicalIdMap.get(s.verified_entity_id) : null;
      if (!key && s.organization_name) {
        const normName = s.organization_name.trim().toLowerCase();
        key = nameToCanonicalId.get(normName) || normName;
      }
      if (!key) key = 'unknown';
      if (!entityGroups.has(key)) entityGroups.set(key, []);
      entityGroups.get(key).push(s);
    }

    // Check Microsoft specifically
    const msPort = verifiedOrgs.find(o => o.name === 'Microsoft');
    const msId = msPort?.id;
    const canonicalMsId = idToCanonicalIdMap.get(msId);
    
    console.log('Microsoft ID:', msId);
    console.log('Canonical MS ID:', canonicalMsId);
    
    const signals = entityGroups.get(canonicalMsId) || [];
    console.log('Signals for Microsoft:', signals.length);
    
    const breakdown = { sovereign: 0, behavioral: 0, perceptual: 0, environmental: 0 };
    const TIER_WEIGHTS = { 'SOVEREIGN': 1.2, 'BEHAVIORAL': 1.0, 'PERCEPTUAL': 0.8, 'ENVIRONMENTAL': 0.4 };
    let tierSums = { behavioral: 0, perceived: 0, count_obs: 0, count_per: 0 };
    
    for (const s of signals) {
        const rawType = (s.source_type || s.metadata?.source || 'BEHAVIORAL').toUpperCase();
        const tier =
          (rawType === 'PROPRIETARY' || rawType === 'SOVEREIGN') ? 'SOVEREIGN' :
          (rawType === 'BEHAVIORAL' || rawType === 'SIMULATION' || rawType === 'DIAGNOSTIC') ? 'BEHAVIORAL' :
          (rawType === 'PERCEPTION' || rawType === 'SELF-REPORTED' || rawType === 'SURVEY') ? 'PERCEPTUAL' :
          (rawType === 'RESEARCH' || rawType === 'INFERRED' || rawType === 'SCRAPER') ? 'ENVIRONMENTAL' : 'BEHAVIORAL';
        
        const tierKey = tier.toLowerCase();
        const tierWeight = TIER_WEIGHTS[tier] || 1.0;
        const currentScore = (s.overall_lai_score || s.overall_score || 0);
        const finalWeight = tierWeight; // simplification

        breakdown[tierKey]++;
        if (tier === 'BEHAVIORAL') {
          tierSums.behavioral += currentScore * finalWeight;
          tierSums.count_obs += finalWeight;
        } else if (tier === 'PERCEPTUAL') {
          tierSums.perceived += currentScore * finalWeight;
          tierSums.count_per += finalWeight;
        }
        console.log(`- Signal: ${tier} | Score: ${currentScore} | Weight: ${finalWeight}`);
    }

    const avgObs = tierSums.count_obs > 0 ? tierSums.behavioral / tierSums.count_obs : 0;
    const avgPer = tierSums.count_per > 0 ? tierSums.perceived / tierSums.count_per : 0;
    const strategic_dissonance = (avgObs > 0 && avgPer > 1.15 * avgObs);
    const is_triangulated = (breakdown.sovereign || 0) > 0 && (breakdown.behavioral || 0) > 0 && (breakdown.perceptual || 0) > 0;

    console.log('--- Results ---');
    console.log('Avg Behavioral:', avgObs);
    console.log('Avg Perceived:', avgPer);
    console.log('Strategic Dissonance:', strategic_dissonance);
    console.log('Is Triangulated:', is_triangulated);
}

debugMicrosoft();
