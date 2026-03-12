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
    image VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 3. Core Team Table
CREATE TABLE IF NOT EXISTS team (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    linkedin VARCHAR,
    twitter VARCHAR,
    image VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
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
CREATE POLICY "Public Read Access" ON blog FOR
SELECT USING (true);
CREATE POLICY "Public Read Access" ON projects FOR
SELECT USING (true);
CREATE POLICY "Public Read Access" ON team FOR
SELECT USING (true);
CREATE POLICY "Public Read Access" ON events FOR
SELECT USING (true);
CREATE POLICY "Public Read Access" ON testimonials FOR
SELECT USING (true);
-- Applications are private (admin only)
-- Note: Admin inserts / selects will bypass RLS if using service_role,
-- but since the admin uses the JavaScript client, we need auth policies.
CREATE POLICY "Authenticated Admin All Access" ON blog FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated Admin All Access" ON projects FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated Admin All Access" ON team FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated Admin All Access" ON events FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated Admin All Access" ON testimonials FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated Admin All Access" ON applications FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated Admin All Access" ON newsletter_subscribers FOR ALL USING (auth.uid() IS NOT NULL);
-- Allow public to INSERT applications (for the lead role form)
CREATE POLICY "Public Insert Access" ON applications FOR
INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Access" ON newsletter_subscribers FOR
INSERT WITH CHECK (true);