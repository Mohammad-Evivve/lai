-- LAI Phase 5: Team Insight Engine & Identity Capture
-- Migration v1.8.0

-- 1. Create Teams Table
CREATE TABLE IF NOT EXISTS teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    team_code TEXT UNIQUE NOT NULL,
    organization_name TEXT,
    creator_email TEXT -- Temporary link until creator participant is created
);

-- 2. Create Participants Table
CREATE TABLE IF NOT EXISTS participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    organization TEXT,
    industry TEXT,
    role_level TEXT,
    org_size TEXT,
    region TEXT DEFAULT 'Global',
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    UNIQUE(email, team_id) -- Participant can be in multiple teams, but unique per team
);

-- 3. Create Granular Responses Table (for Variance Analysis)
CREATE TABLE IF NOT EXISTS responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    dimension_id TEXT NOT NULL,
    question_index INTEGER NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10)
);

-- 4. Update diagnostic_results to link to participants
ALTER TABLE diagnostic_results 
ADD COLUMN IF NOT EXISTS participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- 5. Security & RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Service Role Policies (Backend)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Enable all for service_role" ON teams;
    CREATE POLICY "Enable all for service_role" ON teams FOR ALL TO service_role USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Enable all for service_role" ON participants;
    CREATE POLICY "Enable all for service_role" ON participants FOR ALL TO service_role USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Enable all for service_role" ON responses;
    CREATE POLICY "Enable all for service_role" ON responses FOR ALL TO service_role USING (true) WITH CHECK (true);
END
$$;

-- Public READ access (Scoped)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public read" ON teams;
    CREATE POLICY "Allow public read" ON teams FOR SELECT TO anon USING (true);
    
    DROP POLICY IF EXISTS "Allow public read" ON participants;
    CREATE POLICY "Allow public read" ON participants FOR SELECT TO anon USING (true);

    DROP POLICY IF EXISTS "Allow public read" ON responses;
    CREATE POLICY "Allow public read" ON responses FOR SELECT TO anon USING (true);
END
$$;

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_responses_team_id ON responses(team_id);
CREATE INDEX IF NOT EXISTS idx_participants_team_id ON participants(team_id);
CREATE INDEX IF NOT EXISTS idx_teams_code ON teams(team_code);
