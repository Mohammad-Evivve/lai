-- LAI Admin Identity Control: Entity Resolution Migration (v1.3.3)

-- 1. Update Organizations for Verified Registry
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS domain TEXT,
ADD COLUMN IF NOT EXISTS headquarters TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- 2. Add Mapping Link to Primary Signal Store
ALTER TABLE diagnostic_results 
ADD COLUMN IF NOT EXISTS verified_entity_id UUID REFERENCES organizations(id);

-- 3. Create signal_logs if missing (Multi-Signal Architecture)
CREATE TABLE IF NOT EXISTS signal_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    organization_name TEXT NOT NULL,
    verified_entity_id UUID REFERENCES organizations(id),
    source_type TEXT,
    overall_score NUMERIC(10,2),
    cognitive_score NUMERIC(10,2),
    signal_score NUMERIC(10,2),
    resource_score NUMERIC(10,2),
    decision_score NUMERIC(10,2),
    execution_score NUMERIC(10,2),
    metadata JSONB DEFAULT '{}'
);

-- 4. Enable RLS on signal_logs
ALTER TABLE signal_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Enable all for service_role" ON signal_logs;
    CREATE POLICY "Enable all for service_role" ON signal_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Allow public read" ON signal_logs;
    CREATE POLICY "Allow public read" ON signal_logs FOR SELECT TO anon USING (true);
END
$$;

-- 5. Indexing for Mapping Performance
CREATE INDEX IF NOT EXISTS idx_dr_verified_id ON diagnostic_results(verified_entity_id);
CREATE INDEX IF NOT EXISTS idx_sl_verified_id ON signal_logs(verified_entity_id);
CREATE INDEX IF NOT EXISTS idx_dr_org_name ON diagnostic_results(organization_name);
