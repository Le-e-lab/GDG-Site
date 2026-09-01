-- ============================================================
-- GDG Africa University — Zim events + new semester schedule
-- 1) Events: add location/format, keep only ZW/AU events, approve ZW ones
-- 2) Schedule: refresh semester_plan for the new semester (mostly online)
-- Idempotent: safe to re-run.
-- ============================================================

-- ------------------------------------------------------------
-- 1) EVENTS — location + format columns
-- ------------------------------------------------------------
-- location_type: 'online' | 'inperson'  (drives badge on cards)
-- location:      venue / city / meeting link label
ALTER TABLE events ADD COLUMN IF NOT EXISTS location_type VARCHAR DEFAULT 'online';
ALTER TABLE events ADD COLUMN IF NOT EXISTS location VARCHAR;

-- Default existing approved AU events sensibly.
UPDATE events SET location_type = 'online',  location = 'Zoom (link on Bevy)'  WHERE title = 'Google I/O Recap Watch Party' AND location IS NULL;
UPDATE events SET location_type = 'online',  location = 'Google Meet'           WHERE title = 'Cloud Study Jam Kickoff' AND location IS NULL;
UPDATE events SET location_type = 'inperson', location = 'Africa University, Mutare' WHERE title = 'GDG AU Hackathon 2026' AND location IS NULL;

-- ------------------------------------------------------------
-- 2) EVENTS — remove non-Zimbabwe / non-AU chapter events
--    (auto-pulled from the global GDG feed, not our chapter)
-- ------------------------------------------------------------
DELETE FROM events WHERE title ILIKE '%Pretoria%';
DELETE FROM events WHERE title ILIKE '%Lusaka%';
DELETE FROM events WHERE title ILIKE '%Kapstadt%' OR title ILIKE '%Cape Town%';
-- Flutter & Friends is a global (non-chapter) series — not ours.
DELETE FROM events WHERE title ILIKE '%Flutter & Friends%';
-- "Monthly Meetup" synced from the Lusaka chapter — also not ours.
DELETE FROM events WHERE source_url ILIKE '%gdg-lusaka%';

-- ------------------------------------------------------------
-- 3) EVENTS — approve the Africa University + Harare ones
-- ------------------------------------------------------------
UPDATE events SET status = 'approved',
  location_type = COALESCE(location_type, 'inperson'),
  location = COALESCE(location, 'Harare, Zimbabwe')
WHERE title ILIKE '%DevFest Harare%' AND status = 'pending';

-- ------------------------------------------------------------
-- 4) SCHEDULE — refresh semester_plan for the new semester.
--    Clear the old Aug dates and seed a fresh upcoming run
--    (mostly online where it makes sense, in-person at AU/Harare).
-- ------------------------------------------------------------
DELETE FROM semester_plan;

INSERT INTO semester_plan (id, title, date, week_number, activity_type, description, status, created_at) VALUES
  ('10000000-0000-4000-8000-000000000001', 'Welcome Week: Semester Kickoff & Orientation', '2026-09-04', 1, 'Community', 'Start the semester with an intro to GDG Africa University, our roadmap for the term, and how to get involved in projects and startups.', 'upcoming', NOW()),
  ('10000000-0000-4000-8000-000000000002', 'Intro to Git & GitHub Workflow', '2026-09-11', 2, 'Workshop', 'Branch, commit, and PR your way through a real group repo. Online — join from anywhere.', 'upcoming', NOW()),
  ('10000000-0000-4000-8000-000000000003', 'Web Dev Crash Course: HTML, CSS & JavaScript', '2026-09-18', 3, 'Workshop', 'Build a responsive landing page from scratch and learn the modern web stack. In-person at AU.', 'upcoming', NOW()),
  ('10000000-0000-4000-8000-000000000004', 'Cloud Study Jam: Google Cloud Fundamentals', '2026-09-25', 4, 'Workshop', 'Earn your first Google Cloud skill badge with guided labs. Online.', 'upcoming', NOW()),
  ('10000000-0000-4000-8000-000000000005', 'Mobile with Android & Kotlin', '2026-10-02', 5, 'Workshop', 'Hands-on Kotlin + Jetpack Compose: ship your first Android screen. Online.', 'upcoming', NOW()),
  ('10000000-0000-4000-8000-000000000006', 'Flutter for Beginners: Build a Weather App', '2026-10-09', 6, 'Workshop', 'Cross-platform mobile development with Flutter by shipping a working weather app. In-person at AU.', 'upcoming', NOW()),
  ('10000000-0000-4000-8000-000000000007', 'AI & Machine Learning Study Group', '2026-10-16', 7, 'Community', 'Weekly study group exploring ML fundamentals with TensorFlow and Kaggle exercises. Online.', 'upcoming', NOW()),
  ('10000000-0000-4000-8000-000000000008', 'Hackathon Bootcamp: Team Formation & Ideation', '2026-10-23', 8, 'Community', 'Form teams, brainstorm problem statements, and prep for the AU Hackathon with mentors. In-person.', 'upcoming', NOW()),
  ('10000000-0000-4000-8000-000000000009', 'GDG AU Hackathon 2026: 48-Hour Build Sprint', '2026-10-30', 9, 'Community', '48 hours to design, build, and demo a solution to a real campus problem. Prizes and swag. In-person at AU.', 'upcoming', NOW()),
  ('10000000-0000-4000-8000-000000000010', 'Firebase Workshop: Auth, Database & Hosting', '2026-11-06', 10, 'Workshop', 'Add auth, a realtime database, and deploy your hackathon project. Online.', 'upcoming', NOW()),
  ('10000000-0000-4000-8000-000000000011', 'Portfolio & GitHub Profile Mastery', '2026-11-13', 11, 'Workshop', 'Level up your developer presence: portfolio, READMEs, and GitHub. Online.', 'upcoming', NOW()),
  ('10000000-0000-4000-8000-000000000012', 'Guest Talk: Careers in Tech from AU Alumni', '2026-11-20', 12, 'Community', 'Alumni working in software, data, and cloud share their journeys. Hybrid — online + AU campus.', 'upcoming', NOW()),
  ('10000000-0000-4000-8000-000000000013', 'Semester Showcase: Project Demos & Wrap Party', '2026-11-27', 13, 'Community', 'Demo everything you built this semester, celebrate wins, and plan for next term. In-person at AU.', 'upcoming', NOW());
