const { supabase } = require('./netlify/functions/lib/supabase.cjs');

/**
 * Update 4: Adaptiveness Gap Detector - Test Case
 * 
 * Target: Microsoft
 * Condition 1: Triangulated (Sovereign + Behavioral + Perceptual data)
 * Condition 2: Strategic Dissonance (Perception > 1.15 * Behavioral)
 */

async function seedMicrosoftGap() {
  console.log('--- Seeding Microsoft Adaptiveness Gap Test Case ---');

  const microsoftName = 'Microsoft';

  // 1. Clear existing diagnostic results for Microsoft to have a clean test
  const { error: deleteError } = await supabase
    .from('diagnostic_results')
    .delete()
    .eq('organization_name', microsoftName);

  if (deleteError) {
    console.error('Error clearing data:', deleteError.message);
    return;
  }

  const testRecords = [
    // Sovereign (Tier 0) - Weight 1.2x
    {
      organization_name: microsoftName,
      source_type: 'PROPRIETARY',
      overall_score: 80,
      signal_interpretation_score: 82,
      cognitive_framing_score: 80,
      resource_reallocation_score: 78,
      decision_alignment_score: 85,
      execution_responsiveness_score: 75,
      is_published: true,
      session_date: new Date().toISOString(),
      duration_seconds: 1800,
      metadata: { source: 'Sovereign Research' }
    },
    // Behavioral (Tier 1) - Weight 1.0x (THE LOW SCORE)
    {
      organization_name: microsoftName,
      source_type: 'BEHAVIORAL',
      overall_score: 55,
      signal_interpretation_score: 58,
      cognitive_framing_score: 55,
      resource_reallocation_score: 50,
      decision_alignment_score: 60,
      execution_responsiveness_score: 52,
      is_published: true,
      session_date: new Date().toISOString(),
      duration_seconds: 1800,
      metadata: { source: 'Evivve Simulation' }
    },
    // Perceptual (Tier 2) - Weight 0.8x (THE HIGH SCORE)
    // 85 / 55 = 1.54 (> 1.15) -> Should trigger Dissonance
    {
      organization_name: microsoftName,
      source_type: 'PERCEPTION',
      overall_score: 85,
      signal_interpretation_score: 88,
      cognitive_framing_score: 85,
      resource_reallocation_score: 82,
      decision_alignment_score: 90,
      execution_responsiveness_score: 80,
      is_published: true,
      session_date: new Date().toISOString(),
      duration_seconds: 1800,
      metadata: { source: 'Leadership Self-Assessment' }
    }
  ];

  const { data, error } = await supabase
    .from('diagnostic_results')
    .insert(testRecords)
    .select();

  if (error) {
    console.error('Error seeding data:', error.message);
  } else {
    console.log('✅ Successfully seeded 3 records for Microsoft.');
    console.log('Expected: TRIANGULATED: true, ADAPTIVENESS GAP: true');
  }
}

seedMicrosoftGap();
