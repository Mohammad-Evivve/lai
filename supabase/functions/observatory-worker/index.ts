// supabase/functions/observatory-worker/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    // Optional: Secure the cron endpoint with a custom secret
    const authHeader = req.headers.get('Authorization');
    const cronSecret = Deno.env.get('CRON_SECRET');
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    console.log(`[Observatory Worker] Initiating daily benchmark aggregation...`);

    // ==========================================
    // LAYER 9: BENCHMARK AGGREGATION
    // ==========================================

    // 1. Fetch raw joined data
    // Note: participant_metadata must be relationally linked in Supabase schema
    const { data: rawData, error: fetchError } = await supabase
      .from('entity_scores')
      .select(`
        overall_score,
        dimension_breakdown,
        entity_ref_id,
        participant_metadata!inner(industry, region, role_level)
      `)
      .eq('entity_level', 'participant');

    if (fetchError) throw fetchError;

    if (!rawData || rawData.length === 0) {
      return new Response(JSON.stringify({ status: 'no_data_to_aggregate' }), { status: 200 });
    }

    // 2. Aggregate scores by Industry
    const industryClusters: Record<string, { totalScore: number, count: number }> = {};

    rawData.forEach(record => {
      // @ts-ignore - Supabase type inference for joined tables
      const industry = record.participant_metadata?.industry;
      if (!industry) return;

      if (!industryClusters[industry]) {
        industryClusters[industry] = { totalScore: 0, count: 0 };
      }
      industryClusters[industry].totalScore += Number(record.overall_score);
      industryClusters[industry].count += 1;
    });

    const snapshotsToInsert = [];
    const today = new Date().toISOString().split('T')[0];

    // 3. Enforce Anonymity and Reliability Rules
    for (const [industry, metrics] of Object.entries(industryClusters)) {
      const sampleSize = metrics.count;
      
      // Rule 1: Absolute Suppression (n < 5)
      if (sampleSize < 5) {
        console.log(`[Observatory] Suppressed snapshot for Industry: ${industry} (n=${sampleSize})`);
        continue;
      }

      // Rule 2: Reliability Banding (n >= 10)
      const reliabilityBand = sampleSize >= 10 ? 'high' : 'low_sample_warning';
      const avgScore = (metrics.totalScore / sampleSize).toFixed(2);

      snapshotsToInsert.push({
        snapshot_date: today,
        cluster_type: 'industry',
        cluster_key: industry,
        sample_size: sampleSize,
        overall_score: avgScore,
        reliability_band: reliabilityBand,
        generated_at: new Date().toISOString()
      });
    }

    // 4. Write to Layer 9 (benchmark_snapshots)
    if (snapshotsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('benchmark_snapshots')
        .insert(snapshotsToInsert);

      if (insertError) throw insertError;
      console.log(`[Observatory Worker] Generated ${snapshotsToInsert.length} benchmarks.`);
    }

    // ==========================================
    // LAYER 9: LEADERSHIP SYSTEM DECAY 
    // ==========================================
    // 5. Expire memberships older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { error: decayError } = await supabase
      .from('leadership_system_memberships')
      .update({ membership_end: new Date().toISOString() })
      .lt('membership_start', thirtyDaysAgo.toISOString())
      .is('membership_end', null);

    if (decayError) throw decayError;
    console.log(`[Observatory Worker] Processed 30-day decay rule for Leadership Systems.`);

    return new Response(JSON.stringify({ 
      status: 'observatory_completed', 
      benchmarks_generated: snapshotsToInsert.length 
    }), { headers: { 'Content-Type': 'application/json' }, status: 200 });

  } catch (err) {
    console.error('[OBSERVATORY ERROR]:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
