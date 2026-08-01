-- ============================================================
-- GDG Africa University - Seed 2: Startups, Resources, Blog, Team photos
-- Run after database-seed.sql. Idempotent (ON CONFLICT DO NOTHING).
-- ============================================================

-- ------------------------------------------------------------
-- STUDENT STARTUPS (showcase in projects, is_startup = true)
-- ------------------------------------------------------------
INSERT INTO projects (id, title, description, tags, link, github, image, status, is_spotlight, is_startup, needs_help, help_description, created_at) VALUES
  ('60000000-0000-4000-8000-000000000001', 'Elevate Value Partners (EVP)', 'A Harare-based design & engineering studio founded by AU students. We help startups build software that looks as good as it works — from brand identity to production code, shipped from Harare to the world.', 'Startup,Web,AI', 'https://www.elevatevaluepartners.co.zw/', 'https://github.com/', NULL, 'approved', true, true, true, 'Volunteer with EVP — we''re looking for Flutter, AI, and design collaborators this semester.', NOW() - INTERVAL '3 days'),
  ('60000000-0000-4000-8000-000000000002', 'Tarisai', 'Zimbabwe''s first creator valuation tool. Get a real valuation based on your live Instagram, TikTok, or YouTube data — data-driven creator intelligence for African brands.', 'Startup,AI,Data', 'https://www.tarisai.co.zw/', 'https://github.com/', NULL, 'approved', false, true, true, 'Help Tarisai grow — we need data engineering, brand partnerships, and product volunteers.', NOW() - INTERVAL '2 days');

-- ------------------------------------------------------------
-- RESOURCES (Student Developer Packs - admin editable)
-- color_key: blue | red | green | yellow | purple | orange
-- ------------------------------------------------------------
INSERT INTO resources (id, title, description, url, badge, color_key, sort_order) VALUES
  ('70000000-0000-4000-8000-000000000001', 'GitHub Student Pack', 'GitHub Pro, Copilot, Codespaces, $150 in credits, and 100+ developer tools.', 'https://education.github.com/pack', 'FREE', 'blue', 1),
  ('70000000-0000-4000-8000-000000000002', 'JetBrains IDEs', 'IntelliJ IDEA, PyCharm, WebStorm, and all JetBrains IDEs free for students.', 'https://www.jetbrains.com/community/education/', 'FREE', 'purple', 2),
  ('70000000-0000-4000-8000-000000000003', 'DigitalOcean', '$200 in platform credits for cloud hosting, databases, and infrastructure.', 'https://www.digitalocean.com/github-students', '$200 FREE', 'blue', 3),
  ('70000000-0000-4000-8000-000000000004', 'Microsoft Azure', '$100 Azure credit plus 25+ free services including AI/ML tools.', 'https://azure.microsoft.com/en-us/free/students/', '$100 FREE', 'yellow', 4),
  ('70000000-0000-4000-8000-000000000005', 'Namecheap', 'Free .me domain for 1 year plus SSL certificate for your projects.', 'https://www.namecheap.com/github-students/', 'FREE DOMAIN', 'orange', 5),
  ('70000000-0000-4000-8000-000000000006', 'Educative', '6 months of interactive coding courses and learning paths.', 'https://www.educative.io/github-students', '6 MONTHS FREE', 'green', 6),
  ('70000000-0000-4000-8000-000000000007', 'Figma Education', 'Free professional Figma plan with unlimited files for students and educators.', 'https://www.figma.com/education/', 'FREE', 'red', 7),
  ('70000000-0000-4000-8000-000000000008', 'Google Cloud for Students', 'Free Google Cloud credits and 20+ always-free products, plus skill badges.', 'https://cloud.google.com/edu', 'FREE CREDITS', 'blue', 8),
  ('70000000-0000-4000-8000-000000000009', 'MongoDB Atlas', '$200 in credit plus free M0 clusters for learning MongoDB and building apps.', 'https://www.mongodb.com/education', '$200 FREE', 'green', 9),
  ('70000000-0000-4000-8000-000000000010', 'Notion', 'Free personal Notion plan with AI credits — organize notes, projects, and your study life.', 'https://www.notion.so/students', 'FREE', 'yellow', 10);

-- ------------------------------------------------------------
-- BLOG POSTS (published so they render on the blog page)
-- ------------------------------------------------------------
INSERT INTO blog (id, title, author, content, image, status, created_at) VALUES
  ('80000000-0000-4000-8000-000000000001', 'Welcome to the 2026 Semester at GDG Africa University', 'GDG Africa University', '<p>We''re kicking off an action-packed semester! This term we have Android workshops, a Cloud Study Jam, a Flutter bootcamp, and our flagship <strong>48-hour hackathon</strong>.</p><p>Whether you''re a first-year explorer or a seasoned builder, there''s a seat for you. Join our WhatsApp and Discord to stay in the loop, and keep an eye on the semester plan below.</p><p><em>Ubuntu meets innovation — let''s build together.</em></p>', NULL, 'published', NOW() - INTERVAL '5 days'),
  ('80000000-0000-4000-8000-000000000002', 'Student Startups to Watch in Zimbabwe', 'GDG Africa University', '<p>Our community is full of builders turning ideas into companies. Two standouts this semester:</p><p><strong>Elevate Value Partners</strong> — a Harare design &amp; engineering studio helping startups ship beautiful, fast software.</p><p><strong>Tarisai</strong> — Zimbabwe''s first creator valuation tool, giving creators a real number for their audience using live social data.</p><p>Both are founded by students from our school. If you want to volunteer with either team, apply through the collaboration button on their project cards!</p>', NULL, 'published', NOW() - INTERVAL '3 days'),
  ('80000000-0000-4000-8000-000000000003', 'How to Make the Most of Your Student Developer Packs', 'GDG Africa University', '<p>Every student at Africa University qualifies for free tools worth thousands of dollars — GitHub Pro, JetBrains IDEs, cloud credits, and more.</p><p>Here''s the playbook: 1) Grab the GitHub Student Pack first, 2) claim your JetBrains IDEs, 3) use the cloud credits to deploy a real project, 4) never pay for software again.</p><p>Check the Student Developer Packs section below for the full list.</p>', NULL, 'published', NOW() - INTERVAL '1 day');

-- ------------------------------------------------------------
-- TEAM PHOTOS
-- NOTE: Team/spotlight portraits must NEVER reuse the hero grid files
-- (images/PHOTO-*.jpg are reserved for the hero background marquee).
-- Leave team.image NULL to show premium initials avatars, or upload a
-- real portrait via the Admin panel (stored in Supabase storage).
-- ------------------------------------------------------------
