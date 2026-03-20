const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const {
    org_name, contact_name, contact_title, contact_email, company_size,
    planning_stage, offsite_date, prompting_reasons, prompting_other,
    business_context, attendee_roles, expected_headcount, decision_authority,
    missing_stakeholders, objectives, success_definition, biggest_challenges,
    diagnostic_reason, prior_work, prior_work_detail, offsite_format,
    diagnostic_interest, support_needed, anything_else,
  } = payload;

  // ── SUPABASE WRITE ──
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from('offsite_intakes').insert([{
        org_name,
        contact_name,
        contact_title,
        contact_email,
        company_size,
        planning_stage,
        offsite_date: offsite_date || null,
        prompting_reasons: prompting_reasons || [],
        prompting_other: prompting_other || '',
        business_context,
        attendee_roles: attendee_roles || [],
        expected_headcount,
        decision_authority,
        missing_stakeholders: missing_stakeholders || '',
        objectives: objectives || [],
        success_definition,
        biggest_challenges: biggest_challenges || [],
        diagnostic_reason,
        prior_work,
        prior_work_detail: prior_work_detail || '',
        offsite_format,
        diagnostic_interest,
        support_needed: support_needed || [],
        anything_else: anything_else || '',
        submitted_at: new Date().toISOString(),
      }]);

      if (error) {
        console.error('Supabase write error:', error.message);
        // Fallback: log payload so it's visible in Netlify logs
        console.log('INTAKE_FALLBACK_LOG:', JSON.stringify(payload));
      }
    } catch (err) {
      console.error('Supabase client error:', err);
      console.log('INTAKE_FALLBACK_LOG:', JSON.stringify(payload));
    }
  } else {
    // No Supabase configured — log so it's visible in function logs 
    console.log('INTAKE_FALLBACK_LOG (no Supabase env):', JSON.stringify(payload));
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true }),
  };
};
