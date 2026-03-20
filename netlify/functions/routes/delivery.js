const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

/**
 * Endpoint: GET /api/v1/delivery/participant/:id/profile
 */
router.get('/participant/:id/profile', async (req, res) => {
  const { id } = req.params;

  try {
    const { data: scoreData, error: scoreError } = await supabase
      .from('entity_scores')
      .select('*')
      .eq('entity_ref_id', id)
      .eq('entity_level', 'participant')
      .order('window_end', { ascending: false })
      .limit(1)
      .single();

    if (scoreError && scoreError.code !== 'PGRST116') throw scoreError;

    if (!scoreData) {
      return res.status(404).json({ error: 'Participant profile not found or insufficient data.' });
    }

    const { data: gapData, error: gapError } = await supabase
      .from('gap_records')
      .select('*')
      .eq('subject_entity_ref_id', id);

    if (gapError) throw gapError;

    const warnings = gapData.map(gap => {
      let message = '';
      if (gap.gap_type === 'perceptive') {
        const gapVal = Number(gap.gap_value);
        if (gapVal > 15) message = 'Your perceived alignment is significantly higher than observed behavior.';
        else if (gapVal < -15) message = 'Your observed behavior demonstrates hidden strengths beyond your self-perception.';
      } else {
        message = `Structural dissonance detected: ${gap.gap_value} variance.`;
      }

      return {
        type: gap.gap_type === 'perceptive' ? 'Perceptive Dissonance' : 'Alignment Dissonance',
        dimension: gap.dimension,
        message: message
      };
    });

    const legacyProfile = {
      participantId: id,
      overallScore: Number(scoreData.overall_score),
      confidence: Number(scoreData.combined_confidence),
      dimensions: {
        signalDetection: Number(scoreData.dimension_breakdown['Signal Detection'] || 0),
        cognitiveFraming: Number(scoreData.dimension_breakdown['Cognitive Framing'] || 0),
        decisionAlignment: Number(scoreData.dimension_breakdown['Decision Alignment'] || 0),
        resourceCalibration: Number(scoreData.dimension_breakdown['Resource Calibration'] || 0),
        integratedResponsiveness: Number(scoreData.dimension_breakdown['Integrated Responsiveness'] || 0)
      },
      warnings: warnings
    };

    res.status(200).json(legacyProfile);

  } catch (err) {
    console.error('[DELIVERY SHIELD ERROR - PROFILE]:', err);
    res.status(500).json({ error: 'Failed to retrieve participant profile.' });
  }
});

/**
 * Endpoint: GET /api/v1/delivery/benchmarks/:industry
 */
router.get('/benchmarks/:industry', async (req, res) => {
  const { industry } = req.params;

  try {
    const { data: benchmarkData, error } = await supabase
      .from('benchmark_snapshots')
      .select('*')
      .eq('cluster_key', industry)
      .eq('cluster_type', 'industry')
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!benchmarkData) {
      return res.status(404).json({ error: 'Benchmark data not available for this industry.' });
    }

    const legacyBenchmark = {
      industry: benchmarkData.cluster_key,
      lastUpdated: benchmarkData.snapshot_date,
      averageScore: Number(benchmarkData.overall_score),
      sampleReliability: benchmarkData.reliability_band,
      dimensions: benchmarkData.dimension_scores || {}
    };

    res.status(200).json(legacyBenchmark);

  } catch (err) {
    console.error('[DELIVERY SHIELD ERROR - BENCHMARKS]:', err);
    res.status(500).json({ error: 'Failed to retrieve benchmarks.' });
  }
});

/**
 * Endpoint: GET /api/v1/delivery/content
 */
router.get('/content', async (req, res) => {
  try {
    const { data: contentData, error } = await supabase
      .from('content_registry')
      .select('*');

    if (error) throw error;

    const terms = {};
    contentData.forEach(item => {
      terms[item.content_key] = item.content_value;
    });

    res.status(200).json({
      version: 'v3.1.0',
      terms: terms
    });

  } catch (err) {
    console.error('[DELIVERY SHIELD ERROR - CONTENT]:', err);
    res.status(500).json({ error: 'Failed to retrieve doctrinal content.' });
  }
});

module.exports = router;
