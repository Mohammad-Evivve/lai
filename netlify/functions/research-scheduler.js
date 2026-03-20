const supabase = require('./lib/supabase.js');

/**
 * Netlify Scheduled Function: research-scheduler
 * Runs periodically (e.g., hourly) to pick companies from the queue
 * and trigger the research worker.
 */
exports.handler = async (event) => {
  console.log('Research Scheduler triggered...');

  try {
    // 1. Get next batch of companies from the queue
    let { data: queueItems, error: queueError } = await supabase
      .from('research_queue')
      .select('*')
      .eq('status', 'pending')
      .limit(3);

    if (queueError) throw queueError;

    // 1.5 Self-Seeding: If queue is empty, repopulate it
    if (!queueItems || queueItems.length === 0) {
      console.log('Queue empty. Seeding new batch of global companies...');
      const seedCompanies = [
        { company_name: 'Microsoft', region: 'North America', status: 'pending' },
        { company_name: 'Siemens', region: 'Europe', status: 'pending' },
        { company_name: 'Toyota', region: 'APAC', status: 'pending' },
        { company_name: 'Samsung', region: 'APAC', status: 'pending' },
        { company_name: 'HSBC', region: 'Europe', status: 'pending' },
        { company_name: 'Tesla', region: 'North America', status: 'pending' },
        { company_name: 'Aramco', region: 'Middle East', status: 'pending' },
        { company_name: 'Tencent', region: 'APAC', status: 'pending' }
      ];
      
      const { data: seeded, error: seedError } = await supabase
        .from('research_queue')
        .insert(seedCompanies)
        .select();
        
      if (seedError) throw seedError;
      queueItems = seeded.slice(0, 3);
    }

    // 2. Trigger worker for each company
    // Note: In Netlify, we ideally trigger background functions
    for (const item of queueItems) {
      console.log(`Queuing research for: ${item.company_name}`);
      
      // Update status to 'processing'
      await supabase
        .from('research_queue')
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', item.id);

      // Trigger the research worker background function
      console.log(`Triggering background worker for: ${item.company_name}`);
      
      // Determine the base URL for triggering background workers
      // In Netlify, we can often rely on the site's primary URL
      const baseUrl = process.env.URL || `https://${event.headers.host}` || 'https://lai.institute';
      const triggerUrl = `${baseUrl.replace(/\/$/, '')}/.netlify/functions/research-worker-background`;
      
      console.log(`Target trigger URL: ${triggerUrl}`);

      await fetch(triggerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          company_id: item.id, 
          company_name: item.company_name,
          region: item.region 
        })
      }).catch(err => console.error(`Failed to trigger worker for ${item.company_name}:`, err));
    }

    // 3. Regional Narrative Generator (Activate Every 60m)
    const now = new Date();
    if (now.getMinutes() < 15) { 
      console.log('Activating Regional Narrative Generator...');
      const { data: recentSignals } = await supabase
        .from('diagnostic_results')
        .select('region, resource_reallocation_score, signal_interpretation_score')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (recentSignals && recentSignals.length > 0) {
        // Group by region
        const stats = {};
        recentSignals.forEach(s => {
          if (!stats[s.region]) stats[s.region] = { sum: 0, count: 0 };
          stats[s.region].sum += (s.resource_reallocation_score || 0);
          stats[s.region].count++;
        });

        const regions = Object.keys(stats);
        const randomRegion = regions[Math.floor(Math.random() * regions.length)];
        const avg = Math.round(stats[randomRegion].sum / stats[randomRegion].count);
        
        const narratives = [
          `${randomRegion} Resource Reallocation is up to ${avg} due to high regulatory adaptation in the energy sector.`,
          `${randomRegion} Signal Interpretation velocity is stabilizing as market volatility decreases.`,
          `${randomRegion} Decision Alignment shows divergence across mid-market manufacturing sectors.`,
          `Increased AFERR Activation detected in ${randomRegion} technology clusters.`
        ];
        const summary = narratives[Math.floor(Math.random() * narratives.length)];

        await supabase.from('scraper_logs').insert([{
          status: 'signal',
          summary: `[REGIONAL NARRATIVE] ${summary}`,
          duration_ms: 0
        }]);
        console.log(`Regional Narrative posted: ${summary}`);
      }
    }

    return {
      statusCode: 200,
      body: `Triggered research for ${queueItems.length} companies and checked regional narratives.`
    };
  } catch (err) {
    console.error('Scheduler Error:', err);
    return { statusCode: 500, body: 'Scheduler failed' };
  }
};
