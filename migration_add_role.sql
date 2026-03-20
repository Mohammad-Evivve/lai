-- Migration: Add role column to user_status
ALTER TABLE IF EXISTS user_status 
ADD COLUMN IF NOT EXISTS role TEXT;

-- Verify diagnostic_results has all required columns (idempotent)
-- (Already handled in implementation_plan, but for safety)
ALTER TABLE IF EXISTS diagnostic_results
ADD COLUMN IF NOT EXISTS role_level TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
