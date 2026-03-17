-- STEP 1: Update existing organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS headquarters TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- STEP 2: Link diagnostic_results to verified entities
-- (Ensure these run one-by-one if the batch fails)
ALTER TABLE diagnostic_results ADD COLUMN IF NOT EXISTS verified_entity_id UUID;

-- STEP 3: Add foreign key constraint separately (safer)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'diagnostic_results_verified_entity_id_fkey'
    ) THEN
        ALTER TABLE diagnostic_results 
        ADD CONSTRAINT diagnostic_results_verified_entity_id_fkey 
        FOREIGN KEY (verified_entity_id) REFERENCES organizations(id);
    END IF;
END
$$;

-- STEP 4: Create signal_logs table for future-proofing
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

-- STEP 5: Enable RLS
ALTER TABLE signal_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for service_role" ON signal_logs;
CREATE POLICY "Enable all for service_role" ON signal_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public read" ON signal_logs;
CREATE POLICY "Allow public read" ON signal_logs FOR SELECT TO anon USING (true);
