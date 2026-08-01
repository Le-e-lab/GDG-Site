-- ============================================================
-- GDG Africa University - Seed Data
-- Run in the Supabase SQL Editor after database-schema.sql.
-- Idempotent: safe to re-run (ON CONFLICT DO NOTHING).
-- ============================================================

-- ------------------------------------------------------------
-- SEMESTER PLAN (drives the homepage timeline)
-- status: upcoming | live | completed
-- ------------------------------------------------------------
INSERT INTO semester_plan (id, title, date, week_number, activity_type, description, status) VALUES
  ('10000000-0000-4000-8000-000000000001', 'Welcome Meet & Greet: Orientation for New Members', '2026-08-07', 1, 'Community', 'Kick off the semester with introductions, club overview, and a roadmap of what GDG Africa University is building this term.', 'upcoming'),
  ('10000000-0000-4000-8000-000000000002', 'Android Basics with Kotlin Workshop', '2026-08-14', 2, 'Workshop', 'Hands-on session covering Kotlin fundamentals and your first Android app with Jetpack Compose.', 'upcoming'),
  ('10000000-0000-4000-8000-000000000003', 'Web Dev Crash Course: HTML, CSS & JavaScript', '2026-08-21', 3, 'Workshop', 'Build a responsive landing page from scratch and learn how the modern web stack fits together.', 'upcoming'),
  ('10000000-0000-4000-8000-000000000004', 'Cloud Study Jam: Intro to Google Cloud', '2026-08-28', 4, 'Workshop', 'Earn your first Google Cloud skill badge with guided labs on compute, storage, and databases.', 'upcoming'),
  ('10000000-0000-4000-8000-000000000005', 'Flutter for Beginners: Build a Weather App', '2026-09-04', 5, 'Workshop', 'Learn cross-platform mobile development with Flutter by shipping a working weather app.', 'upcoming'),
  ('10000000-0000-4000-8000-000000000006', 'AI & Machine Learning Study Group', '2026-09-11', 6, 'Community', 'Weekly study group exploring ML fundamentals with TensorFlow and practical Kaggle exercises.', 'upcoming'),
  ('10000000-0000-4000-8000-000000000007', 'Hackathon Bootcamp: Team Formation & Ideation', '2026-09-18', 7, 'Community', 'Form teams, brainstorm problem statements, and prepare for the AU Hackathon with mentors.', 'upcoming'),
  ('10000000-0000-4000-8000-000000000008', 'GDG AU Hackathon 2026: 48-Hour Build Sprint', '2026-09-25', 8, 'Community', '48 hours to design, build, and demo a solution to a real campus problem. Prizes and swag for top teams.', 'upcoming'),
  ('10000000-0000-4000-8000-000000000009', 'Firebase Workshop: Auth, Database & Hosting', '2026-10-02', 9, 'Workshop', 'Add authentication, a realtime database, and deploy your hackathon project to the web.', 'upcoming'),
  ('10000000-0000-4000-8000-000000000010', 'Portfolio & GitHub Profile Mastery', '2026-10-09', 10, 'Workshop', 'Level up your developer presence: build a portfolio, write great READMEs, and optimize your GitHub.', 'upcoming'),
  ('10000000-0000-4000-8000-000000000011', 'Guest Talk: Careers in Tech from AU Alumni', '2026-10-16', 11, 'Community', 'Alumni working in software, data, and cloud share their journeys and answer your questions.', 'upcoming'),
  ('10000000-0000-4000-8000-000000000012', 'Semester Showcase: Project Demos & Wrap Party', '2026-10-23', 12, 'Community', 'Demo everything you built this semester, celebrate wins, and plan for next term.', 'upcoming');

-- ------------------------------------------------------------
-- PROJECTS (drives homepage showcase + collaboration filter)
-- status must be 'approved' for public RLS read.
-- needs_help: true makes the "Seeking Collaborators" filter work.
-- ------------------------------------------------------------
INSERT INTO projects (id, title, description, tags, link, github, image, status, is_spotlight, needs_help, help_description, created_at) VALUES
  ('20000000-0000-4000-8000-000000000001', 'Chef''s Muse', 'AI-powered recipe generator that creates personalized meal plans based on available ingredients and dietary preferences.', 'AI/ML,Flutter', 'https://le-e-lab.github.io/chefs-muse/', 'https://github.com/Le-e-lab/chefs-muse', NULL, 'approved', true, false, NULL, NOW() - INTERVAL '21 days'),
  ('20000000-0000-4000-8000-000000000002', 'SecureScan', 'Mobile security app that scans QR codes and links for phishing attempts before you open them, with a privacy-first design.', 'Security,Android', NULL, 'https://github.com/gdsc-africau/securescan', NULL, 'approved', false, true, 'Looking for a Flutter developer to help ship the Android companion app.', NOW() - INTERVAL '18 days'),
  ('20000000-0000-4000-8000-000000000003', 'AgriConnect', 'Farm-to-market platform connecting smallholder farmers in Zimbabwe directly with buyers, cutting out middlemen.', 'Web,AI', NULL, 'https://github.com/gdsc-africau/agriconnect', NULL, 'approved', false, true, 'Need a UI/UX designer and a data engineer to join the build.', NOW() - INTERVAL '14 days'),
  ('20000000-0000-4000-8000-000000000004', 'Campus Lost & Found', 'Community-driven lost and found hub for campus items with photo matching and instant notifications.', 'Flutter,Firebase', NULL, 'https://github.com/gdsc-africau/campus-lost-found', NULL, 'approved', false, false, NULL, NOW() - INTERVAL '10 days'),
  ('20000000-0000-4000-8000-000000000005', 'StudySync', 'Collaborative study planner that syncs group deadlines, reminders, and past papers across devices.', 'Android,Kotlin', NULL, 'https://github.com/gdsc-africau/studysync', NULL, 'approved', false, true, 'Seeking a backend developer comfortable with Supabase to own the API layer.', NOW() - INTERVAL '6 days');

-- ------------------------------------------------------------
-- EVENTS (drives the upcoming events grid)
-- ------------------------------------------------------------
INSERT INTO events (id, title, date, description, link, image) VALUES
  ('30000000-0000-4000-8000-000000000001', 'Google I/O Recap Watch Party', '2026-08-20', 'Join us to recap the biggest announcements from Google I/O 2026 and what they mean for developers.', 'https://gdsc.community.dev/', NULL),
  ('30000000-0000-4000-8000-000000000002', 'Cloud Study Jam Kickoff', '2026-08-27', 'Start your Google Cloud journey with a guided orientation and first skill badge challenge.', 'https://gdsc.community.dev/', NULL),
  ('30000000-0000-4000-8000-000000000003', 'GDG AU Hackathon 2026', '2026-09-25', 'Our flagship 48-hour hackathon. Form a team, pick a real problem, and ship a solution.', 'https://gdsc.community.dev/', NULL);

-- ------------------------------------------------------------
-- TEAM (drives the core team + member of the week spotlight)
-- is_spotlight: true + spotlight_quote renders the weekly spotlight.
-- ------------------------------------------------------------
INSERT INTO team (id, name, role, bio, linkedin, github, image, is_spotlight, spotlight_date, spotlight_quote, spotlight_project) VALUES
  ('40000000-0000-4000-8000-000000000001', 'Lesley Mutsambiwa', 'Chapter Lead', 'Computer Science • Class of 2027', 'https://www.linkedin.com/', 'https://github.com/Le-e-lab', NULL, true, CURRENT_DATE, 'GDG is where curiosity meets community. Every member here is building the future, one project at a time.', 'Chef''s Muse'),
  ('40000000-0000-4000-8000-000000000002', 'Tanaka Chikede', 'Technical Lead', 'Computer Science • Class of 2027', 'https://www.linkedin.com/', 'https://github.com/', NULL, false, NULL, NULL, NULL),
  ('40000000-0000-4000-8000-000000000003', 'Ropafadzo Moyo', 'Design Lead', 'Information Systems • Class of 2027', 'https://www.linkedin.com/', 'https://github.com/', NULL, false, NULL, NULL, NULL),
  ('40000000-0000-4000-8000-000000000004', 'Tafadzwa Nyamukapa', 'Community Lead', 'Software Engineering • Class of 2028', 'https://www.linkedin.com/', 'https://github.com/', NULL, false, NULL, NULL, NULL),
  ('40000000-0000-4000-8000-000000000005', 'Chipo Dube', 'Events Lead', 'Computer Science • Class of 2027', 'https://www.linkedin.com/', 'https://github.com/', NULL, false, NULL, NULL, NULL),
  ('40000000-0000-4000-8000-000000000006', 'Nyasha Banda', 'Content Lead', 'Media & Society • Class of 2028', 'https://www.linkedin.com/', 'https://github.com/', NULL, false, NULL, NULL, NULL);

-- ------------------------------------------------------------
-- TESTIMONIALS (drives the alumni wall)
-- ------------------------------------------------------------
INSERT INTO testimonials (id, name, role, content) VALUES
  ('50000000-0000-4000-8000-000000000001', 'Kudzai Marufu', 'Software Engineer at Delta V', 'GDG gave me my first real project experience. The hackathon project I built here became the portfolio piece that landed my first job.'),
  ('50000000-0000-4000-8000-000000000002', 'Farai Gumbo', 'Data Analyst', 'The Cloud Study Jam was a turning point. I walked in with no cloud experience and walked out with my first skill badge and a clear career direction.'),
  ('50000000-0000-4000-8000-000000000003', 'Rutendo Makoni', 'Frontend Developer', 'The community is the real value. Mentors and peers pushed me to ship, review, and grow faster than I ever could alone.');
