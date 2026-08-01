# GDG Africa University - Design System & System Architecture

## 1. Design Philosophy

**Inspiration:** Melius.com + Google's clean aesthetic
**Theme:** Light by default with strategic dark sections for contrast
**Feel:** Premium, community-focused, professional but approachable

---

## 2. Color System

### Primary Colors (Google Brand)
```css
--google-blue: #4285F4;
--google-red: #EA4335;
--google-yellow: #FBBC05;
--google-green: #34A853;
```

### Light Theme (Default)
```css
/* Backgrounds */
--bg-primary: #FAFAFA;        /* Page background - off-white */
--bg-secondary: #FFFFFF;      /* Card backgrounds - pure white */
--bg-tertiary: #F5F5F5;       /* Subtle sections - light gray */

/* Text */
--text-primary: #0E0E0E;      /* Headings - near-black */
--text-secondary: #2A2A2A;    /* Body text - dark gray */
--text-muted: #888888;        /* Captions - medium gray */

/* Borders */
--border-color: #E8E8E8;      /* Light borders */
--border-hover: #D0D0D0;      /* Hover borders */
```

### Strategic Dark Sections
```css
/* Use for: Footer, CTA sections, feature highlights */
--dark-bg: #0E0E0E;           /* Dark background */
--dark-text: #FFFFFF;          /* White text on dark */
--dark-text-muted: #B0B0B0;   /* Muted text on dark */
--dark-border: #333333;        /* Subtle borders on dark */
```

### Accent Colors
```css
--accent-primary: #4285F4;     /* Google Blue - primary CTA */
--accent-success: #34A853;     /* Success states */
--accent-warning: #FBBC05;     /* Warning states */
--accent-error: #EA4335;       /* Error states */
```

---

## 3. Typography

### Font Stack
```css
/* Display / Headings - Clean, modern sans */
--font-display: 'Space Grotesk', system-ui, sans-serif;

/* Body - Highly readable */
--font-body: 'Inter', system-ui, sans-serif;

/* Code / Monospace */
--font-mono: 'JetBrains Mono', monospace;
```

### Type Scale
```css
/* Desktop */
--text-hero: 4rem (64px) / 1.1;        /* Hero headline */
--text-h1: 3rem (48px) / 1.2;          /* Section headlines */
--text-h2: 2rem (32px) / 1.3;          /* Subsection headlines */
--text-h3: 1.5rem (24px) / 1.4;        /* Card headlines */
--text-body-lg: 1.25rem (20px) / 1.6;  /* Large body */
--text-body: 1rem (16px) / 1.6;        /* Default body */
--text-small: 0.875rem (14px) / 1.5;   /* Captions */
--text-xs: 0.75rem (12px) / 1.4;       /* Labels */

/* Mobile - Scale down proportionally */
--text-hero-mobile: 2.5rem (40px);
--text-h1-mobile: 2rem (32px);
--text-h2-mobile: 1.5rem (24px);
```

---

## 4. Spacing System

### Base Unit: 8px
```css
--space-1: 4px;     /* Tight */
--space-2: 8px;     /* Small */
--space-3: 12px;    /* Default gap */
--space-4: 16px;    /* Medium */
--space-5: 20px;    /* Large */
--space-6: 24px;    /* Section gap */
--space-8: 32px;    /* Card padding */
--space-10: 40px;   /* Section padding */
--space-12: 48px;   /* Large section */
--space-16: 64px;   /* Hero section */
--space-20: 80px;   /* Page section */
--space-24: 96px;   /* Major section */
```

---

## 5. Border Radius

```css
--radius-xs: 2px;     /* Tags, badges */
--radius-sm: 4px;     /* Small elements */
--radius-md: 8px;     /* Buttons, inputs */
--radius-lg: 12px;    /* Cards */
--radius-xl: 16px;    /* Large cards */
--radius-full: 9999px; /* Avatars, pills */
```

---

## 6. Shadows

```css
/* Light theme shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

/* Card hover */
--shadow-card-hover: 0 20px 40px -15px rgba(66, 133, 244, 0.15);
```

---

## 7. Animations & Transitions

```css
/* Timing */
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;

/* Easing */
--ease-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Standard transitions */
--transition-colors: background-color 200ms ease, color 200ms ease;
--transition-transform: transform 200ms ease;
--transition-all: all 200ms ease;
```

---

## 8. Page Structure & Dynamic Content

### 8.1 Homepage (`index.html`)

#### Hero Section
**Dynamic fields:**
- `hero.title` (text, default: "Ubuntu Meets Innovation")
- `hero.subtitle` (text)
- `hero.cta_primary` (text, default: "Join Us")
- `hero.cta_secondary` (text, default: "View Our Work")
- `hero.images[]` (array of image URLs for rotator)

**Admin endpoints:**
```
GET /api/hero - Fetch hero content
PUT /api/hero - Update hero content
```

#### About Section
**Dynamic fields:**
- `about.title` (text)
- `about.description` (rich text)
- `about.image` (image URL)

**Admin endpoints:**
```
GET /api/about - Fetch about content
PUT /api/about - Update about content
```

#### Pillars Section
**Dynamic fields:**
- `pillars[]` (array of 3 pillars)
  - `title` (text)
  - `description` (text)
  - `icon` (SVG or icon name)

**Admin endpoints:**
```
GET /api/pillars - Fetch all pillars
PUT /api/pillars/:id - Update pillar
```

#### Projects Section
**Dynamic fields:**
- `projects[]` (from Supabase `projects` table)
  - `title`, `description`, `tags`, `link`, `github`, `image`
  - `status` (pending/approved)
  - `is_spotlight` (boolean)
  - `needs_help` (boolean)
  - `help_description` (text)

**Admin endpoints:**
```
GET /api/projects - Fetch all approved projects
POST /api/projects - Submit new project (pending)
PUT /api/projects/:id - Update project (admin)
DELETE /api/projects/:id - Delete project (admin)
```

#### Team Section
**Dynamic fields:**
- `team[]` (from Supabase `team` table)
  - `name`, `role`, `bio`, `linkedin`, `github`, `image`
  - `is_spotlight` (boolean)
  - `spotlight_quote` (text)
  - `spotlight_project` (text)

**Admin endpoints:**
```
GET /api/team - Fetch all team members
POST /api/team - Add team member (admin)
PUT /api/team/:id - Update team member (admin)
DELETE /api/team/:id - Delete team member (admin)
```

#### Events Section
**Dynamic fields:**
- `events[]` (from Supabase `events` table)
  - `title`, `date`, `description`, `link`, `image`

**Admin endpoints:**
```
GET /api/events - Fetch upcoming events
POST /api/events - Add event (admin)
PUT /api/events/:id - Update event (admin)
DELETE /api/events/:id - Delete event (admin)
```

#### Testimonials Section
**Dynamic fields:**
- `testimonials[]` (from Supabase `testimonials` table)
  - `name`, `role`, `content`, `image`

**Admin endpoints:**
```
GET /api/testimonials - Fetch all testimonials
POST /api/testimonials - Add testimonial (admin)
PUT /api/testimonials/:id - Update testimonial (admin)
DELETE /api/testimonials/:id - Delete testimonial (admin)
```

#### Member Spotlight Section
**Dynamic fields:**
- `spotlight_member` (from team table where `is_spotlight = true`)
  - `name`, `role`, `bio`, `image`
  - `spotlight_quote`, `spotlight_project`

**Admin endpoints:**
```
GET /api/spotlight - Fetch current spotlight member
PUT /api/team/:id/spotlight - Set spotlight member (admin)
```

#### Newsletter Section
**Dynamic fields:**
- `newsletter.subscriber_count` (computed)
- `newsletter.title` (text)
- `newsletter.description` (text)

**Admin endpoints:**
```
POST /api/newsletter/subscribe - Subscribe to newsletter
GET /api/newsletter/subscribers - Fetch subscriber count (admin)
```

#### Student Resources Section
**Dynamic fields:**
- `resources[]` (hardcoded, but admin-editable)
  - `title`, `description`, `url`, `icon`, `badge` (e.g., "FREE", "$200 FREE")

**Admin endpoints:**
```
GET /api/resources - Fetch all resources
PUT /api/resources/:id - Update resource (admin)
```

### 8.2 Blog Page (`blog.html`)

**Dynamic fields:**
- `blog_posts[]` (from Supabase `blog` table)
  - `title`, `author`, `content`, `image`, `status`
  - `created_at` (auto-generated)

**Admin endpoints:**
```
GET /api/blog - Fetch published posts
GET /api/blog/:id - Fetch single post
POST /api/blog - Submit new post (pending)
PUT /api/blog/:id - Update post (admin)
DELETE /api/blog/:id - Delete post (admin)
PUT /api/blog/:id/approve - Approve post (admin)
```

### 8.3 Projects Page (`project.html`)

**Dynamic fields:**
- Same as Projects Section on homepage
- Additional: `project.detail_content` (rich text for full project view)

**Admin endpoints:**
```
GET /api/projects - Fetch all approved projects
GET /api/projects/:id - Fetch single project
POST /api/projects - Submit new project (pending)
PUT /api/projects/:id - Update project (admin)
DELETE /api/projects/:id - Delete project (admin)
```

### 8.4 Admin Panel (`admin.html`)

**Dynamic fields:**
- All content types managed via admin interface
- Authentication required for all operations

**Admin endpoints:**
```
POST /api/auth/login - Admin login
POST /api/auth/logout - Admin logout
GET /api/admin/stats - Fetch dashboard stats
```

---

## 9. Responsive Design

### Breakpoints
```css
/* Mobile First */
sm: 640px    /* Large phones */
md: 768px    /* Tablets */
lg: 1024px   /* Small desktops */
xl: 1280px   /* Desktops */
2xl: 1536px  /* Large desktops */
```

### Layout Patterns

#### Mobile (default)
- Single column layout
- Stacked navigation
- Full-width cards
- Reduced padding (16px)
- Smaller typography scale

#### Tablet (md)
- 2-column grids where appropriate
- Side-by-side layouts
- Medium padding (24px)
- Standard typography

#### Desktop (lg+)
- 3-4 column grids
- Multi-column layouts
- Large padding (32-64px)
- Full typography scale

### Component Responsiveness

#### Navigation
- **Mobile:** Hamburger menu, stacked links
- **Tablet:** Condensed horizontal links
- **Desktop:** Full horizontal nav with CTA

#### Cards
- **Mobile:** Full-width, stacked
- **Tablet:** 2-column grid
- **Desktop:** 3-4 column grid

#### Hero
- **Mobile:** Stacked (text + image)
- **Desktop:** Side-by-side (text left, image right)

---

## 10. Image Treatment

### Hero Images
- Format: WebP preferred, fallback to JPG/PNG
- Aspect ratio: 16:9 or 4:3
- Loading: Lazy for below-fold, eager for hero
- Optimization: Compress to < 200KB

### Card Images
- Format: WebP preferred
- Aspect ratio: 16:9
- Loading: Lazy
- Optimization: Compress to < 100KB

### Team Avatars
- Format: WebP or JPG
- Aspect ratio: 1:1 (square)
- Size: 400x400px minimum
- Style: Circular crop

### Icons
- Format: SVG preferred
- Size: 24x24px standard
- Style: Outline or filled, consistent weight

---

## 11. Admin-Editable Content Matrix

| Section | Field | Type | Default | API Endpoint |
|---------|-------|------|---------|--------------|
| Hero | title | text | "Ubuntu Meets Innovation" | PUT /api/hero |
| Hero | subtitle | text | "A community of developers..." | PUT /api/hero |
| Hero | images[] | image[] | [gdg-logo, about-illustration] | PUT /api/hero |
| About | title | text | "GDG Africa University" | PUT /api/about |
| About | description | rich text | "We're building tech skills..." | PUT /api/about |
| About | image | image | pillars-illustration | PUT /api/about |
| Pillars | [0-2].title | text | Leadership, Ubuntu, Innovation | PUT /api/pillars/:id |
| Pillars | [0-2].description | text | (varies) | PUT /api/pillars/:id |
| Projects | [] | object[] | (from Supabase) | CRUD /api/projects |
| Team | [] | object[] | (from Supabase) | CRUD /api/team |
| Events | [] | object[] | (from Supabase) | CRUD /api/events |
| Testimonials | [] | object[] | (from Supabase) | CRUD /api/testimonials |
| Spotlight | member_id | UUID | (set by admin) | PUT /api/team/:id/spotlight |
| Newsletter | title | text | "Get Weekly Dev Updates" | PUT /api/newsletter |
| Resources | [] | object[] | (hardcoded) | PUT /api/resources/:id |

---

## 12. Database Schema (Updated)

### Tables

```sql
-- Blog (with status for admin approval)
blog (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  author VARCHAR NOT NULL,
  content TEXT NOT NULL,
  image VARCHAR,
  status VARCHAR DEFAULT 'pending', -- pending/published
  created_at TIMESTAMP
)

-- Projects (with collaboration features)
projects (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  tags VARCHAR,
  link VARCHAR,
  github VARCHAR,
  image VARCHAR,
  status VARCHAR DEFAULT 'pending', -- pending/approved
  is_spotlight BOOLEAN DEFAULT false,
  needs_help BOOLEAN DEFAULT false,
  help_description TEXT,
  created_at TIMESTAMP
)

-- Team (with spotlight features)
team (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  role VARCHAR NOT NULL,
  bio VARCHAR,
  linkedin VARCHAR,
  github VARCHAR,
  image VARCHAR,
  is_spotlight BOOLEAN DEFAULT false,
  spotlight_date DATE,
  spotlight_quote TEXT,
  spotlight_project VARCHAR,
  created_at TIMESTAMP
)

-- Events
events (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  link VARCHAR,
  image VARCHAR,
  created_at TIMESTAMP
)

-- Testimonials
testimonials (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  role VARCHAR NOT NULL,
  content TEXT NOT NULL,
  image VARCHAR,
  created_at TIMESTAMP
)

-- Newsletter Subscribers
newsletter_subscribers (
  id UUID PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  created_at TIMESTAMP
)

-- Applications (lead role)
applications (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  role VARCHAR NOT NULL,
  skills TEXT NOT NULL,
  created_at TIMESTAMP
)

-- Membership Applications
membership_applications (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  academic_year VARCHAR NOT NULL,
  department VARCHAR NOT NULL,
  motivation TEXT NOT NULL,
  interests TEXT NOT NULL,
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP
)

-- Semester Plan
semester_plan (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  date DATE NOT NULL,
  week_number INT,
  activity_type VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'upcoming',
  created_at TIMESTAMP
)

-- Newsletters (archive)
newsletters (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  edition_number VARCHAR,
  published_date DATE NOT NULL,
  file_url VARCHAR NOT NULL,
  description TEXT,
  created_at TIMESTAMP
)
```

---

## 13. RLS Policies

```sql
-- Public read for published content
CREATE POLICY "Public Read" ON blog FOR SELECT USING (status = 'published');
CREATE POLICY "Public Read" ON projects FOR SELECT USING (status = 'approved');
CREATE POLICY "Public Read" ON team FOR SELECT USING (true);
CREATE POLICY "Public Read" ON events FOR SELECT USING (true);
CREATE POLICY "Public Read" ON testimonials FOR SELECT USING (true);

-- Public insert for submissions
CREATE POLICY "Public Insert" ON blog FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert" ON membership_applications FOR INSERT WITH CHECK (true);

-- Admin full access
CREATE POLICY "Admin All" ON blog FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin All" ON projects FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin All" ON team FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin All" ON events FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin All" ON testimonials FOR ALL USING (auth.uid() IS NOT NULL);
```

---

## 14. Implementation Checklist

### Phase 1: Design System
- [ ] Update CSS variables for light theme
- [ ] Remove dark/light toggle
- [ ] Set strategic dark sections (footer, CTA)
- [ ] Test responsive layouts

### Phase 2: Dynamic Content
- [ ] Implement all API endpoints
- [ ] Connect frontend to Supabase
- [ ] Build admin CRUD operations
- [ ] Test all admin-editable fields

### Phase 3: Polish
- [ ] Add animations and transitions
- [ ] Optimize images
- [ ] Test on all devices
- [ ] Performance audit

---

*Last updated: July 27, 2026*
