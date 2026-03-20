const supabase = require('./lib/supabase.js');

/**
 * Netlify Background Function: research-worker-background
 * Performs one research scrape task at a time.
 * Note: Background functions must end in -background.js and are 
 * triggered asynchronously.
 */
exports.handler = async (event) => {
  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    console.error('Failed to parse event body:', e.message);
  }
  
  const { company_id, company_name, region } = body;

  if (!company_name) {
    console.error('Missing company_name in request body');
    return; // Background functions don't return responses to the caller
  }

  console.log(`Starting background research for: ${company_name} (${region || 'Global'})`);

  try {
    // 1. Mock Scrape/Research Process
    // In a real scenario, this would use an LLM or Scraper API
    const mockResearchData = {
        adaptiveness_score: Math.floor(Math.random() * 40) + 60,
        last_researched: new Date().toISOString(),
        research_notes: `Automated research completed for ${company_name}. Detected strong signals in resource reallocation.`
    };

    // 2. Update/Upsert Research Result
    console.log(`Upserting research result for ${company_name}...`);
    const { error: upsertError } = await supabase
      .from('company_research')
      .upsert({ 
        company_name,
        region: region || 'Global',
        ...mockResearchData
      }, { onConflict: 'company_name' });

    if (upsertError) {
      console.error('Supabase Upsert Error:', upsertError);
      throw upsertError;
    }
    console.log(`Research result upserted for ${company_name}.`);

    // 3. Mark as completed in the queue
    console.log(`Updating queue status for ${company_name}...`);
    const { error: queueError } = await supabase
      .from('research_queue')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('company_name', company_name);

    if (queueError) {
       console.log('Queue update skipped or failed (might not be in queue):', queueError.message);
    }
    
    console.log(`Successfully completed research cycle for: ${company_name}`);
  } catch (err) {
    console.error('Research Worker Error:', err);
    // Background functions should throw error if they want Netlify to retry
    throw err;
  }
};
