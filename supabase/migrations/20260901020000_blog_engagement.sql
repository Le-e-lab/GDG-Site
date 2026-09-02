-- ============================================================
-- GDG Africa University — Blog engagement (comments + reactions)
-- 1) post_reactions: emoji reactions on blog posts
-- 2) post_comments: reader comments + Q&A on blog posts
-- Idempotent: safe to re-run.
-- ============================================================

-- ------------------------------------------------------------
-- 1) POST REACTIONS
-- One row per (post_id, emoji, visitor). A visitor is identified by a
-- client-generated UUID stored in localStorage, so one person can react
-- to an emoji ONCE per post (unique constraint = built-in anti-spam guard).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES blog(id) ON DELETE CASCADE,
    emoji VARCHAR(16) NOT NULL,
    visitor_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (post_id, emoji, visitor_id)
);

-- ------------------------------------------------------------
-- 2) POST COMMENTS (includes Q&A — admins can answer a comment by
-- posting a reply; the "answer" is flagged via the is_answer column)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES blog(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    -- Q&A support: a comment can be flagged as an admin's answer to a question
    is_answer BOOLEAN DEFAULT false,
    is_question BOOLEAN DEFAULT false,
    status VARCHAR DEFAULT 'approved', -- approved | pending | hidden (moderation)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast per-post queries
CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Public can read approved reactions + comments; anyone can react/comment
-- (auto-approved for engagement). Admins (auth.uid()) can manage all.
-- ------------------------------------------------------------
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "Public Read Reactions" ON post_reactions;
CREATE POLICY "Public Read Reactions" ON post_reactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Comments" ON post_comments;
CREATE POLICY "Public Read Comments" ON post_comments FOR SELECT USING (status = 'approved' OR status = 'pending');

-- Public insert (reactions are anonymous, deduped by unique constraint)
DROP POLICY IF EXISTS "Public Insert Reactions" ON post_reactions;
CREATE POLICY "Public Insert Reactions" ON post_reactions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Insert Comments" ON post_comments;
CREATE POLICY "Public Insert Comments" ON post_comments FOR INSERT WITH CHECK (name IS NOT NULL AND content IS NOT NULL AND length(content) <= 2000);

-- Admin full access (auth.uid() present)
DROP POLICY IF EXISTS "Authenticated Admin All Access" ON post_reactions;
CREATE POLICY "Authenticated Admin All Access" ON post_reactions FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated Admin All Access" ON post_comments;
CREATE POLICY "Authenticated Admin All Access" ON post_comments FOR ALL USING (auth.uid() IS NOT NULL);

-- No public DELETE on reactions: reactions are one-way (increment only) and
-- the unique (post_id, emoji, visitor_id) constraint already prevents spam.
-- Only admins can delete reactions.
