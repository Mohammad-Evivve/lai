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
      version: '1.2.5-ULTRA-STABLE',
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

// Diagnostic Results — Enhanced for Team Insights
app.get(['/api/diagnostic/:id', '/diagnostic/:id'], async (req, res) => {
  const { id } = req.params;
  try {
    const { data: individual, error: individualError } = await supabaseClient
      .from('diagnostic_results')
      .select('*')
      .eq('id', id)
      .single();

    if (individualError) throw individualError;

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

    const { data: participant } = await supabaseClient.from('participants').upsert([{ name, email, organization: organization_name, industry, role_level, org_size, participation_mode, team_id }], { onConflict: 'email' }).select().single();

    const { data: diagData, error: diagError } = await supabaseClient.from('diagnostic_results').insert([{
        participant_id: participant.id, organization_name, industry, region: region || 'Global',
        overall_score, signal_detection_score, cognitive_framing_score, resource_calibration_score, decision_alignment_score, integrated_responsiveness_score,
        answers, team_id, metadata: { ...metadata, team_code: final_team_code, is_published: true, recorded_at: new Date().toISOString() }
    }]).select().single();

    if (diagError) throw diagError;

    // Background Notifications (Fire and Forget)
    (async () => {
      try {
        // A. Internal Alert (Admin)
        await sendEmail({
          from: getSender('notifications'),
          to: 'mmemon@evivve.com',
          subject: `NEW REPORT: ${organization_name || email}`,
          html: INTERNAL.diagnosticCompleted({ 
            name, email, organization_name, 
            report_link: `https://adaptiveness.institute/report/perception/${diagData.id}` 
          })
        });

        // B. Participant Report (Instant Delivery)
        await sendEmail({
          from: getSender('research'),
          to: email,
          subject: 'Your Leadership Adaptiveness Profile is Ready',
          html: ESSENTIAL.participantReport({ 
            name, 
            reportId: diagData.id 
          })
        });

        // C. Institutional Onboarding (if new team created)
        if (participation_mode === 'team_create' && final_team_code) {
          await sendEmail({
            from: getSender('onboarding'),
            to: email,
            subject: 'Institutional Onboarding: Team Measurement Initiated',
            html: ESSENTIAL.teamOnboarding({
              organization: organization_name || name,
              teamCode: final_team_code
            })
          });
        }
      } catch (e) {
        console.error("[Email Trigger Error]:", e.message);
      }
    })();

    res.status(201).json({ id: diagData.id, team_code: final_team_code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
    await sendEmail({
      from: getSender('research'),
      to: email,
      subject: 'Requested Research: The State of Cognition 2026',
      html: ESSENTIAL.socReportDelivery({ name })
    });

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
