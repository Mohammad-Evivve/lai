const { supabase } = require('./lib/supabase.js');

/**
 * LAI Reordering Worker v1.0.0
 * Batches rank recalculations to prevent UI jitter.
 * Emits 'rank.changed' event every 60s for the frontend to re-fetch/re-order.
 */

exports.handler = async (event) => {
  const startTime = Date.now();
  console.log('🔄 Institutional Rank Reordering initiated…');

  try {
    // 1. Fetch current rankings and their scores
    const { data: currentRankings, error: fetchError } = await supabase
      .from('diagnostic_results')
      .select('organization_name, overall_lai_score, created_at')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    // Deduplicate to get the single latest score per org
    const orgScores = {};
    currentRankings.forEach(s => {
      if (!orgScores[s.organization_name]) {
        orgScores[s.organization_name] = s.overall_lai_score;
      }
    });

    // 2. Sort to get new potential ranks
    const sortedOrgs = Object.entries(orgScores)
      .sort((a, b) => b[1] - a[1])
      .map((o, i) => ({ name: o[0], score: o[1], rank: i + 1 }));

    // 3. Emit Rank Update Event only if meaningful movement occurred
    const sixtySecondsAgo = new Date(Date.now() - 60000).toISOString();
    const { data: recentMovers } = await supabase
      .from('intelligence_events')
      .select('event_type, severity, delta_score')
      .gte('created_at', sixtySecondsAgo)
      .or('event_type.eq.score.updated,severity.eq.major');

    const hasMeaningfulMovement = recentMovers?.some(m => 
      m.severity === 'major' || 
      (m.event_type === 'score.updated' && Math.abs(m.delta_score) >= 0.5)
    );

    if (hasMeaningfulMovement) {
      await supabase.from('intelligence_events').insert([{
        event_type: 'rankings.updated',
        severity: 'minor',
        metadata: { 
          summary: 'Global rankings re-anchored',
          count: sortedOrgs.length,
          top_movers: sortedOrgs.slice(0, 5).map(o => o.name)
        }
      }]);
      console.log('Rankings updated due to meaningful movement.');
    } else {
      console.log('Skipping rank update: No meaningful movement detected.');
    }

    // 4. Regional Rollups with Integrity Anchors (Rule 1 & 3)
    const { data: regionMetrics } = await supabase
      .from('institution_metrics')
      .select('region, turbulence_7d, score_change_7d, signal_volume_7d, confidence_current');
    
    const stats = {};
    regionMetrics?.forEach(m => {
      const r = m.region || 'Global';
      if (!stats[r]) { 
        stats[r] = { counts: 0, turbSum: 0, deltaSum: 0, signalSum: 0, confSum: 0 }; 
      }
      stats[r].counts++;
      stats[r].turbSum += m.turbulence_7d || 0;
      stats[r].deltaSum += m.score_change_7d || 0;
      stats[r].signalSum += m.signal_volume_7d || 0;
      stats[r].confSum += m.confidence_current || 0;
    });
 
    const rollups = Object.keys(stats).map(r => {
      const s = stats[r];
      const totalSignals = s.signalSum;
      const isUnderSampled = totalSignals < 10; // Rule 1: Threshold check
      
      const avgTurb = Math.round(s.turbSum / s.counts);
      const avgConf = s.confSum / s.counts;
      
      return {
        region: r,
        avg_turbulence: isUnderSampled ? null : avgTurb,
        delta_7d: parseFloat((s.deltaSum / s.counts).toFixed(1)),
        signal_volume: totalSignals,
        avg_confidence: avgConf,
        integrity_state: isUnderSampled ? 'INSUFFICIENT DATA' : 
                         avgConf < 0.6 ? 'LOW CONFIDENCE' : 'VERIFIED'
      };
    });

    await supabase.from('intelligence_events').insert([{
      event_type: 'region.metrics',
      severity: 'minor',
      metadata: { 
        summary: 'Regional turbulence reconciled',
        regions: rollups 
      }
    }]);

    console.log(`Rankings updated and regional metrics reconciled.`);

    return { statusCode: 200, body: 'success' };
  } catch (err) {
    console.error('Reordering Engine Failure:', err);
    return { statusCode: 500, body: err.message };
  }
};

exports.config = {
  schedule: "*/1 * * * *" // Run every minute for "Institutional Motion"
};
