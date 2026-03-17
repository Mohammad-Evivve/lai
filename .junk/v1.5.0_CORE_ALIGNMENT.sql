-- LAI Core Alignment Upgrade (v1.5.0-FIXED)
-- Safely renames the 5 Evaluation Layer pillars to match Core Architecture.
-- Only touches columns that ACTUALLY EXIST in the DB.

-- The v1.4.0 schema added these 4 columns. Rename them:
ALTER TABLE diagnostic_results RENAME COLUMN strategic_calibration_score  TO cognitive_framing_score;
ALTER TABLE diagnostic_results RENAME COLUMN challenge_networks_score      TO resource_reallocation_score_new;
ALTER TABLE diagnostic_results RENAME COLUMN learning_agility_score        TO decision_alignment_score_new;
ALTER TABLE diagnostic_results RENAME COLUMN psychological_stamina_score   TO execution_responsiveness_score_new;

-- The v1.1.8 schema already has these columns with the correct target names,
-- so the new v1.5.0 dimension columns need new names to avoid collision:
-- resource_reallocation_score exists -> rename the new one to match by dropping old
-- decision_alignment_score exists    -> same
-- execution_responsiveness_score exists -> same

-- Merge the v1.4.0-renamed columns into the original v1.1.8 columns (backfill NULLs):
UPDATE diagnostic_results
  SET resource_reallocation_score = COALESCE(resource_reallocation_score_new, resource_reallocation_score)
  WHERE resource_reallocation_score_new IS NOT NULL;

UPDATE diagnostic_results
  SET decision_alignment_score = COALESCE(decision_alignment_score_new, decision_alignment_score)
  WHERE decision_alignment_score_new IS NOT NULL;

UPDATE diagnostic_results
  SET execution_responsiveness_score = COALESCE(execution_responsiveness_score_new, execution_responsiveness_score)
  WHERE execution_responsiveness_score_new IS NOT NULL;

-- Drop the now-redundant temp columns
ALTER TABLE diagnostic_results DROP COLUMN IF EXISTS resource_reallocation_score_new;
ALTER TABLE diagnostic_results DROP COLUMN IF EXISTS decision_alignment_score_new;
ALTER TABLE diagnostic_results DROP COLUMN IF EXISTS execution_responsiveness_score_new;

-- Rename 'cognitive_score' -> 'signal_interpretation_score' (the first pillar)
ALTER TABLE diagnostic_results RENAME COLUMN cognitive_score TO signal_interpretation_score;

-- cognitive_framing_score is now the renamed strategic_calibration_score (step 1 above).
-- resource_reallocation_score, decision_alignment_score, execution_responsiveness_score
-- already existed with the correct names in v1.1.8 - no further action needed.

-- Add a 'signal_detection_score' fallback alias if it still exists (v1.1.8 legacy)
-- No rename needed — api.js already reads this as a fallback.

-- Final audit log
INSERT INTO scraper_logs (status, summary)
VALUES ('info', 'v1.5.0-CORE-ALIGNMENT: Renamed 5 Pillars to match Evaluation Layer. signal_interpretation_score, cognitive_framing_score, resource_reallocation_score, decision_alignment_score, execution_responsiveness_score.');
