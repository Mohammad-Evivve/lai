const crypto = require('crypto');
const { supabase } = require('./supabase');

/**
 * Hashes an email using SHA-256 for PII sequestration.
 * @param {string} email - The raw email address.
 * @returns {string} - The hex-encoded hash.
 */
function hashEmail(email) {
  if (!email || typeof email !== 'string') return null;
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
}

/**
 * Resolves a participant_id from an email.
 * If the link exists, returns the participant_id.
 * If not, creates a new participant and a new linkage.
 * @param {string} email - The raw email address.
 * @returns {Promise<string>} - The participant_id.
 */
async function getOrCreateParticipant(email) {
  const emailHash = hashEmail(email);
  if (!emailHash) throw new Error('Invalid email provided');

  // 1. Check if identity linkage exists
  const { data: linkage, error: linkError } = await supabase
    .from('identity_linkages')
    .select('participant_id')
    .eq('email_hash', emailHash)
    .single();

  if (linkage) {
    return linkage.participant_id;
  }

  // 2. If no linkage, create new participant record
  const { data: participant, error: pError } = await supabase
    .from('participants')
    .insert({})
    .select('id')
    .single();

  if (pError) throw pError;

  // 3. Create the linkage
  const { error: lError } = await supabase
    .from('identity_linkages')
    .insert({
      email_hash: emailHash,
      participant_id: participant.id,
      is_primary: true
    });

  if (lError) throw lError;

  return participant.id;
}

module.exports = {
  hashEmail,
  getOrCreateParticipant
};
