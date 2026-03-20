// supabase/functions/lai-evaluator/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Define Confidence Floors based on Source Tier
const CONFIDENCE_FLOORS: Record<string, number> = {
  'T1-Physical': 0.9,
  'T1-Virtual': 0.8,
  'T2': 0.7,
  'T3': 0.5
};

// Map AFERR Stages to LAI Dimensions
const DIMENSION_MAP: Record<string, string> = {
  'Activation': 'Signal Detection',
  'Forecasting': 'Cognitive Framing',
  'Experimentation': 'Decision Alignment',
  'Realization': 'Resource Calibration',
  'Reflection': 'Integrated Responsiveness'
};

serve(async (req) => {
  try {
    const { participant_id, session_id, source_tier } = await req.json();

    if (!participant_id || !session_id || !source_tier) {
      return new Response(JSON.stringify({ error: 'Missing required payload fields' }), { status: 400 });
    }

    console.log(`[LAI Evaluator] Processing participant: ${participant_id} | Session: ${session_id}`);

    // ==========================================
    // LAYER 6: LAI DIMENSION MAPPING
    // ==========================================

    // 1. Fetch newly generated AFERR signals for this session
    const { data: aferrSignals, error: fetchError } = await supabase
      .from('aferr_signals')
      .select('*')
      .eq('participant_id', participant_id)
      .eq('session_id', session_id);

    if (fetchError) throw fetchError;
    if (!aferrSignals || aferrSignals.length === 0) {
      return new Response(JSON.stringify({ status: 'no_signals_to_evaluate' }), { status: 200 });
    }

    // 2. Translate AFERR (0-10) to LAI Dimension Scores (0-100)
    const dimensionScores = aferrSignals.map(signal => {
      const dimensionName = DIMENSION_MAP[signal.aferr_stage];
      if (!dimensionName) return null;

      return {
        entity_level: 'participant',
        entity_ref_id: participant_id,
        source_tier: source_tier,
        dimension: dimensionName,
        score_0_100: signal.signal_strength * 10, // Scale to 100
        confidence: CONFIDENCE_FLOORS[source_tier] || 0.5,
        window_start: signal.window_start,
        window_end: signal.window_end,
        scoring_version: 'v1.0.0-lai-eval'
      };
    }).filter(Boolean);

    // 3. Insert Layer 6 Dimension Scores
    if (dimensionScores.length > 0) {
      const { error: dimError } = await supabase
        .from('lai_dimension_scores')
        .insert(dimensionScores);
      if (dimError) throw dimError;
    }

    // ==========================================
    // LAYER 7: WWA SCORING ENGINE
    // ==========================================

    // 4. Fetch all active dimension scores for this participant to compute WWA
    const { data: allScores, error: allScoresError } = await supabase
      .from('lai_dimension_scores')
      .select('*')
      .eq('entity_ref_id', participant_id)
      .eq('entity_level', 'participant');

    if (allScoresError) throw allScoresError;

    // 5. Compute the WWA Composite Score
    let totalWeightedScore = 0;
    let totalConfidenceWeight = 0;
    const sourceBreakdown: Record<string, number> = {};
    const dimensionBreakdown: Record<string, number> = {};

    allScores.forEach(scoreRecord => {
      const weight = scoreRecord.confidence;
      const score = Number(scoreRecord.score_0_100);
      
      // Accumulate for overall WWA
      totalWeightedScore += (score * weight);
      totalConfidenceWeight += weight;

      // Track breakdowns for transparency
      sourceBreakdown[scoreRecord.source_tier] = score; 
      dimensionBreakdown[scoreRecord.dimension] = score; 
    });

    const overallScore = totalConfidenceWeight > 0 
      ? (totalWeightedScore / totalConfidenceWeight).toFixed(2) 
      : 0;

    // 6. Write final composite to Layer 7 (entity_scores)
    const { error: entityError } = await supabase
      .from('entity_scores')
      .insert({
        entity_level: 'participant',
        entity_ref_id: participant_id,
        overall_score: overallScore,
        combined_confidence: (totalConfidenceWeight / allScores.length).toFixed(2), // Avg confidence
        source_breakdown: sourceBreakdown,
        dimension_breakdown: dimensionBreakdown,
        window_start: new Date().toISOString(),
        window_end: new Date().toISOString(),
        scoring_version: 'v1.0.0-lai-eval'
      });

    if (entityError) throw entityError;

    // TRIGGER LAYER 8 GAP ENGINE (Asynchronous)
    if (Number(overallScore) > 0) {
      // Fire and forget
      fetch(`${supabaseUrl}/functions/v1/gap-engine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ participant_id: participant_id })
      }).catch(err => console.error('[LAI EVALUATOR] Failed to trigger gap engine:', err));
    }

    return new Response(JSON.stringify({ 
      status: 'evaluated', 
      overall_score: overallScore 
    }), { headers: { 'Content-Type': 'application/json' }, status: 200 });

  } catch (err) {
    console.error('[LAI EVALUATOR ERROR]:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
