# Design Specification: GDG Campus Africa University Website Redesign

This document outlines the architecture, database schema, design tokens, page updates, and interaction flows for the Google Developer Groups (GDG) on Campus site for Africa University.

---

## 1. Executive Summary & Purpose

The objective of this project is to redesign the GDG Africa University community website, elevating its visual aesthetics to a premium grade, and adding key community-driven features. The site will continue to leverage a serverless, build-less architecture (Vanilla HTML, JS, CSS variables) backed by **Supabase** (Postgres, Auth, Storage) for easy maintenance by successive student leads.

Key improvements:
- **Premium visual identity**: Custom typography, dynamic colors, glassmorphism, and micro-animations.
- **Member blog contributions**: Public drafting and submission workflow with admin moderation.
- **Weekly Spotlight**: A curated showcase section for outstanding members' projects.
- **Project Help Board**: A workspace for members to seek assistance or find collaborators.
- **Semester timeline**: A dynamic semester activity tracker managed via the admin panel.
- **General Membership Application**: A digital signup form for new members.
- **Newsletter archive**: Dynamic uploads of newsletter issues (PDFs).

---

## 2. Database Schema (Supabase)

To support the new features, we will add new tables and modify the existing tables.

```sql
-- ═══════════════════════════════════════════════════════════════════════════
-- 1. EXTEND EXISTING TABLES
-- ═══════════════════════════════════════════════════════════════════════════

-- Update Blog Table: Add draft state review
ALTER TABLE blog ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pending';

-- Update Projects Table: Add collaboration features and showcase flags
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pending';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_spotlight BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS needs_help BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS help_description TEXT;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. CREATE NEW TABLES
-- ═══════════════════════════════════════════════════════════════════════════

-- Semester Plan / Activities Timeline Table
CREATE TABLE IF NOT EXISTS semester_plan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    date DATE NOT NULL,
    week_number INT,
    activity_type VARCHAR NOT NULL, -- 'Workshop', 'Hackathon', 'Info Session', 'Social'
    description TEXT,
    status VARCHAR DEFAULT 'upcoming', -- 'upcoming', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletters Table
CREATE TABLE IF NOT EXISTS newsletters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    edition_number VARCHAR,
    published_date DATE NOT NULL,
    file_url VARCHAR NOT NULL, -- Link to PDF/doc in Supabase Storage
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dedicated General Membership Applications Table
CREATE TABLE IF NOT EXISTS membership_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    academic_year VARCHAR NOT NULL, -- 'First Year', 'Second Year', etc.
    department VARCHAR NOT NULL, -- e.g., 'Computer Science'
    motivation TEXT NOT NULL,
    interests TEXT NOT NULL, -- Comma-separated list of tags
    status VARCHAR DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. ENABLE RLS AND SET POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable RLS
ALTER TABLE semester_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
DROP POLICY IF EXISTS "Public Read Access" ON semester_plan;
CREATE POLICY "Public Read Access" ON semester_plan FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Access" ON newsletters;
CREATE POLICY "Public Read Access" ON newsletters FOR SELECT USING (true);

-- Blog RLS Policy Override (Public can only select published posts)
DROP POLICY IF EXISTS "Public Read Access" ON blog;
CREATE POLICY "Public Read Access" ON blog FOR SELECT USING (status = 'published');

-- Projects RLS Policy Override (Public can only select approved projects)
DROP POLICY IF EXISTS "Public Read Access" ON projects;
CREATE POLICY "Public Read Access" ON projects FOR SELECT USING (status = 'approved');

-- Allow Public Inserts for submission forms (applications, blogs, projects)
DROP POLICY IF EXISTS "Public Insert Access" ON blog;
CREATE POLICY "Public Insert Access" ON blog FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Insert Access" ON projects;
CREATE POLICY "Public Insert Access" ON projects FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Insert Access" ON membership_applications;
CREATE POLICY "Public Insert Access" ON membership_applications FOR INSERT WITH CHECK (true);

-- Admin (Authenticated) full access
DROP POLICY IF EXISTS "Authenticated Admin All Access" ON semester_plan;
CREATE POLICY "Authenticated Admin All Access" ON semester_plan FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated Admin All Access" ON newsletters;
CREATE POLICY "Authenticated Admin All Access" ON newsletters FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated Admin All Access" ON membership_applications;
CREATE POLICY "Authenticated Admin All Access" ON membership_applications FOR ALL USING (auth.uid() IS NOT NULL);
```

---

## 3. UI/UX Design System & Tokens

We establish a CSS variable system in `css/styles.css` that implements a cohesive Google color scheme with premium, high-end styling details (dark background focus, glowing neon gradients, frosted glass backdrops).

```css
:root {
  /* Google Palette Custom Adaptations */
  --google-blue: 217, 89%, 61%;      /* #4285F4 */
  --google-red: 5, 81%, 56%;        /* #EA4335 */
  --google-yellow: 44, 98%, 50%;     /* #FBBC05 */
  --google-green: 136, 53%, 43%;     /* #34A853 */
  
  /* Semantic Brand Colors (Dark Theme focus) */
  --bg-primary: 220, 25%, 4%;        /* Slate-950 equivalent */
  --bg-secondary: 220, 20%, 8%;      /* Slate-900 equivalent */
  --bg-tertiary: 220, 15%, 12%;      /* Card background */
  
  --text-primary: 210, 20%, 98%;     /* Off-white */
  --text-secondary: 215, 15%, 70%;   /* Slate text */
  --text-muted: 215, 10%, 50%;       /* Inactive links */

  --border-color: 220, 15%, 18%;     /* Glass border */
  --border-highlight: 217, 89%, 61%; /* Focus states */

  /* Borders & Shadows */
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --shadow-premium: 0 10px 30px -10px rgba(0, 0, 0, 0.7);
}

/* Light Theme overrides (Active if html class has 'light') */
html.light {
  --bg-primary: 0, 0%, 98%;          /* Slate-50 */
  --bg-secondary: 220, 15%, 95%;     /* White-ish */
  --bg-tertiary: 0, 0%, 100%;        /* Card background white */
  
  --text-primary: 220, 25%, 10%;     /* Dark slate */
  --text-secondary: 220, 15%, 35%;   /* Medium gray */
  --text-muted: 220, 10%, 55%;       /* Light gray */

  --border-color: 220, 15%, 90%;
  --shadow-premium: 0 10px 30px -10px rgba(66, 133, 244, 0.08);
}
```

---

## 4. Key UI Features & HTML Integrations

### 4.1. Hero Image Rotator
Located in `index.html` (right side of the main landing banner).
- A container with fixed dimensions holding an array of images.
- Slides cross-fade using hardware-accelerated CSS overlays (`opacity` and `transform`).
- Pagination dots are overlayed. Active dot has a growing scale loader indicator.
- Automatically shifts every 5 seconds. Pauses on hover.

### 4.2. Semester Activity Timeline
Located in `index.html` as the "Semester Plan" section.
- Fetches activities from `semester_plan` table in order of date.
- Displays chronological vertical track.
- Events marked `'completed'` display a checkmark badge and slightly desaturated styles.
- Events marked `'upcoming'` pulse with a green border and display an calendar invite link.

### 4.3. Unified Project Showcase & Showcase Spotlight
Located in `index.html` and `project.html`.
- **Top banner**: Displays the project where `is_spotlight = true`. Emphasized in a large, double-wide card styled with glowing border-gradients.
- **Projects Grid**: Lists all other approved projects.
- **Collaboration Board**: A filtering toggle: "Seeking Help / Collaborations". Selecting it dynamically displays only projects with `needs_help = true` and shows a help description banner with a contact button.

### 4.4. Newsletter Archive Grid
Located in a dedicated subsection of the landing page or a dedicated footer archive.
- Displays past editions of newsletters.
- Card holds: Edition title, publication date, description.
- Clicks trigger downloads/views of PDF files uploaded to Supabase Storage.

---

## 5. Member Submissions & Application Modals

All visitor forms will submit requests into the review queues:
1. **Club Application Form**: Interactive modal requesting Student Details, Interests, and Motivation. Saves to `membership_applications`.
2. **Blog Draft Form**: Available on `blog.html`. Collects Title, Author, Content, and optionally uploads a photo to Supabase storage. Saves to `blog` (status: `pending`).
3. **Project Proposal Form**: Available in the Projects section. Collects Title, Desc, links, and the collaboration fields. Saves to `projects` (status: `pending`).

---

## 6. Admin Panel Operations (`admin.html`)

Accessing `/admin.html` prompts the Supabase auth screen. authenticated leads gain access to the tabs:
- **Articles Queue**: List pending posts, click "Approve" (update status to `published`) or "Delete".
- **Showcase Manager**: Approve projects, mark one project as `is_spotlight` (updates other projects' `is_spotlight` to false), delete projects.
- **Activities Admin**: Forms to CREATE, UPDATE, and DELETE activities in `semester_plan`.
- **Newsletter Publisher**: Form to enter newsletter titles, upload a PDF file to the storage bucket, and publish the issue.
- **Membership Signups**: List all general members who applied, view motivation text, approve/archive applications.

---

## 7. Implementation Game Plan

We decompose the development into the following distinct development phases:

- **Phase 1: Backend & Schema Initialization**
  - Run SQL migrations to create new tables, columns, and configure RLS.
  - Setup storage folders in Supabase for `gdg-images` bucket.

- **Phase 2: CSS Refactoring & Animations**
  - Re-write `css/styles.css` using the HSL design tokens.
  - Implement dark/light theme toggles and premium micro-interactions.

- **Phase 3: Core Site Features & Hero Rotator**
  - Integrate the Hero Image Rotator component.
  - Update homepage components: Timeline (Semester Plan) and Project Spotlight.
  - Setup frontend script logic to fetch from new endpoints.

- **Phase 4: Member Submission Forms**
  - Build modals for: Membership Application, Blog Submission, and Project Submission.
  - Write validation and file upload handlers for Supabase client.

- **Phase 5: Admin Panel Upgrade**
  - Expand `admin.html` and `admin.js` to support tabs for Blogs, Projects, Semester Plan, and Applications.
  - Write administrative CRUD queries.

- **Phase 6: Optimization & Quality Gates**
  - SEO tagging checks, speed adjustments, and browser verification testing.
