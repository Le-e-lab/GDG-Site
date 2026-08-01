-- ============================================================
-- Migration 2: Student startups, dynamic resources, collaboration
-- Idempotent: safe to re-run.
-- ============================================================

-- 1. Projects: add student startup flag
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_startup BOOLEAN DEFAULT false;

-- 2. Resources table (Student Developer Packs - admin editable)
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    description TEXT,
    url VARCHAR,
    badge VARCHAR,             -- e.g. "FREE", "$200 FREE"
    color_key VARCHAR DEFAULT 'blue',  -- blue | red | green | yellow | purple | orange
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Collaboration applications (volunteer / help a team)
CREATE TABLE IF NOT EXISTS collab_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    project_id UUID,
    project_title VARCHAR,
    skills TEXT,
    motivation TEXT,
    status VARCHAR DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_applications ENABLE ROW LEVEL SECURITY;

-- Public read: resources
DROP POLICY IF EXISTS "Public Read Access" ON resources;
CREATE POLICY "Public Read Access" ON resources FOR SELECT USING (true);

-- Public insert: collaboration applications (anyone can volunteer)
DROP POLICY IF EXISTS "Public Insert Access" ON collab_applications;
CREATE POLICY "Public Insert Access" ON collab_applications FOR INSERT WITH CHECK (true);

-- Admin full access
DROP POLICY IF EXISTS "Authenticated Admin All Access" ON resources;
CREATE POLICY "Authenticated Admin All Access" ON resources FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated Admin All Access" ON collab_applications;
CREATE POLICY "Authenticated Admin All Access" ON collab_applications FOR ALL USING (auth.uid() IS NOT NULL);
