const { supabase } = require('./lib/supabase.js');

/**
 * LAI Scoring Worker v1.0.0
 * The core deterministic engine for institutional behavioral intelligence.
 * Processes signals_normalized -> updates organizations -> emits intelligence_events.
 */

const RECENCY_CURVE = [
  { days: 1, weight: 1.0 },
  { days: 7, weight: 0.8 },
  { days: 30, weight: 0.6 },
  { days: 90, weight: 0.4 }
];

function getRecencyWeight(eventTimestamp) {
  const ageInDays = (new Date() - new Date(eventTimestamp)) / (1000 * 60 * 60 * 24);
  const layer = RECENCY_CURVE.find(l => ageInDays <= l.days) || RECENCY_CURVE[RECENCY_CURVE.length - 1];
  return layer.weight;
}

// Helper for normalization (linear 0-1 scaling with floor/ceiling)
function normalize(val, min, max) {
  if (val <= min) return 0;
  if (val >= max) return 1;
  return (val - min) / (max - min);
}

// Helper for standard deviation
function getStdDev(arr) {
  if (!arr?.length) return 0;
  const n = arr.length;
  const mean = arr.reduce((a, b) => a + b) / n;
  return Math.sqrt(arr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

exports.handler = async (event) => {
  const startTime = Date.now();
  console.log('📉 LAI Scoring Engine (v1.7.0) initiated…');

  try {
    // 1. Fetch Active Institutions & Global Stats for Normalization Context
    const { data: orgs } = await supabase.from('organizations').select('id, name, region, industry');
    if (!orgs?.length) return { statusCode: 200, body: 'No organizations to score' };

    const eventsEmitted = [];

    for (const org of orgs) {
      // 2. Fetch Signals (90 days for score, 7 days for turbulence)
      const now = new Date();
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const { data: signals } = await supabase
        .from('signals_normalized')
        .select('*')
        .eq('institution_id', org.id)
        .gte('event_timestamp', ninetyDaysAgo.toISOString());

      if (!signals?.length) continue;

      // 3. Compute Current Score
      const dimensions = { signal_detection: 50, cognitive_framing: 50, decision_alignment: 50, resource_calibration: 50, integrated_responsiveness: 50 };
      signals.forEach(sig => {
        const weight = getRecencyWeight(sig.event_timestamp);
        const impact = (sig.impact_direction * sig.impact_strength * weight * sig.confidence);
        if (dimensions[sig.dimension_impacted] !== undefined) dimensions[sig.dimension_impacted] += impact;
      });

      Object.keys(dimensions).forEach(k => dimensions[k] = Math.max(0, Math.min(100, Math.round(dimensions[k]))));
      const overallScore = Math.round(Object.values(dimensions).reduce((a, b) => a + b, 0) / 5);

      // 4. Fetch History for Volatility & Change Metrics
      const { data: history } = await supabase
        .from('institution_score_history')
        .select('overall_score, recorded_at')
        .eq('institution_id', org.id)
        .order('recorded_at', { ascending: false })
        .limit(30);

      const pastScores = (history || []).map(h => h.overall_score);
      const volatility30d = getStdDev(pastScores);

      // Score changes
      const score24h = history?.find(h => h.recorded_at <= twentyFourHoursAgo.toISOString().split('T')[0])?.overall_score || overallScore;
      const score7d = history?.find(h => h.recorded_at <= sevenDaysAgo.toISOString().split('T')[0])?.overall_score || overallScore;
      const score30d = pastScores[pastScores.length - 1] || overallScore;

      // 5. Compute Turbulence & Integrity (7-day composite)
      const sig7d = signals.filter(s => new Date(s.event_timestamp) >= sevenDaysAgo);
      const sig24h = signals.filter(s => new Date(s.event_timestamp) >= twentyFourHoursAgo);
      
      const sigVolume = sig7d.length;
      const sigVelocity = Math.abs(overallScore - score7d);
      const sigDiversity = new Set(sig7d.map(s => s.dimension_impacted)).size;
      const sourceCount = new Set(sig7d.map(s => s.source_name || s.metadata?.source_domain || 'unknown')).size;

      // 5b. Dynamic Confidence logic (Rule 2)
      const directions = new Set(sig7d.map(s => s.impact_direction));
      const hasContradiction = directions.has(1) && directions.has(-1);
      
      let calculatedConfidence = sig7d.reduce((acc, s) => acc + (s.confidence || 0), 0) / (sig7d.length || 1);
      // Boost for diversity, penalty for homogeneity
      if (sourceCount >= 3) calculatedConfidence *= 1.1;
      if (sourceCount === 1) calculatedConfidence *= 0.8;
      // Multi-tier bonus
      const tiers = new Set(sig7d.map(s => s.source_tier));
      if (tiers.size > 1) calculatedConfidence *= 1.15;
      // Contradiction Penalty (Rule 2)
      if (hasContradiction) calculatedConfidence *= 0.8;
      // Tier 3 Cap (Rule 2)
      if (tiers.size === 1 && tiers.has(3)) calculatedConfidence = Math.min(0.75, calculatedConfidence);
      
      const finalConfidence = Math.max(0, Math.min(1, calculatedConfidence));

      // 5c. Coverage Floors (Rule 1 & 3)
      const isUnderSampled = sigVolume < 5; // Entity floor
      const turbulence7d = isUnderSampled ? null : Math.round(
        (normalize(sigVolume, 0, 20) * 40) + 
        (normalize(sigVelocity, 0, 15) * 40) + 
        (normalize(sigDiversity, 0, 5) * 20)
      );

      // 6. Persistence: institution_metrics
      const latestMajor = signals.filter(s => s.impact_strength >= 7).sort((a,b) => new Date(b.event_timestamp) - new Date(a.event_timestamp))[0];
      
      await supabase.from('institution_metrics').upsert({
        institution_id: org.id,
        region: org.region,
        sector: org.industry,
        current_lai_score: overallScore,
        score_change_24h: overallScore - score24h,
        score_change_7d: overallScore - score7d,
        score_change_30d: overallScore - score30d,
        volatility_30d: volatility30d,
        turbulence_7d: turbulence7d,
        signal_volume_7d: sigVolume,
        signal_diversity_7d: sigDiversity,
        signal_velocity_7d: sigVelocity,
        signal_last_24h: sig24h.length,
        confidence_current: finalConfidence,
        dominant_dimension: Object.entries(dimensions).sort((a,b) => b[1]-a[1])[0][0],
        last_major_event_at: latestMajor?.event_timestamp || null,
        integrity_flags: {
          under_sampled: isUnderSampled,
          contradiction_detected: hasContradiction,
          source_diversity: sourceCount,
          confidence_synthetic: tiers.size === 1 && tiers.has(3)
        }
      });

      // 7. Event Emission with Enriched Metadata
      const prevOverall = pastScores[0] || 0;
      const delta = overallScore - prevOverall;

      if (Math.abs(delta) >= 0.1) {
        // Evidence logging
        await supabase.from('diagnostic_results').insert([{
          organization_name: org.name,
          overall_lai_score: overallScore,
          signal_interpretation_score: dimensions.signal_detection,
          cognitive_framing_score: dimensions.cognitive_framing,
          resource_reallocation_score: dimensions.resource_calibration,
          decision_alignment_score: dimensions.decision_alignment,
          execution_responsiveness_score: dimensions.integrated_responsiveness,
          metadata: { engine: 'lai-scoring-v1.7.0', signal_count: signals.length }
        }]);

        // Ticker Logic (Throttled)
        const severity = Math.abs(delta) > 5 ? 'major' : 'minor';
        const primarySig = signals.sort((a,b) => new Date(b.event_timestamp) - new Date(a.event_timestamp))[0];
        
        const throttleWindow = severity === 'major' ? 5 : 15;
        const { data: recentEvents } = await supabase.from('intelligence_events')
          .select('metadata').eq('institution_id', org.id)
          .gte('created_at', new Date(Date.now() - throttleWindow * 60 * 1000).toISOString());

        const isDuplicate = recentEvents?.some(e => e.metadata?.summary === primarySig?.signal_type);

        if (!isDuplicate && (severity === 'major' || !recentEvents?.length)) {
          await supabase.from('intelligence_events').insert([{
            event_type: 'score.updated',
            severity,
            institution_id: org.id,
            institution_name: org.name,
            delta_score: delta,
            origin_signal_ids: signals.map(s => s.signal_id).slice(0, 5),
            event_timestamp: new Date().toISOString(),
            metadata: { 
              summary: primarySig?.signal_type || 'Adaptive shift',
              dimension: primarySig?.dimension_impacted,
              source_tier: primarySig?.source_tier,
              confidence: primarySig?.confidence,
              region: org.region,
              sector: org.industry
            }
          }]);
          eventsEmitted.push({ org: org.name, delta });
        }
      }

      // 8. History Snapshot
      await supabase.from('institution_score_history').upsert({
        institution_id: org.id,
        recorded_at: new Date().toISOString().split('T')[0],
        overall_score: overallScore,
        signal_detection_score: dimensions.signal_detection,
        cognitive_framing_score: dimensions.cognitive_framing,
        resource_calibration_score: dimensions.resource_calibration,
        decision_alignment_score: dimensions.decision_alignment,
        integrated_responsiveness_score: dimensions.integrated_responsiveness
      }, { onConflict: 'institution_id,recorded_at' });
    }

    return { statusCode: 200, body: JSON.stringify({ status: 'success', events: eventsEmitted.length, duration: Date.now() - startTime }) };
  } catch (err) {
    console.error('Scoring Engine Failure:', err);
    return { statusCode: 500, body: err.message };
  }
};

exports.config = {
  schedule: "*/15 * * * *" // Run every 15 minutes to process new signals
};
