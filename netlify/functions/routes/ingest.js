const express = require('express');
const axios = require('axios');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { getOrCreateParticipant } = require('../lib/identity');

// Layer 4 Worker Configuration
const L4_WORKER_URL = `${process.env.SUPABASE_URL}/functions/v1/extract-features`;
const L4_WORKER_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

/**
 * Asynchronously triggers the Layer 4 Feature Extraction worker.
 */
function triggerFeatureExtraction(table, record) {
  if (!L4_WORKER_URL || !L4_WORKER_KEY) {
    console.warn('[L4 TRIGGER]: Missing Supabase credentials. Skipping extraction.');
    return;
  }

  axios.post(L4_WORKER_URL, {
    table,
    record,
    type: 'INSERT'
  }, {
    headers: { 'Authorization': `Bearer ${L4_WORKER_KEY}` }
  }).catch(err => {
    console.error(`[L4 TRIGGER ERROR] (${table}):`, err.response?.data || err.message);
  });
}

/**
 * Endpoint: POST /api/v1/telemetry/ingest
 */
router.post('/telemetry/ingest', async (req, res) => {
  const { session_id, participant_email, source_tier, events } = req.body;

  if (!participant_email || !events || !Array.isArray(events)) {
    return res.status(400).json({ error: 'Missing required payload fields' });
  }

  try {
    const participantId = await getOrCreateParticipant(participant_email);

    const { data: session } = await supabase
      .from('session_metadata')
      .upsert({
        session_id: session_id || undefined,
        source_tier: source_tier || 'T2',
        interpreter_version: 'v1.0.0'
      })
      .select('session_id')
      .single();

    const eventRows = events.map(event => ({
      session_id: session.session_id,
      participant_id: participantId,
      event_type: event.event_type,
      payload: { 
        ...event.payload, 
        mechanic: event.mechanic 
      },
      occurred_at: event.occurred_at || new Date().toISOString()
    }));

    const { data: insertedEvents, error: ingestError } = await supabase
      .from('raw_source_events')
      .insert(eventRows)
      .select();

    if (ingestError) throw ingestError;

    if (insertedEvents) {
      insertedEvents.forEach(evt => triggerFeatureExtraction('raw_source_events', evt));
    }

    res.status(201).json({ 
      status: 'ingested', 
      count: eventRows.length,
      participant_id: participantId 
    });

  } catch (err) {
    console.error('[INGEST ERROR]:', err);
    res.status(500).json({ error: 'Internal ingestion failure', details: err.message });
  }
});

/**
 * Endpoint: POST /api/v1/diagnostic/submit
 */
router.post('/diagnostic/submit', async (req, res) => {
  const { participant_email, team_code, responses } = req.body;

  if (!participant_email || !responses) {
    return res.status(400).json({ error: 'Missing required diagnostic fields' });
  }

  try {
    const participantId = await getOrCreateParticipant(participant_email);

    const { data: submission, error: diagError } = await supabase
      .from('diagnostic_submissions')
      .insert({
        participant_id: participantId,
        team_code_provided: team_code,
        raw_responses: responses,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (diagError) throw diagError;

    if (submission) {
      triggerFeatureExtraction('diagnostic_submissions', submission);
    }

    res.status(201).json({ status: 'submitted', participant_id: participantId });

  } catch (err) {
    console.error('[DIAGNOSTIC ERROR]:', err);
    res.status(500).json({ error: 'Internal diagnostic failure', details: err.message });
  }
});

module.exports = router;
