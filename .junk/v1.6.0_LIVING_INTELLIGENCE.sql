-- v1.6.0 Living Intelligence: Evidence Foundation
-- This migration establishes the tables needed for signal normalization and intelligence event broadcasting.

-- 1. Normalized Signals Table
-- Stores standardized evidence nodes from all sources (Orion, Evivve, Sovereign Research).
CREATE TABLE IF NOT EXISTS signals_normalized (
    signal_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    institution_id UUID REFERENCES organizations(id),
    institution_name TEXT, -- Denormalized for quick performance in some views
    region TEXT,
    sector TEXT,
    
    signal_type TEXT NOT NULL, -- 'Strategic Pivot', 'Market Expansion', 'Resilience Signal', etc.
    dimension_impacted TEXT NOT NULL, -- 'signal_detection', 'cognitive_framing', 'decision_alignment', 'resource_calibration', 'integrated_responsiveness'
    
    source_tier INTEGER DEFAULT 3, -- 1: Sovereign, 2: Behavioral, 3: Perceptual, 4: Environmental
    source_name TEXT,
    source_url TEXT,
    
    impact_direction INTEGER DEFAULT 1, -- 1 for positive, -1 for negative
    impact_strength NUMERIC(4,2) DEFAULT 1.0, -- Magnitude of the signal (0.1 to 5.0)
    
    confidence NUMERIC(3,2) DEFAULT 0.5, -- Confidence in the signal (0.0 to 1.0)
    recency_weight NUMERIC(3,2) DEFAULT 1.0, -- Current weight based on age (managed by scoring worker)
    
    event_timestamp TIMESTAMPTZ DEFAULT NOW(),
    ingested_at TIMESTAMPTZ DEFAULT NOW(),
    
    metadata JSONB DEFAULT '{}',
    fingerprint TEXT UNIQUE, -- Used for deduplication
    raw_reference_id TEXT -- Case ID, Scraper Log ID, or Simulation ID
);

-- 2. Intelligence Events Table
-- The primary broadcast stream for the frontend via Supabase Realtime.
CREATE TABLE IF NOT EXISTS intelligence_events (
    event_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    event_type TEXT NOT NULL, -- 'score.updated', 'rank.changed', 'signal.ingested', 'dissonance.alert'
    severity TEXT DEFAULT 'minor', -- 'minor', 'major', 'critical'
    
    institution_id UUID REFERENCES organizations(id),
    institution_name TEXT,
    
    delta_score NUMERIC(5,2),
    delta_dimension TEXT, -- Which dimension moved (if applicable)
    
    origin_signal_ids UUID[], -- Provenance linking back to signals_normalized
    
    previous_rank INTEGER,
    new_rank INTEGER,
    
    event_timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- 3. Institution Score History Table
-- Daily snapshots for sparkline rendering and temporal analysis.
CREATE TABLE IF NOT EXISTS institution_score_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recorded_at DATE DEFAULT CURRENT_DATE,
    
    institution_id UUID REFERENCES organizations(id),
    overall_score NUMERIC(10,2),
    
    -- Snapshots of the 5 dimensions
    signal_detection_score NUMERIC(10,2),
    cognitive_framing_score NUMERIC(10,2),
    resource_calibration_score NUMERIC(10,2),
    decision_alignment_score NUMERIC(10,2),
    integrated_responsiveness_score NUMERIC(10,2),
    
    UNIQUE (institution_id, recorded_at)
);

-- 4. Security & RLS Policies
ALTER TABLE signals_normalized ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_score_history ENABLE ROW LEVEL SECURITY;

-- Allow Service Role full access
DO $$
BEGIN
    DROP POLICY IF EXISTS "Enable all for service_role" ON signals_normalized;
    CREATE POLICY "Enable all for service_role" ON signals_normalized FOR ALL TO service_role USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Enable all for service_role" ON intelligence_events;
    CREATE POLICY "Enable all for service_role" ON intelligence_events FOR ALL TO service_role USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Enable all for service_role" ON institution_score_history;
    CREATE POLICY "Enable all for service_role" ON institution_score_history FOR ALL TO service_role USING (true) WITH CHECK (true);
END
$$;

-- Allow Public/Anon READ access
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public read" ON signals_normalized;
    CREATE POLICY "Allow public read" ON signals_normalized FOR SELECT TO anon USING (true);
    
    DROP POLICY IF EXISTS "Allow public read" ON intelligence_events;
    CREATE POLICY "Allow public read" ON intelligence_events FOR SELECT TO anon USING (true);
    
    DROP POLICY IF EXISTS "Allow public read" ON institution_score_history;
    CREATE POLICY "Allow public read" ON institution_score_history FOR SELECT TO anon USING (true);
END
$$;

-- 5. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_signals_inst_id ON signals_normalized(institution_id);
CREATE INDEX IF NOT EXISTS idx_events_inst_id ON intelligence_events(institution_id);
CREATE INDEX IF NOT EXISTS idx_history_inst_date ON institution_score_history(institution_id, recorded_at);
