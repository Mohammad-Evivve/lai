import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    const { participant_id, session_id } = await req.json();

    if (!participant_id) {
      return new Response(JSON.stringify({ error: 'Missing participant_id' }), { status: 400 });
    }

    console.log(`[AFERR Engine] Interpreting session: ${session_id} for participant: ${participant_id}`);

    // 1. Fetch all feature vectors for this session
    const { data: features, error: fError } = await supabase
      .from('behavioral_feature_vectors')
      .select('*')
      .eq('participant_id', participant_id)
      .eq('session_id', session_id);

    if (fError) throw fError;
    if (!features || features.length === 0) {
      return new Response(JSON.stringify({ status: 'no_features' }), { status: 200 });
    }

    // 2. Fetch AFERR Profile for longitudinal rules (Reflection)
    const { data: profile } = await supabase
      .from('aferr_profiles')
      .select('*')
      .eq('participant_id', participant_id)
      .single();

    const cycleCount = profile ? profile.cycle_count : 1;

    // 3. SECURE SOURCE TIER: Fetch from session_metadata
    const { data: session } = await supabase
      .from('session_metadata')
      .select('source_tier')
      .eq('session_id', session_id)
      .single();
    
    const sourceTier = session ? session.source_tier : 'T3'; // Default to T3 if metadata missing

    // 4. Process each stage
    const signals = [];
    const sourceFeatureIds = features.map(f => f.id);

    // --- ACTIVATION ---
    const latency = features.find(f => f.feature_name === 'response_latency');
    if (latency) {
      const { strength, direction, confidence } = evaluateActivation(latency.feature_value);
      signals.push({
        participant_id,
        session_id,
        aferr_stage: 'Activation',
        signal_strength: strength,
        signal_direction: direction,
        confidence,
        source_feature_ids: sourceFeatureIds,
        window_start: latency.created_at,
        window_end: latency.created_at
      });
    }

    // --- FORECASTING ---
    const variety = features.find(f => f.feature_name === 'action_variety');
    if (variety) {
      const { strength, direction, confidence } = evaluateForecasting(variety.feature_value);
      signals.push({
        participant_id,
        session_id,
        aferr_stage: 'Forecasting',
        signal_strength: strength,
        signal_direction: direction,
        confidence,
        source_feature_ids: sourceFeatureIds,
        window_start: variety.created_at,
        window_end: variety.created_at
      });
    }

    // --- EXPERIMENTATION ---
    const depth = features.find(f => f.feature_name === 'exploration_depth');
    if (depth) {
      const { strength, direction, confidence } = evaluateExperimentation(depth.feature_value);
      signals.push({
        participant_id,
        session_id,
        aferr_stage: 'Experimentation',
        signal_strength: strength,
        signal_direction: direction,
        confidence,
        source_feature_ids: sourceFeatureIds,
        window_start: depth.created_at,
        window_end: depth.created_at
      });
    }

    // --- REALIZATION ---
    const velocity = features.find(f => f.feature_name === 'calibration_velocity');
    if (velocity) {
      const { strength, direction, confidence } = evaluateRealization(velocity.feature_value);
      signals.push({
        participant_id,
        session_id,
        aferr_stage: 'Realization',
        signal_strength: strength,
        signal_direction: direction,
        confidence,
        source_feature_ids: sourceFeatureIds,
        window_start: velocity.created_at,
        window_end: velocity.created_at
      });
    }

    // --- REFLECTION (Longitudinal Rule) ---
    if (cycleCount > 1) {
      signals.push({
        participant_id,
        session_id,
        aferr_stage: 'Reflection',
        signal_strength: 7.0, 
        signal_direction: 1,
        confidence: 0.9,
        source_feature_ids: sourceFeatureIds,
        window_start: new Date().toISOString(),
        window_end: new Date().toISOString()
      });
    }

    // 5. Batch insert signals
    if (signals.length > 0) {
      const { error: sError } = await supabase
        .from('aferr_signals')
        .insert(signals);
      if (sError) throw sError;
      
      console.log(`[AFERR Engine] Successfully generated ${signals.length} signals.`);

      // 6. CHAIN TRIGGER: Activate LAI Evaluator (Layer 6 & 7)
      triggerLaiEvaluator(participant_id, session_id, sourceTier);
    }

    // 7. Update Profile
    await updateAferrProfile(participant_id, cycleCount);

    return new Response(JSON.stringify({ status: 'interpreted', signals: signals.length }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[AFERR ERROR]:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});

/**
 * Asynchronously triggers the LAI Evaluation worker (Layers 6/7).
 */
async function triggerLaiEvaluator(participant_id: string, session_id: string, source_tier: string) {
  try {
    const url = `${supabaseUrl}/functions/v1/lai-evaluator`;
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ participant_id, session_id, source_tier })
    });
    console.log(`[L5 -> L6 Chain] Triggered LAI Evaluator for ${participant_id}`);
  } catch (err) {
    console.error('[L5 -> L6 CHAIN ERROR]:', err);
  }
}

// --- HELPER EVALUATION GATES ---

function evaluateActivation(value: number) {
  if (value < 500) return { strength: 9.0, direction: 1, confidence: 0.9 };
  if (value < 2000) return { strength: 6.0, direction: 1, confidence: 0.8 };
  return { strength: 3.0, direction: -1, confidence: 0.7 };
}

function evaluateForecasting(value: number) {
  if (value > 3) return { strength: 8.0, direction: 1, confidence: 0.85 };
  return { strength: 4.0, direction: 0, confidence: 0.7 };
}

function evaluateExperimentation(value: number) {
  if (value > 5) return { strength: 9.0, direction: 1, confidence: 0.8 };
  return { strength: 2.0, direction: -1, confidence: 0.6 };
}

function evaluateRealization(value: number) {
  if (value < 30000) return { strength: 8.5, direction: 1, confidence: 0.8 }; 
  return { strength: 3.0, direction: -1, confidence: 0.7 };
}

async function updateAferrProfile(participant_id: string, currentCycle: number) {
  await supabase
    .from('aferr_profiles')
    .upsert({
      participant_id,
      cycle_count: currentCycle + 1,
      snapshot_date: new Date().toISOString().split('T')[0]
    }, { onConflict: 'participant_id' });
}
