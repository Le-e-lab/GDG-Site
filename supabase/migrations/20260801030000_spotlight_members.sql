-- ============================================================
-- Migration 4: Dedicated spotlight_members table
-- Spotlight can feature ANY club member (not just core team).
-- Idempotent: safe to re-run.
-- ============================================================
CREATE TABLE IF NOT EXISTS spotlight_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    role VARCHAR,                       -- e.g. "Club Member", "2nd Year CS"
    bio VARCHAR,
    image VARCHAR,                      -- portrait (Supabase storage or URL)
    linkedin VARCHAR,
    github VARCHAR,
    spotlight_quote TEXT,
    spotlight_project VARCHAR,
    spotlight_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE spotlight_members ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "Public Read Access" ON spotlight_members;
CREATE POLICY "Public Read Access" ON spotlight_members FOR SELECT USING (true);

-- Admin full access
DROP POLICY IF EXISTS "Authenticated Admin All Access" ON spotlight_members;
CREATE POLICY "Authenticated Admin All Access" ON spotlight_members FOR ALL USING (auth.uid() IS NOT NULL);
