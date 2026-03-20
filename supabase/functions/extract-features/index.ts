import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    const payload = await req.json();
    const { table, record, type } = payload;

    if (type !== 'INSERT') {
      return new Response(JSON.stringify({ message: "Ignored non-INSERT event" }), { status: 200 });
    }

    console.log(`[Layer 4 Worker] Processing INSERT from table: ${table}`);

    let featureVectors = [];

    if (table === 'raw_source_events') {
      featureVectors = extractTelemetryFeatures(record);
    } else if (table === 'diagnostic_submissions') {
      featureVectors = extractDiagnosticFeatures(record);
    } else {
      return new Response(JSON.stringify({ message: "Unsupported table" }), { status: 400 });
    }

    if (featureVectors.length > 0) {
      const { error } = await supabase
        .from('behavioral_feature_vectors')
        .insert(featureVectors);

      if (error) throw error;
      
      console.log(`[Layer 4 Worker] Successfully inserted ${featureVectors.length} features.`);

      // 4. CHAIN TRIGGER: Activate AFERR Engine (Layer 5)
      triggerAferrEngine(record.participant_id, record.session_id);
    }

    return new Response(JSON.stringify({ success: true, extracted: featureVectors.length }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("[Layer 4 Worker Error]:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});

function extractTelemetryFeatures(record: any) {
  const features = [];
  const { id: source_event_id, participant_id, session_id, event_type, payload } = record;
  const baseVector = { participant_id, session_id, source_event_id };

  switch (event_type) {
    case 'offer_accepted':
      if (payload.latency_ms) {
        features.push({ ...baseVector, feature_name: 'response_latency', feature_value: payload.latency_ms, unit: 'ms' });
      }
      if (payload.options_viewed) {
        features.push({ ...baseVector, feature_name: 'action_variety', feature_value: payload.options_viewed, unit: 'count' });
      }
      break;
    case 'choice_made':
    case 'decision_made':
      if (payload.nodes_visited) {
        features.push({ ...baseVector, feature_name: 'exploration_depth', feature_value: Array.isArray(payload.nodes_visited) ? payload.nodes_visited.length : Number(payload.nodes_visited), unit: 'count' });
      }
      break;
    case 'cycle_complete':
      if (payload.completion_time_ms) {
        features.push({ ...baseVector, feature_name: 'calibration_velocity', feature_value: payload.completion_time_ms, unit: 'ms' });
      }
      break;
    default:
      console.log(`[Extract] No math defined for event_type: ${event_type}`);
  }
  return features;
}

function extractDiagnosticFeatures(record: any) {
  const features = [];
  const { id: source_event_id, participant_id, raw_responses } = record;
  const baseVector = { participant_id, session_id: null, source_event_id };

  const mapping = {
    'self_reported_scanning_frequency': ['q1', 'q3'],
    'self_reported_belief_plasticity': ['q2', 'q5'],
    'self_reported_action_autonomy': ['q4', 'q8'],
    'self_reported_resource_candidacy': ['q6', 'q9'],
    'self_reported_system_awareness': ['q7', 'q10'],
    'self_reported_risk_tolerance': ['q2']
  };

  for (const [trait, questions] of Object.entries(mapping)) {
    let sum = 0, count = 0;
    questions.forEach(q => {
      if (raw_responses[q] !== undefined) {
        sum += Number(raw_responses[q]);
        count++;
      }
    });
    if (count > 0) {
      features.push({ ...baseVector, feature_name: trait, feature_value: sum, unit: 'likert_sum' });
    }
  }
  return features;
}

async function triggerAferrEngine(participant_id: string, session_id: string) {
  try {
    const url = `${supabaseUrl}/functions/v1/aferr-interpreter`;
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ participant_id, session_id })
    });
    console.log(`[L4 -> L5 Chain] Triggered AFERR Engine for ${participant_id}`);
  } catch (err) {
    console.error('[L4 -> L5 CHAIN ERROR]:', err);
  }
}
