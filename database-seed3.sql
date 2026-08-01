-- ============================================================
-- Seed: spotlight_members (can feature ANY club member)
-- Idempotent (ON CONFLICT DO NOTHING via fixed ids).
-- ============================================================
INSERT INTO spotlight_members (id, name, role, bio, image, linkedin, github, spotlight_quote, spotlight_project, spotlight_date, is_active) VALUES
  ('90000000-0000-4000-8000-000000000001', 'Lesley Mutsambiwa', 'Chapter Lead', 'Computer Science • Class of 2027', NULL, 'https://www.linkedin.com/', 'https://github.com/Le-e-lab', 'GDG is where curiosity meets community. Every member here is building the future, one project at a time.', 'Chef''s Muse', CURRENT_DATE, true),
  ('90000000-0000-4000-8000-000000000002', 'Tendai Moyo', 'Club Member', 'Computer Science • Class of 2028', NULL, NULL, NULL, 'I joined GDG knowing barely any code. The workshops and people here pushed me to build real projects.', 'Campus Lost & Found', CURRENT_DATE - INTERVAL '7 days', true);
