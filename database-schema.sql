-- Run these SQL commands in the Supabase SQL Editor to create the necessary tables for the GDG site.
-- 1. Blog Table
CREATE TABLE IF NOT EXISTS blog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    author VARCHAR NOT NULL,
    content TEXT NOT NULL,
    image VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    tags VARCHAR,
    link VARCHAR,
    github VARCHAR,
    image VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 3. Core Team Table
CREATE TABLE IF NOT EXISTS team (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    bio VARCHAR,
    linkedin VARCHAR,
    github VARCHAR,
    image VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add github column to existing tables (safe to re-run)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS github VARCHAR;
ALTER TABLE team ADD COLUMN IF NOT EXISTS github VARCHAR;
ALTER TABLE team ADD COLUMN IF NOT EXISTS bio VARCHAR;
-- 4. Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    link VARCHAR,
    image VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 5. Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    content TEXT NOT NULL,
    image VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 6. Lead Role Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    skills TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 7. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Enable Row Level Security (RLS) and Set Policies
-- For a simple public site where the admin does all writing via auth,
-- we allow anon read access to all public tables, and only authenticated read/write.
-- Actually for ease of setup since we just created the tables, we can configure them globally:
ALTER TABLE blog ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
-- Public read access policies
DROP POLICY IF EXISTS "Public Read Access" ON blog;
CREATE POLICY "Public Read Access" ON blog FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Access" ON projects;
CREATE POLICY "Public Read Access" ON projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Access" ON team;
CREATE POLICY "Public Read Access" ON team FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Access" ON events;
CREATE POLICY "Public Read Access" ON events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Access" ON testimonials;
CREATE POLICY "Public Read Access" ON testimonials FOR SELECT USING (true);

-- Applications are private (admin only)
-- Note: Admin inserts / selects will bypass RLS if using service_role,
-- but since the admin uses the JavaScript client, we need auth policies.
DROP POLICY IF EXISTS "Authenticated Admin All Access" ON blog;
CREATE POLICY "Authenticated Admin All Access" ON blog FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated Admin All Access" ON projects;
CREATE POLICY "Authenticated Admin All Access" ON projects FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated Admin All Access" ON team;
CREATE POLICY "Authenticated Admin All Access" ON team FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated Admin All Access" ON events;
CREATE POLICY "Authenticated Admin All Access" ON events FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated Admin All Access" ON testimonials;
CREATE POLICY "Authenticated Admin All Access" ON testimonials FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated Admin All Access" ON applications;
CREATE POLICY "Authenticated Admin All Access" ON applications FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated Admin All Access" ON newsletter_subscribers;
CREATE POLICY "Authenticated Admin All Access" ON newsletter_subscribers FOR ALL USING (auth.uid() IS NOT NULL);

-- Allow public to INSERT applications (for the lead role form)
DROP POLICY IF EXISTS "Public Insert Access" ON applications;
CREATE POLICY "Public Insert Access" ON applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Insert Access" ON newsletter_subscribers;
CREATE POLICY "Public Insert Access" ON newsletter_subscribers FOR INSERT WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- STORAGE BUCKET FOR IMAGES
-- ═══════════════════════════════════════════════════════════════════════════
-- Create the 'gdg-images' bucket (public, so images can be viewed by anyone)
INSERT INTO storage.buckets (id, name, public)
VALUES ('gdg-images', 'gdg-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users (admins) to upload files
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gdg-images');

-- Allow authenticated users (admins) to update/delete their uploads
DROP POLICY IF EXISTS "Authenticated Manage" ON storage.objects;
CREATE POLICY "Authenticated Manage" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'gdg-images');

DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
CREATE POLICY "Authenticated Delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'gdg-images');

-- Allow public read access to all images (so they show on the website)
DROP POLICY IF EXISTS "Public Read Images" ON storage.objects;
CREATE POLICY "Public Read Images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'gdg-images');