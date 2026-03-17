-- v1.7.0 Institutional Motion & Analytics (FINAL REFINEMENT)
-- Establishes the persistence layer for temporal metrics (Volatility, Turbulence, Velocity)

-- 1. Institutional Metrics Table
-- Stores persisted analytical metrics for each organization.
CREATE TABLE IF NOT EXISTS institution_metrics (
    institution_id UUID PRIMARY KEY REFERENCES organizations(id),
    region TEXT, -- denormalized for performance/aggregation
    sector TEXT, -- denormalized for performance/aggregation
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Score State
    current_lai_score NUMERIC(10,2) DEFAULT 0.0,
    score_change_24h NUMERIC(10,2) DEFAULT 0.0,
    score_change_7d NUMERIC(10,2) DEFAULT 0.0,
    score_change_30d NUMERIC(10,2) DEFAULT 0.0,
    
    -- Stability metrics
    volatility_30d NUMERIC(10,2) DEFAULT 0.0,
    turbulence_24h NUMERIC(10,2) DEFAULT 0.0,
    turbulence_7d NUMERIC(10,2) DEFAULT 0.0,
    
    -- Signal metrics
    signal_volume_7d INTEGER DEFAULT 0,
    signal_diversity_7d INTEGER DEFAULT 0,
    signal_velocity_7d NUMERIC(10,2) DEFAULT 0.0,
    signal_last_24h INTEGER DEFAULT 0, -- Track signal density for radar intensity
    
    -- Quality metrics
    confidence_current NUMERIC(10,2) DEFAULT 1.0,
    dominant_dimension TEXT,
    last_major_event_at TIMESTAMPTZ,
    
    adaptive_momentum_score NUMERIC(10,2) DEFAULT 50.0,
    metadata JSONB DEFAULT '{}'
);

-- 2. Security & RLS
ALTER TABLE institution_metrics ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Enable all for service_role" ON institution_metrics;
    CREATE POLICY "Enable all for service_role" ON institution_metrics FOR ALL TO service_role USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Allow public read" ON institution_metrics;
    CREATE POLICY "Allow public read" ON institution_metrics FOR SELECT TO anon USING (true);
END
$$;

-- 3. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_institution_metrics_modtime
    BEFORE UPDATE ON institution_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Initial Seed from existing data
INSERT INTO institution_metrics (institution_id, region, sector)
SELECT id, region, industry FROM organizations
ON CONFLICT (institution_id) DO UPDATE SET 
    region = EXCLUDED.region,
    sector = EXCLUDED.sector;
