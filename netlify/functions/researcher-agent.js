const { supabase } = require('./lib/supabase.cjs');

/**
 * Researcher Agent v2.0 — Sovereign Intelligence Layer
 * 
 * Accepts raw intel text and uses NLP heuristics to extract scores for
 * the 5 Core Evaluation Layer dimensions. Writes to diagnostic_results
 * with the appropriate Tier (SOVEREIGN = 1.2x, PERCEPTION = 0.8x).
 */

// ── 5 Core Dimension Keyword Maps ─────────────────────────────────────────────
const DIMENSION_KEYWORDS = {
  signal_detection: [
    'signal', 'detect', 'sensing', 'awareness', 'recognize', 'identify',
    'early warning', 'insight', 'foresight', 'read', 'monitor', 'scanning',
    'anticipate', 'interpret', 'perceive', 'intelligence', 'alert'
  ],
  cognitive_framing: [
    'vision', 'framing', 'mindset', 'perspective', 'reframing', 'narrative',
    'mental model', 'paradigm', 'thinking', 'worldview', 'belief', 'cognitive',
    'clarity', 'focus', 'orientation', 'conception', 'rationale'
  ],
  resource_calibration: [
    'resource', 'realloc', 'capital', 'budget', 'invest', 'redeploy',
    'priority', 'shift', 'allocat', 'fund', 'bandwidth', 'capacity',
    'talent', 'restructur', 'pivot', 'redirect', 'portfolio', 'trade-off'
  ],
  decision_alignment: [
    'decision', 'align', 'consensus', 'governance', 'coordination',
    'unity', 'cohesion', 'direction', 'agreement', 'mandate', 'strategy',
    'committee', 'board', 'executive', 'resolve', 'commitment', 'directive'
  ],
  integrated_responsiveness: [
    'execution', 'deliver', 'implement', 'responsive', 'speed', 'agile',
    'velocity', 'adapt', 'deploy', 'operationalize', 'action', 'initiative',
    'launch', 'rollout', 'performance', 'throughput', 'efficiency', 'outcome'
  ]
};

// Sentiment modifiers
const POSITIVE_WORDS = [
  'strong', 'excellent', 'high', 'improving', 'leaders', 'success', 'robust',
  'outstanding', 'exceptional', 'rapid', 'confident', 'disciplined', 'clear',
  'effective', 'proactive', 'innovative', 'strategic', 'decisive'
];
const NEGATIVE_WORDS = [
  'weak', 'lagging', 'poor', 'decline', 'risk', 'failure', 'fragile',
  'dissonance', 'slow', 'reactive', 'confused', 'chaotic', 'misaligned',
  'resistant', 'rigid', 'stagnant', 'vulnerable', 'skeptical'
];

// Base scores by dimension (calibrated to a 60-70 baseline)
const BASE_SCORES = {
  signal_detection: 65,
  cognitive_framing: 65,
  resource_calibration: 60,
  decision_alignment: 62,
  integrated_responsiveness: 63
};

function extractScores(text) {
  const lower = text.toLowerCase();
  const scores = {};

  // Per-dimension keyword scan
  for (const [dim, keywords] of Object.entries(DIMENSION_KEYWORDS)) {
    let score = BASE_SCORES[dim];
    keywords.forEach(kw => { if (lower.includes(kw)) score += 4; });
    POSITIVE_WORDS.forEach(w => { if (lower.includes(w)) score += 2; });
    NEGATIVE_WORDS.forEach(w => { if (lower.includes(w)) score -= 3; });
    scores[dim] = Math.min(100, Math.max(0, Math.round(score)));
  }

  return scores;
}

// ── Handler ────────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { organization_id, mode, seniority, text } = JSON.parse(event.body);

    if (!organization_id || !text) {
      return { statusCode: 400, body: JSON.stringify({ error: 'organization_id and text are required.' }) };
    }

    // Extract scores from the submitted intel text
    const scores = extractScores(text);
    const overall = Math.round(
      Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
    );

    // Determine source_type based on mode
    // SOVEREIGN → PROPRIETARY (Tier 0, 1.2x in the aggregation engine)
    // PERCEPTION → PERCEPTION  (Tier 2, 0.8x in the aggregation engine)
    const source_type = mode === 'SOVEREIGN' ? 'PROPRIETARY' : 'PERCEPTION';

    const { data, error } = await supabase.from('diagnostic_results').insert([{
      organization_name: organization_id,
      overall_score: overall,
      signal_detection_score: scores.signal_detection,
      cognitive_framing_score: scores.cognitive_framing,
      resource_calibration_score: scores.resource_calibration,
      decision_alignment_score: scores.decision_alignment,
      integrated_responsiveness_score: scores.integrated_responsiveness,
      source_type,
      seniority_level: seniority || 'middle_management',
      is_published: true,
      metadata: {
        raw_intel: text.substring(0, 2000), // Limit stored text to 2kb
        mode,
        agent: 'Researcher-Agent-v2.0-SOVEREIGN',
        dimension_scores: scores,
        overall
      }
    }]).select();

    if (error) throw error;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        tier: mode === 'SOVEREIGN' ? 'Tier 0 – Sovereign (1.2x authority)' : 'Tier 2 – Perception (0.8x authority)',
        scores,
        overall,
        record_id: data?.[0]?.id
      })
    };
  } catch (err) {
    console.error('Researcher Agent v2 Error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
