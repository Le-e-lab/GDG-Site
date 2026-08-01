-- ============================================================
-- Migration 3: Events moderation workflow (auto-pull from GDG)
-- + team image separation guard
-- Idempotent: safe to re-run.
-- ============================================================

-- 1. Events: moderation + dedupe columns
ALTER TABLE events ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'approved';
ALTER TABLE events ADD COLUMN IF NOT EXISTS source_url VARCHAR;

-- Existing events stay visible; new auto-pulled events start 'pending'
UPDATE events SET status = 'approved' WHERE status IS NULL;

-- 2. Team: ensure hero/background images are never reused as portraits.
--    The frontend only shows member.image if it is a real portrait URL
--    (Supabase storage uploads). Local images/PHOTO-*.jpg are reserved
--    for the hero grid only. Seed data must not point team at those.
--    This migration does NOT wipe real admin-uploaded portraits; it only
--    nulls values that resolve to local hero files (defense in depth).
UPDATE team
SET image = NULL
WHERE image IS NOT NULL
  AND image LIKE 'images/%';

-- 3. Collab applications: ensure status defaults
ALTER TABLE collab_applications ALTER COLUMN status SET DEFAULT 'pending';
