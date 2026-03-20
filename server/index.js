require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const supabase = require('./supabase');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Prevent server crash on unhandled errors
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]:', reason);
});

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://leadershipadaptiveness.institute', 
    'https://www.leadershipadaptiveness.institute',
    'https://lai.institute',
    'https://www.lai.institute',
    'https://adaptiveness.institute',
    'https://www.adaptiveness.institute'
  ]
}));
app.use(express.json());

// Serve the built React frontend
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// API Routes
const ingestRoutes = require('./routes/ingest');
const deliveryRoutes = require('./routes/delivery');

app.use('/api/v1', ingestRoutes);
app.use('/api/v1/delivery', deliveryRoutes);

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabase.from('user_status').select('count', { count: 'exact', head: true });
    if (error) throw error;
    res.json({ status: 'healthy', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected', error: err.message });
  }
});

// Get Global Index Stats (still from local SQLite seed data)
app.get('/api/stats', (req, res) => {
  try {
    const data = db.prepare('SELECT * FROM global_index_data ORDER BY score DESC').all();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch global stats' });
  }
});

// Submit Diagnostic Result → Supabase
app.post('/api/diagnostic/start', async (req, res) => {
  const { email, name, organization, industry, role_level, org_size, region } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    // Check if user already exists
    const { data: existing } = await supabase
      .from('user_status')
      .select('has_completed')
      .eq('email', email)
      .single();

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

    // ONLY initialize Flow 1 if they haven't completed a diagnostic yet
    if (!existing || !existing.has_completed) {
      updateData.flow_1_step = 0; // Armed
      updateData.flow_1_next_at = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2h delay
    }

    const { error } = await supabase
      .from('user_status')
      .upsert(updateData, { onConflict: 'email' });

    if (error) throw error;

        // --- Trigger Internal Alert (Sales Signal) ---
        if (email && email.includes('@') && !email.includes('example.com')) {
          try {
            const { sendEmail, getSender } = require('./lib/email');
            const { INTERNAL } = require('./lib/emailTemplates');
            await sendEmail({
              from: getSender('notifications'),
              to: 'sales@evivve.com',
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
          } catch (e) {
            console.error('New lead signal trigger failed:', e);
          }
        }

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Start Diagnostic Error:', err);
    res.status(500).json({ error: 'Failed to record start' });
  }
});

// Early Invite Colleagues
app.post('/api/diagnostic/invite', async (req, res) => {
  const { email, name, organization, invites } = req.body;
  if (!email || !invites || !Array.isArray(invites)) {
    return res.status(400).json({ error: 'Email and invites required' });
  }

  try {
    // 1. Generate/Retrieve Team Code
    // Check if user already has a team_code in user_status
    let teamCode;
    const { data: user } = await supabase
      .from('user_status')
      .select('last_team_code')
      .eq('email', email)
      .single();

    if (user && user.last_team_code) {
      teamCode = user.last_team_code;
    } else {
      teamCode = `LAI-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      // Update user_status
      await supabase
        .from('user_status')
        .update({ last_team_code: teamCode })
        .eq('email', email);

      // Register in teams table for report joins
      await supabase
        .from('teams')
        .insert([{ 
          team_code: teamCode, 
          organization_name: organization,
          industry: req.body.industry || null,
          org_size: req.body.org_size || null
        }]);
    }

    // 2. Dispatch Emails
    const { sendEmail, getSender } = require('./lib/email');
    const { INTERNAL, teamInvitation } = require('./lib/emailTemplates');

    const validInvites = invites.filter(inv => inv && inv.includes('@') && inv !== email);
    
    for (const inv of validInvites) {
      try {
        await sendEmail({
          from: getSender('notifications'),
          to: inv,
          subject: 'Your team is measuring its leadership adaptiveness',
          html: teamInvitation({ 
            inviter: name, 
            organization: organization, 
            team_code: teamCode 
          })
        });
      } catch (e) {
        console.error(`Failed to send invite to ${inv}:`, e);
      }
    }

    res.status(200).json({ success: true, team_code: teamCode });
  } catch (err) {
    console.error('Invite Error:', err);
    res.status(500).json({ error: 'Failed to send invitations' });
  }
});

// --- Team Verification ---
app.get('/api/teams/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const { data, error } = await supabase
      .from('user_status')
      .select('company')
      .eq('last_team_code', code.toUpperCase())
      .limit(1)
      .single();

    if (error) throw new Error('Team not found');
    res.json({ id: code, organization_name: data.company });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// --- Diagnostic Retrieval (Report) ---
app.get('/api/diagnostic/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`[API] GET /api/diagnostic/${id} - Retrieving report...`);
  try {
    // 1. Fetch individual result with team_code joined
    const { data: individual, error: individualError } = await supabase
      .from('diagnostic_results')
      .select('*, teams(team_code)')
      .eq('id', id)
      .single();
      
    if (individualError) throw individualError;
    
    console.log(`[DEBUG] Individual diagnostic retrieved for ID: ${id}`);
    console.log(`[DEBUG] team_id: ${individual.team_id}`);
    console.log(`[DEBUG] Raw individual.teams:`, individual.teams);

    // Flatten team_code from the joined object
    if (individual.teams) {
      individual.team_code = individual.teams.team_code;
      delete individual.teams;
    } 
    
    // Fallback logic for team_code
    if (!individual.team_code) {
      if (individual.team_id) {
        // Manual lookup by team_id
        const { data: teamObj } = await supabase.from('teams').select('team_code').eq('id', individual.team_id).single();
        if (teamObj) individual.team_code = teamObj.team_code;
      } else if (individual.organization_name) {
        // 1. Try to find existing team for this org
        const { data: existingTeam } = await supabase.from('teams')
          .select('team_code')
          .ilike('organization_name', individual.organization_name.trim())
          .limit(1)
          .maybeSingle();
        
        if (existingTeam) {
          individual.team_code = existingTeam.team_code;
        } else {
          // 2. Auto-generate a team for this report to enable invitations
          const newCode = `LAI-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          const { data: newTeam } = await supabase.from('teams').insert([{
            team_code: newCode,
            organization_name: individual.organization_name,
            industry: individual.industry,
            org_size: individual.org_size
          }]).select().single();
          
          if (newTeam) {
            individual.team_code = newTeam.team_code;
            individual.team_id = newTeam.id;
            // Update the report record to link it permanently
            await supabase.from('diagnostic_results').update({ team_id: newTeam.id }).eq('id', id);
          }
        }
      }
    }

    // 2. Fetch team insights
    let teamData = null;
    const isGeneric = (org) => !org || ['none', 'n/a', 'na', 'test', 'personal', 'ntu'].includes(org.toLowerCase().trim());

    // Strategy: Prioritize team_id, fallback to organization_name ONLY if not generic
    let teamSearchQuery = null;
    if (individual.team_id) {
      teamSearchQuery = supabase.from('diagnostic_results').select('overall_score, signal_detection_score, cognitive_framing_score, decision_alignment_score, resource_calibration_score, integrated_responsiveness_score').eq('team_id', individual.team_id);
    } else if (individual.organization_name && !isGeneric(individual.organization_name)) {
      teamSearchQuery = supabase.from('diagnostic_results').select('overall_score, signal_detection_score, cognitive_framing_score, decision_alignment_score, resource_calibration_score, integrated_responsiveness_score').eq('organization_name', individual.organization_name);
    }

    if (teamSearchQuery) {
      const { data: teamMembers, error: teamError } = await teamSearchQuery;

      if (!teamError && teamMembers && teamMembers.length > 0) {
        const count = teamMembers.length;
        const averages = {
          overall: teamMembers.reduce((a, b) => a + Number(b.overall_score), 0) / count,
          signal_detection: teamMembers.reduce((a, b) => a + Number(b.signal_detection_score), 0) / count,
          cognitive_framing: teamMembers.reduce((a, b) => a + Number(b.cognitive_framing_score), 0) / count,
          decision_alignment: teamMembers.reduce((a, b) => a + Number(b.decision_alignment_score), 0) / count,
          resource_calibration: teamMembers.reduce((a, b) => a + Number(b.resource_calibration_score), 0) / count,
          integrated_responsiveness: teamMembers.reduce((a, b) => a + Number(b.integrated_responsiveness_score), 0) / count
        };

        // Calculate simple variance
        let variance = {};
        const dims = ['signal_detection', 'cognitive_framing', 'decision_alignment', 'resource_calibration', 'integrated_responsiveness'];
        dims.forEach(dim => {
          const scores = teamMembers.map(m => Number(m[`${dim}_score`] || 0));
          const diff = Math.max(...scores) - Math.min(...scores);
          const label = diff <= 15 ? 'Low alignment variance' : diff <= 30 ? 'Moderate alignment variance' : 'High alignment variance';
          variance[dim] = { label, diff };
        });

        teamData = { count, averages, variance };
      }
    }

    res.json({ ...individual, team_insights: teamData });
  } catch (err) {
    console.error(`[API] Fetch Error for ID ${id}:`, err.message);
    res.status(404).json({ error: 'Report not found' });
  }
});

app.post('/api/diagnostic', async (req, res) => {
  const { 
    email,
    organization_name, industry, region, role_level, org_size,
    overall_score, 
    signal_detection_score, 
    cognitive_framing_score, 
    resource_calibration_score, 
    decision_alignment_score, 
    integrated_responsiveness_score,
    answers,
    team_code
  } = req.body;
  
  try {
    // 0. Resolve team_id if team_code provided
    let teamId = null;
    if (team_code) {
      const { data: teamData } = await supabase
        .from('teams')
        .select('id')
        .eq('team_code', team_code.toUpperCase())
        .single();
      if (teamData) teamId = teamData.id;
    }

    const { data: diagData, error: diagError } = await supabase
      .from('diagnostic_results')
      .insert([{
        organization_name,
        industry,
        region,
        overall_score,
        signal_detection_score,
        cognitive_framing_score,
        resource_calibration_score,
        decision_alignment_score,
        integrated_responsiveness_score,
        team_id: teamId
      }])
      .select();

    if (diagError) throw diagError;

    if (email) {
      // Calculate top and lowest dimensions
      const dimScores = {
        'Signal Detection': signal_detection_score || 0,
        'Cognitive Framing': cognitive_framing_score || 0,
        'Decision Alignment': decision_alignment_score || 0,
        'Resource Calibration': resource_calibration_score || 0,
        'Integrated Responsiveness': integrated_responsiveness_score || 0
      };
      const entries = Object.entries(dimScores).filter(([_, v]) => v !== undefined && v !== null);
      let topDim = null;
      let lowestDim = null;
      if (entries.length > 0) {
        entries.sort((a, b) => b[1] - a[1]);
        topDim = entries[0][0];
        lowestDim = entries[entries.length - 1][0];
      }

      await supabase
        .from('user_status')
        .update({
          has_completed: true,
          role: req.body.role_level || null,
          flow_1_next_at: null, // Clear Flow 1
          flow_2_step: 0, // Armed for immediate
          flow_2_next_at: new Date().toISOString(), // Immediate
          flow_3_step: 0, // Armed for fallback
          flow_3_next_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // Fallback (72h)
          top_dimension: topDim,
          lowest_dimension: lowestDim,
          last_activity_at: new Date().toISOString()
        })
        .eq('email', email);

      res.status(201).json({ id: diagData[0].id });

      // --- Background Processing: Notifications ---
      (async () => {
        try {
          const { sendEmail, getSender } = require('./lib/email');
          const { INTERNAL, FLOW_4 } = require('./lib/emailTemplates');

          // 1. Team Update (Flow 4)
          const isGenericOrg = (org) => !org || ['none', 'n/a', 'na', 'test', 'personal'].includes(org.toLowerCase().trim());
          if (organization_name && !isGenericOrg(organization_name)) {
            const { data: teamMembers } = await supabase
              .from('user_status')
              .select('email, last_team_update_at')
              .eq('company', organization_name)
              .eq('has_completed', true)
              .eq('has_submitted_intake', false)
              .neq('email', email);
              
            if (teamMembers && teamMembers.length > 0) {
              const nowMs = Date.now();
              const rateLimitMs = 6 * 60 * 60 * 1000; // 6 hours
              
              for (const member of teamMembers) {
                const lastUpdateMs = member.last_team_update_at ? new Date(member.last_team_update_at).getTime() : 0;
                if (nowMs - lastUpdateMs >= rateLimitMs) {
                  await sendEmail({
                    from: getSender('notifications'),
                    to: member.email,
                    subject: 'New diagnostic completed matching your team',
                    html: FLOW_4.teamUpdate(diagData[0].id)
                  });
                  
                  await supabase
                    .from('user_status')
                    .update({ last_team_update_at: new Date(nowMs).toISOString() })
                    .eq('email', member.email);
                }
              }
            }
          }

          // 2. Internal Signals (Sales & Tech)
          const reportLink = `https://lai.institute/report/perception/${diagData[0].id}`;
          
          // 2a. Success Signal to Sales
          await sendEmail({
            from: getSender('notifications'),
            to: 'sales@evivve.com',
            subject: `[LEAD] Diagnostic Completed — ${email}`,
            html: INTERNAL.salesAlert({
              name: req.body.name,
              email,
              organization: organization_name,
              role_level: req.body.role_level,
              report_link: reportLink,
              event_type: 'diagnostic_completed'
            }),
            type: 'diagnostic_completed'
          });
          
          // Note: In local server, we don't have logEmailOp yet, but we'll monitor via console
          console.log(`[SIGNAL] Sales: Diagnostic Completed for ${email}`);

        } catch (bgErr) {
          console.error('[BACKGROUND] Notification Error:', bgErr);
        }
      })();
    } else {
      res.status(201).json({ id: diagData[0].id });
    }
  } catch (err) {
    console.error('Supabase insert error:', err);
    res.status(500).json({ error: 'Failed to save diagnostic outcome' });
  }
});

app.post('/api/report/viewed', async (req, res) => {
  const { reportId, email } = req.body;
  
  if (!reportId && !email) {
    return res.status(400).json({ error: 'reportId or email required' });
  }

  try {
    let targetEmail = email;

    if (!targetEmail && reportId) {
      // Find the org for this report to try to match the user
      // Note: Ideally, diagnostic_results should store the email, 
      // but matching by recent company submission is a workable fallback
      const { data: diag } = await supabase
        .from('diagnostic_results')
        .select('organization_name')
        .eq('id', reportId)
        .single();
        
      if (diag && diag.organization_name) {
        const { data: users } = await supabase
          .from('user_status')
          .select('email')
          .eq('company', diag.organization_name)
          .order('last_activity_at', { ascending: false })
          .limit(1);
          
        if (users && users.length > 0) {
          targetEmail = users[0].email;
        }
      }
    }

    if (targetEmail) {
      await supabase
        .from('user_status')
        .update({
          has_viewed_report: true,
          flow_2_next_at: null, // Clear Flow 2
          flow_3_step: 1, // Start proper Flow 3 (Email 1 already queued as fallback at 0)
          flow_3_next_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
          last_activity_at: new Date().toISOString()
        })
        .eq('email', targetEmail)
        .eq('has_viewed_report', false); // Idempotency: only move if first time
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Supabase report viewed error:', err);
    res.status(500).json({ error: 'Failed to record report view' });
  }
});

// Submit Demo Request → Supabase
app.post('/api/demo-request', async (req, res) => {
  const { name, email, organization } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('demo_requests')
      .insert([{ name, email, organization }])
      .select();

    if (error) throw error;

    // --- Trigger Internal Alert (Sales Signal) ---
    try {
      const { sendEmail, getSender } = require('./lib/email');
      const { INTERNAL } = require('./lib/emailTemplates');
      await sendEmail({
        from: getSender('notifications'),
        to: 'sales@evivve.com',
        subject: `[LEAD] Demo Requested — ${organization || email}`,
        html: INTERNAL.salesAlert({ 
          name, 
          email, 
          organization, 
          event_type: 'demo_requested'
        }),
        type: 'demo_requested'
      });
    } catch (e) {
      console.error('Demo request signal trigger failed:', e);
    }

    res.status(201).json({ id: data[0].id });
  } catch (err) {
    console.error('Supabase insert error:', err);
    res.status(500).json({ error: 'Failed to process demo request' });
  }
});

// Submit Report Request (State of Cognition) → Supabase + Email
app.post('/api/report-request', async (req, res) => {
  const { name, email, organization, role, region } = req.body;
  try {
    const { data, error } = await supabase
      .from('report_leads')
      .insert([{ name, email, organization, role, region, source: 'state_of_cognition' }])
      .select();

    if (error) throw error;

    // Trigger Internal Alert and User Email
    try {
      const { sendEmail, getSender } = require('./lib/email');
      
      // Internal Alert (Sales Signal)
      await sendEmail({
        from: getSender('notifications'),
        to: 'sales@evivve.com',
        subject: `[LEAD] SOC Report Requested — ${email}`,
        html: INTERNAL.salesAlert({ 
          name, 
          email, 
          organization, 
          role,
          region,
          event_type: 'soc_report_requested'
        }),
        type: 'soc_report_requested'
      });

      // User Email with PDF link
      await sendEmail({
        from: getSender('insights'),
        to: email,
        subject: 'Your Download: The State of Cognition 2026',
        html: `<p>Dear ${name},</p>
               <p>Thank you for your interest in the Leadership Adaptiveness Institute’s latest research.</p>
               <p>You can access the full "State of Cognition 2026" report via the secure link below:</p>
               <p><a href="https://lai.institute/docs/State_of_Cognition_2026.pdf" style="display:inline-block;padding:12px 24px;background:#2dd4bf;color:#0a192f;text-decoration:none;font-weight:bold;border-radius:4px;">Download Full Report (PDF)</a></p>
               <p>Best regards,<br/>The LAI Research Team</p>`
      });
    } catch (e) {
      console.error('Report email trigger failed:', e);
    }

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Report request error:', err);
    res.status(500).json({ error: 'Failed to process report request' });
  }
});

// Get Global Analytics (Heatmap/Regional Data) → Supabase
app.get('/api/analytics/global', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('diagnostic_results')
      .select('region, overall_score, signal_score, emotional_score, resource_score, decision_score, execution_score')
      .not('region', 'is', null)
      .neq('region', '');

    if (error) throw error;

    // Aggregate by region in JS
    const regionMap = {};
    for (const row of data) {
      if (!regionMap[row.region]) {
        regionMap[row.region] = { region: row.region, participants: 0, totals: { overall: 0, signal: 0, emotional: 0, resource: 0, decision: 0, execution: 0 } };
      }
      const r = regionMap[row.region];
      r.participants++;
      r.totals.overall += row.overall_score;
      r.totals.signal += row.signal_score;
      r.totals.emotional += row.emotional_score;
      r.totals.resource += row.resource_score;
      r.totals.decision += row.decision_score;
      r.totals.execution += row.execution_score;
    }

    const result = Object.values(regionMap).map(r => ({
      region: r.region,
      participants: r.participants,
      avg_score: +(r.totals.overall / r.participants).toFixed(1),
      avg_signal: +(r.totals.signal / r.participants).toFixed(1),
      avg_emotional: +(r.totals.emotional / r.participants).toFixed(1),
      avg_resource: +(r.totals.resource / r.participants).toFixed(1),
      avg_decision: +(r.totals.decision / r.participants).toFixed(1),
      avg_execution: +(r.totals.execution / r.participants).toFixed(1),
    })).sort((a, b) => b.avg_score - a.avg_score);

    res.json(result);
  } catch (err) {
    console.error('Supabase analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch global analytics' });
  }
});

// Email Scheduler & Templates
const { sendEmail } = require('./lib/email');
const { FLOW_1, FLOW_2, FLOW_3, FLOW_4, INTERNAL } = require('./lib/emailTemplates');

// Initialize Scheduler
const runEmailScheduler = async () => {
  try {
    console.log(`[${new Date().toISOString()}] Email scheduler: Checking for pending transmissions...`);
    const { data: users, error } = await supabase
      .from('user_status')
      .select('*')
      .eq('has_submitted_intake', false);

    if (error) throw error;
    if (!users || users.length === 0) return;

    const now = new Date();

    for (const user of users) {
      let emailSent = false;
      let updatePayload = {};

      const canSend = (nextAt) => {
        if (!nextAt) return false;
        return now >= new Date(nextAt);
      };

      // Helper to log event
      const logEvent = async (flow, step, subject, status, errorMsg = null) => {
        await supabase.from('email_events').insert([{
          email: user.email,
          company: user.company,
          flow,
          step,
          subject,
          status,
          error_message: errorMsg
        }]);
      };

      const dispatch = async (flow, step, subject, html, nextStep, nextDelayHours = null, from = null) => {
        try {
          if (!user.email || user.email.includes('example.com') || !user.email.includes('@')) {
            console.warn(`[SCHEDULER] Skipping invalid email: ${user.email}`);
            return null;
          }
          const { sendEmail } = require('./lib/email');
          const result = await sendEmail({ to: user.email, subject, html, from });
          
          if (result && !result.error) {
            await logEvent(flow, step, subject, 'sent');
            emailSent = true;
            return {
              [`${flow.toLowerCase().replace(' ', '_')}_step`]: nextStep,
              [`${flow.toLowerCase().replace(' ', '_')}_next_at`]: nextDelayHours 
                ? new Date(Date.now() + nextDelayHours * 60 * 60 * 1000).toISOString() 
                : null,
              last_activity_at: new Date().toISOString()
            };
          } else {
            await logEvent(flow, step, subject, 'failed', result?.error?.message || 'Unknown error');
          }
        } catch (e) {
          await logEvent(flow, step, subject, 'failed', e.message);
        }
        return null;
      };

      // Priority 1: FLOW 3 (Conversion)
      if (canSend(user.flow_3_next_at) && user.flow_3_step < 3) {
        let subject, html, nextStep, nextDelay;
        
        if (user.flow_3_step === 0) { // Fallback Entry
          subject = 'Your leadership system is telling two different stories';
          html = FLOW_3.step0();
          nextStep = 2; // Move to after-sent-1 state
          nextDelay = 24 * 3; // 72h + 72h = Day 6 (approx)
        } else if (user.flow_3_step === 1) { // Normal Start (after view)
          subject = 'Alignment is not tested in meetings';
          html = FLOW_3.step1(); 
          nextStep = 2;
          nextDelay = 48; // +2 days
        } else if (user.flow_3_step === 2) {
          subject = 'Observe real decision patterns before your next offsite';
          html = FLOW_3.step2();
          nextStep = 3;
          nextDelay = null;
        }

        if (html) {
          const { FROM_INSIGHTS } = require('./lib/email');
          const resultPayload = await dispatch('Flow 3', user.flow_3_step, subject, html, nextStep, nextDelay, FROM_INSIGHTS);
          if (resultPayload) {
             updatePayload = { ...updatePayload, ...resultPayload };
          }
        }
      }

      // Priority 2: FLOW 2 (Report)
      if (!emailSent && canSend(user.flow_2_next_at) && user.flow_2_step < 3) {
        const { data: latestDiag } = await supabase
           .from('diagnostic_results')
           .select('id')
           .eq('organization_name', user.company)
           .order('created_at', { ascending: false })
           .limit(1);
        const reportId = latestDiag?.[0]?.id || 'demo';

        let subject, html, nextStep, nextDelay;
        if (user.flow_2_step === 0) {
          subject = 'Your leadership system is already showing signals';
          html = FLOW_2.step0(reportId, user);
          nextStep = 1;
          nextDelay = 24;
        } else if (user.flow_2_step === 1) {
          subject = 'A pattern we’re seeing across leadership systems';
          html = FLOW_2.step1(reportId);
          nextStep = 2;
          nextDelay = 48;
        } else if (user.flow_2_step === 2) {
          subject = 'Your system may be overestimating its adaptiveness';
          html = FLOW_2.step2(reportId);
          nextStep = 3;
          nextDelay = null;
        }

        if (html) {
          const { FROM_INSIGHTS } = require('./lib/email');
          const resultPayload = await dispatch('Flow 2', user.flow_2_step, subject, html, nextStep, nextDelay, FROM_INSIGHTS);
          if (resultPayload) updatePayload = { ...updatePayload, ...resultPayload };
        }
      }

      // Priority 3: FLOW 1 (Incomplete)
      if (!emailSent && canSend(user.flow_1_next_at) && user.flow_1_step < 3) {
        const link = 'https://lai.institute/diagnostic';
        let subject, html, nextStep, nextDelay;
        
        if (user.flow_1_step === 0) {
          subject = 'The signal from your leadership system is incomplete';
          html = FLOW_1.step0(link);
          nextStep = 1;
          nextDelay = 22;
        } else if (user.flow_1_step === 1) {
          subject = 'Most leadership patterns remain invisible from here';
          html = FLOW_1.step1(link);
          nextStep = 2;
          nextDelay = 48;
        } else if (user.flow_1_step === 2) {
          subject = 'Your system view is still pending';
          html = FLOW_1.step2(link);
          nextStep = 3;
          nextDelay = null;
        }

        if (html) {
          const { FROM_INSIGHTS } = require('./lib/email');
          const resultPayload = await dispatch('Flow 1', user.flow_1_step, subject, html, nextStep, nextDelay, FROM_INSIGHTS);
          if (resultPayload) updatePayload = { ...updatePayload, ...resultPayload };
        }
      }

      if (emailSent && Object.keys(updatePayload).length > 0) {
        await supabase.from('user_status').update(updatePayload).eq('email', user.email);
      }
    }
  } catch (err) {
    console.error('[SCHEDULER ERROR]:', err.message);
  }
};

// Research Resources — Production Logic (v1.2.0-FINAL)
app.get('/api/resources', async (req, res) => {
  try {
    const { data: dbAssets, error } = await supabase
      .from('research_resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fallback to Golden Templates if the table is empty (hydration in progress)
    if (!dbAssets || dbAssets.length === 0) {
      return res.json([
        {
          id: 'gt1',
          title:       'The $4M Cost of Rigid Decision Cycles: LAI Score ROI Model for 2026',
          type:        'Framework',
          category:    'Framework',
          description: 'A capital-allocation and decision-velocity model for global executives. This framework quantifies the direct ROI of adaptiveness investment across 602+ behavioral simulations.',
          link:        '#',
          icon_type:   'target',
          created_at: new Date().toISOString()
        },
        {
          id: 'gt2',
          title:       'Benchmarking Volatility Response: 602 Game Datasets Analyzed',
          type:        'Report',
          category:    'Report',
          description: 'Executive-grade analysis of 602 leadership simulation datasets. Isolates behavioral patterns driving competitive separation: signal lag and resource reallocation velocity.',
          link:        '#',
          icon_type:   'pie',
          created_at: new Date().toISOString()
        },
        {
          id: 'gt3',
          title:       'PG Miners vs Baseline: A Study in Divergent Signal Detection',
          type:        'Case Study',
          category:    'Case Study',
          description: 'High-stakes comparison of organizations at opposite ends of the Adaptiveness spectrum. Maps signal detection speed against real-world outcome divergence.',
          link:        '#',
          icon_type:   'building',
          created_at: new Date().toISOString()
        },
        {
          id: 'gt4',
          title:       'The Antifragile Advantage: Why Adaptive Leaders Outperform in Volatile Sectors',
          type:        'Article',
          category:    'Article',
          description: 'A concise executive read on the cost of cognitive rigidity. Covers how activation latency translates into revenue loss and competitive displacement.',
          link:        '#',
          icon_type:   'text',
          created_at: new Date().toISOString()
        },
        {
          id: 'gt5',
          title:       '2026 Board Intelligence: Bridging the Leadership Adaptiveness Gap',
          type:        'Strategic Deck',
          category:    'Strategic Deck',
          description: 'Board-ready deck synthesizing live LAI Intelligence for stakeholders. Covers sector volatility rotation and prioritized roadmaps for closing the adaptiveness gap.',
          link:        '#',
          icon_type:   'chart',
          created_at: new Date().toISOString()
        }
      ]);
    }

    res.json(dbAssets);
  } catch (err) {
    console.error('Resources Error:', err);
    res.json([]);
  }
});

// Live Research Signals — Production Logic (v1.2.0-FINAL)
app.get('/api/research/live', async (req, res) => {
  try {
    const [logsRes, diagRes] = await Promise.all([
      supabase
        .from('scraper_logs')
        .select('*')
        .in('status', ['signal', 'success', 'info'])
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('diagnostic_results')
        .select('organization_name, region, overall_score, session_date, duration_seconds, metadata')
        .order('created_at', { ascending: false })
        .limit(15),
    ]);

    const logs = (logsRes.data || []).map(l => ({
      id:               l.id,
      created_at:       l.created_at,
      summary:          l.summary,
      status:           l.status
    }));

    const diag = (diagRes.data || []).map(d => {
      const score = d.overall_score || 75;
      const tier = score >= 70 ? 'Antifragile' : score >= 40 ? 'Emergent' : 'Fragile';
      
      return {
        ...d,
        overall_score: score,
        summary: d.metadata?.summary ||
          `LAI Score: ${score} ${tier.toUpperCase()} — ${d.organization_name} | Adaptive Capacity Validated via AFERR Translation Layer.`,
      };
    });

    const merged = [];
    const maxLen = Math.max(logs.length, diag.length);
    for (let i = 0; i < maxLen; i++) {
      if (logs[i]) merged.push(logs[i]);
      if (diag[i]) merged.push(diag[i]);
    }

    res.json(merged.slice(0, 25));
  } catch (err) {
    console.error('Research Live Error:', err);
    res.json([]);
  }
});

// Start scheduler (runs every minute)
setInterval(runEmailScheduler, 60 * 1000);

app.post('/api/test-email', async (req, res) => {
  try {
    const { sendEmail, getSender } = require('./lib/email');
    const { FLOW_1, FLOW_2, FLOW_3, FLOW_4, INTERNAL } = require('./lib/emailTemplates');
    
    let html, subject, sender;
    const to = req.body.to || process.env.TEST_EMAIL_RECIPIENT || 'insights@adaptiveness.institute';
    const type = req.body.type || 'incomplete_0';

    if (type.startsWith('incomplete_')) {
      const step = parseInt(type.split('_')[1]);
      html = FLOW_1[`step${step}`]('https://lai.institute/diagnostic');
      subject = [
        'The signal from your leadership system is incomplete',
        'Most leadership patterns remain invisible from here',
        'Your system view is still pending'
      ][step];
      sender = getSender('insights');
    } else if (type.startsWith('completed_')) {
      const step = parseInt(type.split('_')[1]);
      html = FLOW_2[`step${step}`]('demo-report-id');
      subject = [
        'Your leadership system is already showing signals',
        'A pattern we’re seeing across leadership systems',
        'Your system may be overestimating its adaptiveness'
      ][step];
      sender = getSender('insights');
    } else if (type.startsWith('viewed_')) {
      const step = parseInt(type.split('_')[1]);
      html = FLOW_3[`step${step}`]();
      subject = [
        'Your leadership system is telling two different stories',
        'Alignment is not tested in meetings',
        'Observe real decision patterns before your next offsite'
      ][step];
      sender = getSender('insights');
    } else if (type === 'team_0') {
      html = FLOW_4.step0('demo-report-id');
      subject = 'New signal added to your leadership system';
      sender = getSender('notifications');
    } else if (type === 'alert_diag') {
      html = INTERNAL.diagnosticCompleted({ name: 'Test User', organization_name: 'Test Org', report_link: '#' });
      subject = 'ALERT: DIAGNOSTIC COMPLETED | Test User';
      sender = getSender('notifications');
    } else if (type === 'alert_intake') {
      html = INTERNAL.intakeSubmitted({ org_name: 'Test Org', contact_name: 'Test Contact' });
      subject = 'HIGH INTENT: OFFSITE INTAKE | Test Org';
      sender = getSender('notifications');
    }

    await sendEmail({ from: sender, to, subject, html });
    res.json({ success: true, message: `Test email (${type}) sent via ${sender}` });
  } catch (e) {
    console.error('Test email failed:', e);
    res.status(500).json({ error: 'Email failed', details: e.message });
  }
});

// SPA catch-all: any route not handled by API returns the React app
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`LAI Backend running on http://0.0.0.0:${PORT}`);
  console.log('Email scheduler initiated.');
});
