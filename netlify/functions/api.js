const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const { supabase: supabaseClient } = require('./lib/supabase.js');
const emailLib = require('./lib/email.js');
const emailTemplates = require('./lib/emailTemplates.js');
const { sendEmail, getSender } = emailLib;
const { INTERNAL, ESSENTIAL } = emailTemplates;

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Routes

// Health Check - Enhanced Deep Diagnostic
app.get(['/api/health', '/health'], async (req, res) => {
  try {
    const health = {
      status: 'ok',
      version: '1.2.8-FINAL',
      timestamp: new Date().toISOString(),
      env: {
        has_url: !!process.env.SUPABASE_URL,
        has_key: !!(process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY)
      },
      tables: {}
    };

    // Deep Schema Check
    const checkTableSchema = async (tableName, requiredColumns) => {
        try {
            const { error } = await supabaseClient
                .from(tableName)
                .select(requiredColumns.join(','))
                .limit(0);
            
            if (error) {
                return { exists: false, error: error.message };
            }
            
            return { exists: true, ok: true, missing_columns: [] };
        } catch (e) {
            return { exists: false, error: e.message };
        }
    };

    health.tables.company_research = await checkTableSchema('company_research', ['company_name', 'adaptiveness_score', 'region']);
    health.tables.diagnostic_results = await checkTableSchema('diagnostic_results', ['id', 'organization_name', 'region', 'overall_score', 'metadata']);
    
    res.json(health);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Submit Diagnostic Start (Initial Lead Capture)
app.post(['/api/diagnostic/start', '/diagnostic/start'], async (req, res) => {
  const { email, name, organization, industry, role_level, org_size, region } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const updateData = {
      email,
      name: name || '',
      company: organization || '',
      industry: industry || '',
      role: role_level || '',
      org_size: org_size || '',
      region: region || '',
      has_started: true,
      last_activity_at: new Date().toISOString()
    };

    await supabaseClient.from('user_status').upsert(updateData, { onConflict: 'email' });

    // Trigger Internal Alert (Sales Signal)
    if (email && email.includes('@') && !email.includes('example.com')) {
      const salesResult = await sendEmail({
        from: getSender('notifications'),
        to: 'mmemon@evivve.com',
        subject: `[LEAD] Diagnostic Started — ${email}`,
        html: INTERNAL.salesAlert({ 
          name, 
          email, 
          organization, 
          role_level, 
          industry,
          event_type: 'diagnostic_start'
        }),
        type: 'diagnostic_start'
      });
      
      // Log lead signal
      await logEmailOp(email, 'diagnostic_start', salesResult, null, 'sales');
    }

    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record start' });
  }
});

// Diagnostic Results — Enhanced for Team Insights
app.get(['/api/diagnostic/:id', '/diagnostic/:id'], async (req, res) => {
  const { id } = req.params;
  try {
    const { data: individual, error: individualError } = await supabaseClient
      .from('diagnostic_results')
      .select('*, teams(team_code)')
      .eq('id', id)
      .single();

    if (individualError) throw individualError;

    // Flatten team_code from join
    if (individual.teams) {
      individual.team_code = individual.teams.team_code;
      delete individual.teams;
    }

    // Robust Fallback Logic for team_code
    if (!individual.team_code) {
      if (individual.team_id) {
        const { data: teamObj } = await supabaseClient.from('teams').select('team_code').eq('id', individual.team_id).single();
        if (teamObj) individual.team_code = teamObj.team_code;
      } else if (individual.organization_name) {
        const isGeneric = (org) => !org || ['none', 'na', 'test', 'ntu'].includes(org.toLowerCase().trim());
        if (!isGeneric(individual.organization_name)) {
          const { data: existingTeam } = await supabaseClient.from('teams')
            .select('team_code')
            .ilike('organization_name', individual.organization_name.trim())
            .limit(1)
            .maybeSingle();

          if (existingTeam) {
            individual.team_code = existingTeam.team_code;
          } else {
            // Auto-generate for continuity
            const newCode = `LAI-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            const { data: newTeam } = await supabaseClient.from('teams').insert([{
              team_code: newCode,
              organization_name: individual.organization_name,
              industry: individual.industry,
              org_size: individual.org_size
            }]).select().single();
            if (newTeam) {
              individual.team_code = newTeam.team_code;
              await supabaseClient.from('diagnostic_results').update({ team_id: newTeam.id }).eq('id', id);
            }
          }
        }
      }
    }

    const { data: participant } = await supabaseClient
      .from('participants')
      .select('name, email')
      .eq('id', individual.participant_id)
      .single();
    
    if (participant) {
      individual.participants = participant;
    }

    let teamData = null;
    const orgName = individual.organization_name;
    const isGeneric = (org) => !org || ['none', 'na', 'test', 'ntu'].includes(org.toLowerCase().trim());

    let teamSearchQuery = null;
    if (individual.team_id) {
      teamSearchQuery = supabaseClient.from('diagnostic_results').select('overall_score, signal_detection_score, cognitive_framing_score, decision_alignment_score, resource_calibration_score, integrated_responsiveness_score').eq('team_id', individual.team_id);
    } else if (orgName && !isGeneric(orgName)) {
      teamSearchQuery = supabaseClient.from('diagnostic_results').select('overall_score, signal_detection_score, cognitive_framing_score, decision_alignment_score, resource_calibration_score, integrated_responsiveness_score').eq('organization_name', orgName);
    }

    if (teamSearchQuery) {
      const { data: teamMembers, error: teamError } = await teamSearchQuery;

      if (!teamError && teamMembers && teamMembers.length > 0) {
        const count = teamMembers.length;
        const averages = {
          overall: teamMembers.reduce((a, b) => a + Number(b.overall_score || 0), 0) / count,
          signal_detection: teamMembers.reduce((a, b) => a + Number(b.signal_detection_score || 0), 0) / count,
          cognitive_framing: teamMembers.reduce((a, b) => a + Number(b.cognitive_framing_score || 0), 0) / count,
          decision_alignment: teamMembers.reduce((a, b) => a + Number(b.decision_alignment_score || 0), 0) / count,
          resource_calibration: teamMembers.reduce((a, b) => a + Number(b.resource_calibration_score || 0), 0) / count,
          integrated_responsiveness: teamMembers.reduce((a, b) => a + Number(b.integrated_responsiveness_score || 0), 0) / count
        };
        teamData = { count, averages };
      }
    }

    res.json({ ...individual, team_insights: teamData });
  } catch (err) {
    console.error(`[API] Error for ${id}:`, err.message);
    res.status(404).json({ error: 'Report not found' });
  }
});

app.post(['/api/diagnostic', '/diagnostic'], async (req, res) => {
  const { 
    name, email, organization_name, industry, region,
    overall_score, signal_detection_score, cognitive_framing_score, resource_calibration_score, decision_alignment_score, integrated_responsiveness_score,
    participation_mode, team_code, role_level, org_size, answers = {}, metadata = {}
  } = req.body;

  try {
    let team_id = null;
    let final_team_code = team_code;

    if (participation_mode === 'team_create' || participation_mode === 'individual') {
      const { data: existingTeam } = await supabaseClient.from('teams').select('id, team_code').eq('creator_email', email).limit(1).single();
      if (existingTeam) {
        final_team_code = existingTeam.team_code;
        team_id = existingTeam.id;
      } else {
        final_team_code = `LAI-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const { data: newTeam } = await supabaseClient.from('teams').insert([{ team_code: final_team_code, organization_name: organization_name || name, creator_email: email }]).select().single();
        team_id = newTeam?.id;
      }
    } else if (team_code) {
      const { data: existingTeam } = await supabaseClient.from('teams').select('id').eq('team_code', team_code.toUpperCase()).single();
      if (existingTeam) team_id = existingTeam.id;
    }

    let participant_id = null;
    try {
      const { data: pData } = await supabaseClient.from('participants').upsert([{ 
        name, 
        email, 
        organization: organization_name, 
        role_level, 
        org_size, 
        participation_mode, 
        team_id 
      }], { onConflict: 'email' }).select().single();
      if (pData) participant_id = pData.id;
    } catch (pe) {
      console.warn("[API] Participant sync failed, continuing without link:", pe.message);
    }

    const { data: diagData, error: diagError } = await supabaseClient.from('diagnostic_results').insert([{
        participant_id, 
        organization_name, 
        industry, 
        region: region || 'Global',
        overall_score, 
        signal_detection_score, 
        cognitive_framing_score, 
        resource_calibration_score, 
        decision_alignment_score, 
        integrated_responsiveness_score,
        team_id, 
        metadata: { 
          ...metadata, 
          answers, // Store answers inside metadata JSONB to avoid schema conflicts
          team_code: final_team_code, 
          is_published: true, 
          recorded_at: new Date().toISOString() 
        }
    }]).select().single();

    if (diagError) {
      console.error("[API] Diagnostic insert failed:", diagError);
      throw diagError;
    }
    if (!diagData) throw new Error("Database failed to return the new report record.");

    const logEmailOp = async (recipient, type, result, reportId = null, category = 'tech', extraLink = null) => {
      try {
        const logData = {
          recipient,
          event_type: type, // Using event_type for consistency
          email_type: type, // Keeping email_type for backward compat if table not updated yet
          event_category: category,
          status: result.status,
          provider_message_id: result.provider_message_id,
          provider_response: result.provider_response,
          error_message: result.error_message,
          report_id: reportId,
          generated_link: extraLink || result.generated_link
        };
        
        const { error } = await supabaseClient.from('email_ops_log').insert([logData]);
        
        if (error) {
          console.error("[CRITICAL] email_ops_log_write_failed:", error.message);
          // Trigger Tech Signal for log failure
          await sendEmail({
            from: getSender('notifications'),
            to: 'tech@evivve.com',
            subject: `[EMAIL OPS][FAIL] Log Write Failed — ${recipient}`,
            html: INTERNAL.opsAlert({
              event_type: 'email_ops_log_write_failed',
              status: 'failed_at_send',
              recipient,
              error_message: error.message
            }),
            type: 'email_ops_log_write_failed'
          });
        }
      } catch (e) {
        console.error("[CRITICAL] Absolute failure in logEmailOp:", e.message);
      }
    };

    // Notifications (Sequential Delivery with Persistence & Failure-First Alerting)
    try {
      const reportLink = `https://adaptiveness.institute/report/perception/${diagData.id}`;
      
      // 1. Participant Report (Primary Goal)
      const resP = await sendEmail({
        from: getSender('research'),
        to: email,
        subject: 'Your Leadership Adaptiveness Profile is Ready',
        html: ESSENTIAL.participantReport({ name, reportId: diagData.id }),
        type: 'participant_report'
      });
      await logEmailOp(email, 'participant_report', resP, diagData.id, 'tech', reportLink);

      // 2. Institutional Onboarding (if applicable)
      if (participation_mode === 'team_create' && final_team_code) {
        const resT = await sendEmail({
          from: getSender('onboarding'),
          to: email,
          subject: 'Your Measurement Cycle Has Been Initiated',
          html: ESSENTIAL.teamOnboarding({ organization: organization_name || name, teamCode: final_team_code }),
          type: 'team_onboarding'
        });
        await logEmailOp(email, 'team_onboarding', resT, diagData.id, 'tech');
        
        // 2b. Sales Signal for Team Creation
        const resSales = await sendEmail({
          from: getSender('notifications'),
          to: 'mmemon@evivve.com',
          subject: `[LEAD] Team Created — ${organization_name || name}`,
          html: INTERNAL.salesAlert({ 
            name, 
            email, 
            organization: organization_name, 
            event_type: 'team_created'
          }),
          type: 'team_created'
        });
        await logEmailOp(email, 'team_created', resSales, diagData.id, 'sales');
      }

      // 3. Technical Signals (Lead completions & failures)
      
      // 3a. Success Signal to Sales
      if (resP.success) {
        await sendEmail({
          from: getSender('notifications'),
          to: 'mmemon@evivve.com',
          subject: `[LEAD] Diagnostic Completed — ${email}`,
          html: INTERNAL.salesAlert({ 
            name, 
            email, 
            organization: organization_name, 
            report_link: reportLink,
            event_type: 'diagnostic_completed'
          }),
          type: 'diagnostic_completed'
        });
        // We don't necessarily need to LOG every internal alert to email_ops_log if it's just a duplicate of the participant one, 
        // but the user wants "logs remain source of truth". I'll log it as a sales event.
        await logEmailOp(email, 'diagnostic_completed', { status: 'accepted_by_provider', success: true }, diagData.id, 'sales', reportLink);
      }

      // 3b. Failure Signal to Tech (Only if participant delivery failed)
      if (!resP.success) {
        await sendEmail({
          from: getSender('notifications'),
          to: 'mmemon@evivve.com',
          subject: `[EMAIL OPS][FAIL] Participant Report — ${email}`,
          html: INTERNAL.opsAlert({
            recipient: email,
            event_type: 'participant_report_failure',
            status: resP.status,
            error_message: resP.error_message,
            report_id: diagData.id,
            generated_link: reportLink
          }),
          type: 'participant_report_failure'
        });
        await logEmailOp(email, 'participant_report_failure', { status: 'accepted_by_provider', success: true }, diagData.id, 'tech', reportLink);
      }

      // 4. Silent Administrative Success Trace (Internal Only)
      console.log(`[Diagnostic-Complete] ID: ${diagData.id} | Email: ${email} | Delivery: ${resP.status}`);

    } catch (e) {
      console.error("[Email Flow Exception]:", e.message);
    }

    res.status(201).json({ id: diagData.id, team_code: final_team_code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected Resend Endpoint with Cooldown
app.post(['/api/resend-report', '/resend-report'], async (req, res) => {
  const { reportId, email } = req.body;
  if (!reportId || !email) return res.status(400).json({ error: 'Report ID and Email required' });

  try {
    // 1. Verify Ownership & Existence (Joins diagnostic_results with participants)
    const { data: report, error: reportErr } = await supabaseClient
      .from('diagnostic_results')
      .select('id, participant_id, participants(email, name)')
      .eq('id', reportId)
      .single();

    if (reportErr || !report || report.participants?.email?.toLowerCase() !== email.toLowerCase()) {
      // Trigger Tech Signal for Auth Failure (Potential probe or abuse)
      await sendEmail({
        from: getSender('notifications'),
        to: 'tech@evivve.com',
        subject: `[EMAIL OPS][AUTH] Resend Denied — ${email}`,
        html: INTERNAL.opsAlert({
          recipient: email,
          event_type: 'resend_endpoint_auth_failed',
          status: 'failed_at_send',
          report_id: reportId,
          error_message: 'Identity mismatch or report not found'
        }),
        type: 'resend_endpoint_auth_failed'
      });
      await logEmailOp(email, 'resend_endpoint_auth_failed', { status: 'failed_at_send' }, reportId, 'tech');
      
      return res.status(403).json({ error: 'Access denied: Profile not linked to this identity.' });
    }

    // 2. Enforce 5-Minute Server-Side Cooldown
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentOps } = await supabaseClient
      .from('email_ops_log')
      .select('created_at')
      .eq('report_id', reportId)
      .eq('recipient', email)
      .eq('status', 'accepted_by_provider')
      .gt('created_at', fiveMinsAgo)
      .order('created_at', { ascending: false })
      .limit(1);

    if (recentOps && recentOps.length > 0) {
      const lastSent = new Date(recentOps[0].created_at);
      const remainingSeconds = Math.max(0, 300 - Math.floor((Date.now() - lastSent.getTime()) / 1000));
      
      // Trigger Tech Signal for Resend Abuse
      await sendEmail({
        from: getSender('notifications'),
        to: 'tech@evivve.com',
        subject: `[EMAIL OPS][ABUSE] Resend Cooldown Hit — ${email}`,
        html: INTERNAL.opsAlert({
          recipient: email,
          event_type: 'resend_abuse',
          status: 'resend_abuse',
          report_id: reportId,
          error_message: `Cooldown active. Remaining: ${remainingSeconds}s`
        }),
        type: 'resend_abuse'
      });
      await logEmailOp(email, 'resend_abuse', { status: 'resend_abuse' }, reportId, 'tech');

      return res.status(429).json({ 
        error: 'Institutional cooldown active.', 
        remainingSeconds 
      });
    }

    const logResendOp = async (recipient, type, result, reportId = null) => {
      await logEmailOp(recipient, type, result, reportId, 'tech');
    };

    // 3. Dispatch Email
    const resP = await sendEmail({
      from: getSender('research'),
      to: email,
      subject: 'Re-Issue: Your Leadership Adaptiveness Profile',
      html: ESSENTIAL.participantReport({ 
        name: report.participants.name, 
        reportId: report.id 
      }),
      type: 'participant_report_resend'
    });

    await logResendOp(email, 'participant_report_resend', resP, report.id);

    if (!resP.success) {
      // Trigger Tech Signal for delivery failure on resend
      await sendEmail({
        from: getSender('notifications'),
        to: 'tech@evivve.com',
        subject: `[EMAIL OPS][FAIL] Resend Failed — ${email}`,
        html: INTERNAL.opsAlert({
          recipient: email,
          event_type: 'resend_delivery_failure',
          status: resP.status,
          error_message: resP.error_message,
          report_id: reportId
        }),
        type: 'resend_delivery_failure'
      });
      return res.status(502).json({ error: 'Provider rejected delivery attempt.', details: resP.error_message });
    }

    res.json({ success: true, status: 'dispatched' });

  } catch (err) {
    console.error("[Resend API Error]:", err.message);
    res.status(500).json({ error: 'Operational failure during re-issue.' });
  }
});

// Debug Email Configuration (Secure)
app.get(['/api/debug/email', '/debug/email'], async (req, res) => {
  res.json({
    debug_version: '1.2.9-HARDENED',
    status: 'Ready',
    resend_check: {
      RESEND_API_KEY: !!process.env.RESEND_API_KEY
    },
    env: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

// Health Checks & Other Routes
// State of Cognition Report Request
app.post(['/api/report-request', '/report-request'], async (req, res) => {
  const { name, email, organization, industry, role, region } = req.body;
  
  try {
    // 1. Log to Database
    if (supabaseClient) {
      await supabaseClient.from('report_leads').insert([{
        name, email, organization, industry, role, region,
        report_type: 'SOC_2026',
        source: 'StateOfCognitionPage'
      }]);
    }

    // 2. Trigger Delivery Email
    const resP = await sendEmail({
      from: getSender('research'),
      to: email,
      subject: 'State of Cognition Report — Institutional Release',
      html: ESSENTIAL.socReportDelivery({ name }),
      type: 'soc_report'
    });
    
    // Log tech event for delivery
    await logEmailOp(email, 'soc_report', resP, null, 'tech');

    // 3. Trigger Sales Signal
    if (resP.success) {
      await sendEmail({
        from: getSender('notifications'),
        to: 'mmemon@evivve.com',
        subject: `[LEAD] SOC Report Requested — ${email}`,
        html: INTERNAL.salesAlert({ 
          name, 
          email, 
          organization, 
          industry,
          event_type: 'soc_report_requested'
        }),
        type: 'soc_report_requested'
      });
      await logEmailOp(email, 'soc_report_requested', { status: 'accepted_by_provider', success: true }, null, 'sales');
    } else {
      // Tech signal for SOC failure
      await sendEmail({
        from: getSender('notifications'),
        to: 'mmemon@evivve.com',
        subject: `[EMAIL OPS][FAIL] SOC Report Failure — ${email}`,
        html: INTERNAL.opsAlert({
          recipient: email,
          event_type: 'soc_report_failure',
          status: resP.status,
          error_message: resP.error_message
        }),
        type: 'soc_report_failure'
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("[SOC Request Error]:", err.message);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

app.get(['/api/teams/:code', '/teams/:code'], async (req, res) => {
  const { code } = req.params;
  try {
    const { data, error } = await supabaseClient.from('teams').select('id, organization_name').eq('team_code', code.toUpperCase()).single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: 'Team not found' });
  }
});

module.exports = { app };
module.exports.handler = serverless(app);
