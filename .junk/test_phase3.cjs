const { supabase } = require('./netlify/functions/lib/supabase.cjs');

async function injectTestSignals() {
  console.log('Injecting Tier 0 and Tier 2 test signals for Microsoft...');

  const orgName = 'Microsoft';
  
  // 1. Inject Sovereign (Tier 0)
  await supabase.from('diagnostic_results').insert([{
    organization_name: orgName,
    overall_lai_score: 92,
    signal_interpretation_score: 95,
    cognitive_framing_score: 90,
    resource_reallocation_score: 88,
    decision_alignment_score: 92,
    execution_responsiveness_score: 96,
    source_type: 'PROPRIETARY',
    seniority_level: 'c_suite',
    metadata: { source: 'Expert Audit', notes: 'High strategic coherence observed at board level.' }
  }]);

  // 2. Inject Perception (Tier 2) - Higher than Tier 1 to trigger Dissonance
  // Microsoft already has Tier 1 records from seeding (Simulation).
  // Let's check Tier 1 average first or just inject a very high perception score.
  await supabase.from('diagnostic_results').insert([{
    organization_name: orgName,
    overall_lai_score: 98, // Very high
    signal_interpretation_score: 99,
    cognitive_framing_score: 97,
    resource_reallocation_score: 98,
    decision_alignment_score: 96,
    execution_responsiveness_score: 100,
    source_type: 'PERCEPTION',
    seniority_level: 'vp_director',
    metadata: { source: 'Internal Survey', notes: 'Leaders feel extremely confident.' }
  }]);

  // 3. Ensure we have an "Observed" record (Tier 1) for Triangulation
  await supabase.from('diagnostic_results').insert([{
    organization_name: orgName,
    overall_lai_score: 80,
    signal_interpretation_score: 82,
    cognitive_framing_score: 78,
    resource_reallocation_score: 75,
    decision_alignment_score: 80,
    execution_responsiveness_score: 85,
    source_type: 'SIMULATION',
    seniority_level: 'middle_management',
    metadata: { source: 'Evivve Simulation' }
  }]);

  console.log('Test signals injected. Microsoft should now be TRIANGULATED and show STRATEGIC DISSONANCE.');
}

injectTestSignals();
