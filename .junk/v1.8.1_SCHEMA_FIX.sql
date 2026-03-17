-- Final Schema Alignment for Measurement Engine v1.1
-- Migration v1.8.1

-- Add missing score columns to diagnostic_results
ALTER TABLE diagnostic_results 
ADD COLUMN IF NOT EXISTS signal_detection_score INTEGER,
ADD COLUMN IF NOT EXISTS cognitive_framing_score INTEGER,
ADD COLUMN IF NOT EXISTS resource_calibration_score INTEGER,
ADD COLUMN IF NOT EXISTS decision_alignment_score INTEGER,
ADD COLUMN IF NOT EXISTS integrated_responsiveness_score INTEGER,
ADD COLUMN IF NOT EXISTS verified_entity_id UUID REFERENCES organizations(id);

-- Ensure indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_diag_participant_id ON diagnostic_results(participant_id);
CREATE INDEX IF NOT EXISTS idx_diag_team_id ON diagnostic_results(team_id);
