const supabase = require('./lib/supabase.js');

/**
 * Netlify Background Function: system-test-background
 * Runs a full end-to-end smoke test of the LAI Research Pipeline.
 */
exports.handler = async (event) => {
  console.log('🚀 Starting System Smoke Test...');
  const testCompany = `SMOKE_TEST_${Math.floor(Math.random() * 1000)}`;
  const startTime = Date.now();
  
  const results = {
    test_id: testCompany,
    steps: [],
    final_status: 'failed',
    error_code: null
  };

  const logStep = (name, status, details = '', code = null) => {
    console.log(`[Step] ${name}: ${status} ${details} ${code ? `[Code: ${code}]` : ''}`);
    results.steps.push({ name, status, details, code, timestamp: new Date().toISOString() });
  };

  try {
    // 1. Verify Supabase Connectivity & Authentication
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
        throw { message: 'Missing Environment Variables', code: 'ENV_MISSING' };
    }

    const { data: connTest, error: connError } = await supabase.from('diagnostic_results').select('id').limit(1);
    if (connError) {
        throw { message: `Supabase Auth/Conn Failed: ${connError.message}`, code: connError.code || 'AUTH_FAIL' };
    }
    logStep('Supabase Connectivity', 'success');

    // 2. Seed Test Company into Queue
    const { error: seedError } = await supabase
      .from('research_queue')
      .insert([{ company_name: testCompany, region: 'TestRegion', status: 'pending' }]);
    
    if (seedError) throw { message: `Seeding Failed: ${seedError.message}`, code: seedError.code || 'DB_ERR' };
    logStep('Seed Test Company', 'success', `Company: ${testCompany}`);

    // 3. Trigger Scheduler
    const baseUrl = process.env.URL || `https://${event.headers.host}` || 'https://lai.institute';
    const schedulerUrl = `${baseUrl.replace(/\/$/, '')}/.netlify/functions/research-scheduler`;
    
    console.log(`Triggering scheduler at: ${schedulerUrl}`);
    try {
        const schedResponse = await fetch(schedulerUrl);
        if (!schedResponse.ok) {
            throw { message: `Scheduler Trigger Failed: ${schedResponse.statusText}`, code: schedResponse.status };
        }
        logStep('Trigger Scheduler', 'success');
    } catch (e) {
        if (e.code) throw e;
        throw { message: `Scheduler Network Error: ${e.message}`, code: 'FETCH_ERR' };
    }

    // 4. Poll for results (Wait up to 30 seconds for background worker)
    logStep('Awaiting Worker Completion', 'pending');
    let completed = false;
    for (let i = 0; i < 6; i++) {
        await new Promise(r => setTimeout(r, 5000));
        const { data: check, error: pollError } = await supabase
            .from('company_research')
            .select('id')
            .eq('company_name', testCompany)
            .maybeSingle();
        
        if (pollError) console.error('Polling error:', pollError);
        if (check) {
            completed = true;
            break;
        }
        console.log(`Polling... attempt ${i+1}`);
    }

    if (!completed) throw { message: 'Worker timed out or failed to update database', code: 'TIMEOUT' };
    logStep('Worker Verification', 'success', 'Found result in company_research');

    // 5. AFERR Schema Dry Run
    logStep('AFERR Dry Run', 'pending');
    const { error: aferrError } = await supabase
        .from('diagnostic_results')
        .insert([{
            organization_name: testCompany,
            region: 'TestRegion',
            overall_score: 85,
            signal_detection_score: 90.00,
            emotional_framing_score: 80.00,
            resource_reallocation_score: 85.00,
            decision_alignment_score: 75.00,
            execution_responsiveness_score: 95.00,
            metadata: { source: 'smoke-test', status: 'valid' }
        }]);
    
    if (aferrError) throw { message: `AFERR Schema Validation Failed: ${aferrError.message}`, code: aferrError.code || 'SCHEMA_ERR' };
    logStep('AFERR Schema Validation', 'success');

    results.final_status = 'passed';
    console.log('✅ System Smoke Test Passed!');

  } catch (err) {
    console.error('❌ Smoke Test Failed:', err.message);
    const code = err.code || 'UNKNOWN';
    logStep('Failure Diagnosis', 'failed', err.message, code);
    results.final_status = 'failed';
    results.error_code = code;
  } finally {
    // Cleanup
    await supabase.from('research_queue').delete().eq('company_name', testCompany);
    await supabase.from('company_research').delete().eq('company_name', testCompany);
    await supabase.from('diagnostic_results').delete().eq('organization_name', testCompany);
    
    // Log final test result
    try {
        await supabase.from('scraper_logs').insert([{
            status: results.final_status === 'passed' ? 'success' : 'error',
            error_code: results.error_code,
            duration_ms: Date.now() - startTime,
            summary: JSON.stringify(results.steps)
        }]);
    } catch (e) {
        console.error('Critial failure logging result:', e.message);
    }
  }
};
