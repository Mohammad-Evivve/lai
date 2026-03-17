-- LAI Compound Intelligence Engine Upgrade (v1.4.0)
-- Transition to Weighted Sovereignty Model and Standardized Taxonomy

-- 1. Update diagnostic_results for Seniority Multiplier
ALTER TABLE diagnostic_results ADD COLUMN IF NOT EXISTS seniority_level TEXT DEFAULT 'middle_management';

-- 2. Add Standardized Pillar Columns (v1.4.0 Taxonomy)
ALTER TABLE diagnostic_results ADD COLUMN IF NOT EXISTS strategic_calibration_score NUMERIC(10,2);
ALTER TABLE diagnostic_results ADD COLUMN IF NOT EXISTS challenge_networks_score NUMERIC(10,2);
ALTER TABLE diagnostic_results ADD COLUMN IF NOT EXISTS learning_agility_score NUMERIC(10,2);
ALTER TABLE diagnostic_results ADD COLUMN IF NOT EXISTS psychological_stamina_score NUMERIC(10,2);

-- 3. Update organizations table for 4-Region model
-- North America, EMEA, APAC, LATAM
COMMENT ON COLUMN organizations.region IS 'v1.4.0 Constrained: North America, EMEA, APAC, LATAM';

-- 4. Audit Log for Upgrade
INSERT INTO scraper_logs (status, summary) 
VALUES ('info', 'System Upgrade to v1.4.0-SOVEREIGN: Schema updated for Seniority Multipliers and New Pillars.');
