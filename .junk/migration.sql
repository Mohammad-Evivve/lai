-- LAI System Stabilization: Final SQL Migration (v1.1.8)
-- Run this in the Supabase SQL Editor to achieve the standard AFERR schema and RLS bypass.

-- 1. Create/Update Tables
CREATE TABLE IF NOT EXISTS organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT UNIQUE NOT NULL,
    region TEXT DEFAULT 'Global',
    industry TEXT,
    last_scanned TIMESTAMPTZ
);

ALTER TABLE diagnostic_results 
ADD COLUMN IF NOT EXISTS organization_name TEXT,
ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'Global',
ADD COLUMN IF NOT EXISTS overall_score NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS signal_detection_score NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS emotional_framing_score NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS resource_reallocation_score NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS decision_alignment_score NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS execution_responsiveness_score NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS session_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- Ensure existing columns have the correct precision
ALTER TABLE diagnostic_results ALTER COLUMN overall_score TYPE NUMERIC(10,2);
ALTER TABLE diagnostic_results ALTER COLUMN signal_detection_score TYPE NUMERIC(10,2);
ALTER TABLE diagnostic_results ALTER COLUMN emotional_framing_score TYPE NUMERIC(10,2);
ALTER TABLE diagnostic_results ALTER COLUMN resource_reallocation_score TYPE NUMERIC(10,2);
ALTER TABLE diagnostic_results ALTER COLUMN decision_alignment_score TYPE NUMERIC(10,2);
ALTER TABLE diagnostic_results ALTER COLUMN execution_responsiveness_score TYPE NUMERIC(10,2);

-- 2. Security & RLS Policies
ALTER TABLE diagnostic_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraper_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Allow Service Role to do everything (Fail-safe for backend)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Enable all for service_role" ON diagnostic_results;
    CREATE POLICY "Enable all for service_role" ON diagnostic_results FOR ALL TO service_role USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Enable all for service_role" ON scraper_logs;
    CREATE POLICY "Enable all for service_role" ON scraper_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Enable all for service_role" ON organizations;
    CREATE POLICY "Enable all for service_role" ON organizations FOR ALL TO service_role USING (true) WITH CHECK (true);
END
$$;

-- Allow Public/Anon READ access for the dashboard
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public read" ON diagnostic_results;
    CREATE POLICY "Allow public read" ON diagnostic_results FOR SELECT TO anon USING (true);
    
    DROP POLICY IF EXISTS "Allow public read" ON scraper_logs;
    CREATE POLICY "Allow public read" ON scraper_logs FOR SELECT TO anon USING (true);
END
$$;
-- 3. Research Resources (NotebookLM Intelligence Layer)
CREATE TABLE IF NOT EXISTS research_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'PDF Report', 'Google Slides', 'Google Doc'
    category TEXT NOT NULL, -- 'Framework', 'Report', 'Case Study', 'Article'
    description TEXT,
    link TEXT NOT NULL,
    icon_type TEXT -- 'target', 'pie', 'text', 'building', 'chart'
);

ALTER TABLE research_resources ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Enable all for service_role" ON research_resources;
    CREATE POLICY "Enable all for service_role" ON research_resources FOR ALL TO service_role USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Allow public read" ON research_resources;
    CREATE POLICY "Allow public read" ON research_resources FOR SELECT TO anon USING (true);
END
$$;
-- 4. Emergency Patch (v1.2.0-FINAL)
ALTER TABLE diagnostic_results ADD COLUMN IF NOT EXISTS industry TEXT DEFAULT 'General Business';
-- Backfill existing records
UPDATE diagnostic_results SET industry = 'General Business' WHERE industry IS NULL;
