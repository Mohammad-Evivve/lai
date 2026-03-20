// supabase/functions/gap-engine/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    const { participant_id } = await req.json();

    if (!participant_id) {
      return new Response(JSON.stringify({ error: 'Missing participant_id' }), { status: 400 });
    }

    console.log(`[Gap Engine] Calculating dissonance for participant: ${participant_id}`);

    // ==========================================
    // LAYER 8: GAP CALCULATION
    // ==========================================

    // 1. Fetch all active dimension scores for this participant
    const { data: allScores, error: allScoresError } = await supabase
      .from('lai_dimension_scores')
      .select('*')
      .eq('entity_ref_id', participant_id)
      .eq('entity_level', 'participant');

    if (allScoresError) throw allScoresError;
    
    if (!allScores || allScores.length === 0) {
        return new Response(JSON.stringify({ status: 'no_scores_to_compare' }), { status: 200 });
    }

    // Organize scores by dimension and tier
    const scoresByDimension: Record<string, any> = {};
    allScores.forEach(score => {
      if (!scoresByDimension[score.dimension]) {
        scoresByDimension[score.dimension] = {};
      }
      scoresByDimension[score.dimension][score.source_tier] = score;
    });

    const gapRecords = [];

    // 2. Calculate Perceptive Gaps (T3 vs Max(T1, T2))
    for (const [dimension, tiers] of Object.entries(scoresByDimension)) {
      const t3Score = tiers['T3'];
      
      // Find the highest confidence behavioral score (T1-Physical > T1-Virtual > T2)
      // Note: In our current data model, T2 is the primary behavior source.
      let behavioralScore = tiers['T1-Physical'] || tiers['T1-Virtual'] || tiers['T2'];

      // Only calculate if BOTH a perceptive and a behavioral score exist
      if (t3Score && behavioralScore) {
        const gapValue = Number(t3Score.score_0_100) - Number(behavioralScore.score_0_100);

        gapRecords.push({
          gap_type: 'perceptive',
          subject_entity_level: 'participant',
          subject_entity_ref_id: participant_id,
          comparison_entity_level: 'participant',
          comparison_entity_ref_id: participant_id,
          dimension: dimension,
          subject_score: t3Score.score_0_100,
          comparison_score: behavioralScore.score_0_100,
          gap_value: gapValue.toFixed(2),
          confidence: Math.min(t3Score.confidence, behavioralScore.confidence), // Use lowest confidence of the pair
          window_start: new Date().toISOString(),
          window_end: new Date().toISOString(),
          gap_version: 'v1.0.0-gap-alpha'
        });
      }
    }

    // 3. Write Layer 8 Gap Records
    if (gapRecords.length > 0) {
      const { error: gapError } = await supabase
        .from('gap_records')
        .insert(gapRecords);

      if (gapError) throw gapError;
      console.log(`[Gap Engine] Inserted ${gapRecords.length} gap records.`);
    } else {
        console.log(`[Gap Engine] No overlapping dimensions found for comparison.`);
    }

    return new Response(JSON.stringify({ 
      status: 'gaps_calculated', 
      records_created: gapRecords.length 
    }), { headers: { 'Content-Type': 'application/json' }, status: 200 });

  } catch (err) {
    console.error('[GAP ENGINE ERROR]:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
