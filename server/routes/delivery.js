// server/routes/delivery.js

const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

/**
 * Endpoint: GET /api/v1/delivery/participant/:id/profile
 * Role: Translates L7 scores and L8 gaps into a flat legacy profile.
 */
router.get('/participant/:id/profile', async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Fetch Entity Scores (Layer 7)
    const { data: scoreData, error: scoreError } = await supabase
      .from('entity_scores')
      .select('*')
      .eq('entity_ref_id', id)
      .eq('entity_level', 'participant')
      .order('window_end', { ascending: false })
      .limit(1)
      .single();

    if (scoreError && scoreError.code !== 'PGRST116') throw scoreError; // PGRST116 is "no rows returned"

    if (!scoreData) {
      return res.status(404).json({ error: 'Participant profile not found or insufficient data.' });
    }

    // 2. Fetch Gap Records (Layer 8)
    const { data: gapData, error: gapError } = await supabase
      .from('gap_records')
      .select('*')
      .eq('subject_entity_ref_id', id);

    if (gapError) throw gapError;

    // 3. Map Gaps to Legacy Warnings Array
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

    // 4. Construct Legacy JSON Shape
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
 * Role: Serves L9 Observatory snapshots safely.
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

    // Construct Legacy JSON Shape
    const legacyBenchmark = {
      industry: benchmarkData.cluster_key,
      lastUpdated: benchmarkData.snapshot_date,
      averageScore: Number(benchmarkData.overall_score),
      sampleReliability: benchmarkData.reliability_band,
      dimensions: benchmarkData.dimension_scores || {} // Fallback if L9 worker hasn't populated granular dims yet
    };

    res.status(200).json(legacyBenchmark);

  } catch (err) {
    console.error('[DELIVERY SHIELD ERROR - BENCHMARKS]:', err);
    res.status(500).json({ error: 'Failed to retrieve benchmarks.' });
  }
});

/**
 * Endpoint: GET /api/v1/delivery/content
 * Role: Serves Layer 0 doctrinal terms.
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
