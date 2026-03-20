const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:5000/api/v1';
const TEST_EMAIL = 'rebuild_test_' + Math.random().toString(36).substring(7) + '@example.com';

/**
 * Verifies that the PII-safe ingestion works.
 */
async function verifyIngestion() {
  console.log('--- LAI CORE REBUILD: INGESTION VERIFICATION ---');
  console.log('Target Email:', TEST_EMAIL);

  try {
    // 1. Submit Diagnostic (T3)
    console.log('\n[Phase 1] Submitting Diagnostic (T3)...');
    const diagResponse = await axios.post(`${BASE_URL}/diagnostic/submit`, {
      participant_email: TEST_EMAIL,
      team_code: 'TEST-CORE-1',
      responses: { q1: 10, q2: 8, q3: 9 }
    });
    const firstParticipantId = diagResponse.data.participant_id;
    console.log('✔ Diagnostic Submitted. Participant ID (L1):', firstParticipantId);

    // 2. Submit Telemetry (T2) - Same Email
    console.log('\n[Phase 2] Submitting Telemetry (T2) with same email...');
    const teleResponse = await axios.post(`${BASE_URL}/telemetry/ingest`, {
      session_id: crypto.randomUUID(),
      participant_email: TEST_EMAIL,
      source_tier: 'T2',
      events: [
        {
          event_type: 'offer_accepted',
          mechanic: 'offer_decision',
          payload: { latency_ms: 420 },
          occurred_at: new Date().toISOString()
        }
      ]
    });
    const secondParticipantId = teleResponse.data.participant_id;
    console.log('✔ Telemetry Ingested. Participant ID (L1):', secondParticipantId);

    // 3. Verify Identity Rule: Same Email = Same Participant
    if (firstParticipantId === secondParticipantId) {
      console.log('\n💎 IDENTITY RULE VERIFIED: Participant IDs match for same email.');
    } else {
      console.error('\n❌ IDENTITY RULE FAILURE: Participant IDs do not match!');
      process.exit(1);
    }

    // 4. Submit with DIFFERENT Email
    console.log('\n[Phase 3] Submitting with a DIFFERENT email...');
    const diffEmail = 'other_' + TEST_EMAIL;
    const diffResponse = await axios.post(`${BASE_URL}/diagnostic/submit`, {
      participant_email: diffEmail,
      responses: { q1: 1 }
    });
    const diffParticipantId = diffResponse.data.participant_id;
    console.log('✔ Second email ID:', diffParticipantId);

    if (diffParticipantId !== firstParticipantId) {
      console.log('✔ SEPARATION VERIFIED: Different emails got different IDs.');
    } else {
      console.error('❌ SEPARATION FAILURE: Different emails got the same ID!');
      process.exit(1);
    }

    console.log('\n--- VERIFICATION SUCCESSFUL ---');

  } catch (err) {
    console.error('\n✖ VERIFICATION FAILED:', err.response?.data || err.message);
    process.exit(1);
  }
}

verifyIngestion();
