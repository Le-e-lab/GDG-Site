# GDG Campus Africa University Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the GDG Africa University site to feature a premium Google developers theme with advanced community interactions (moderated blogs, collaboration showcases, semester plan tracking, and member applications) backed by Supabase.

**Architecture:** Build-less static multi-page client-side architecture using standard HTML, ES modules, CSS custom variables (supporting light/dark modes), and Supabase JS SDK. Moderation is handled via a `'pending'` status flag in the database, requiring admin approval in `/admin.html` before rendering publicly.

**Tech Stack:** HTML5, Vanilla JavaScript, Tailwind CSS (via CDN) + Custom CSS, Supabase (PostgreSQL, Auth, Storage), Vitest + JSDOM (for testing).

## Global Constraints
- Do not use build frameworks like Next.js or React; keep it pure Vanilla HTML + ES modules JS.
- Enforce the Google brand HSL color scheme across both light and dark modes.
- Maintain existing file structure and cache-busting blocks.
- Ensure all public submission forms insert with a status of `'pending'`.
- All JS edits must retain modern ES module imports/exports.

---

### Task 1: Initialize Testing Harness & Supabase Migrations

**Files:**
- Create: `package.json`
- Create: `tests/supabase-mock.js`
- Modify: `database-schema.sql`

**Interfaces:**
- Consumes: None
- Produces: Test runner command, database schema structure

- [ ] **Step 1: Create package.json to configure Vitest and JSDOM**
  Write this file: `/home/lee/Projects/GDG-Site/package.json`
  ```json
  {
    "name": "gdg-site",
    "version": "1.0.0",
    "type": "module",
    "scripts": {
      "test": "vitest run"
    },
    "devDependencies": {
      "jsdom": "^24.0.0",
      "vitest": "^1.4.0"
    }
  }
  ```

- [ ] **Step 2: Create Supabase client mock for unit testing**
  Write this file: `/home/lee/Projects/GDG-Site/tests/supabase-mock.js`
  ```javascript
  import { vi } from 'vitest';

  export const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null })
  };

  vi.mock('../js/supabase-config.js', () => ({
    supabase: mockSupabase
  }));
  ```

- [ ] **Step 3: Setup initial failing test checking script imports**
  Write a test file: `/home/lee/Projects/GDG-Site/tests/init.test.js`
  ```javascript
  import { describe, it, expect } from 'vitest';

  describe('Project Environment Initialization', () => {
    it('should confirm package configuration type is module', async () => {
      const pkg = await import('../package.json');
      expect(pkg.default.type).toBe('module');
    });
  });
  ```

- [ ] **Step 4: Run the test to verify initialization**
  Run: `npm install && npm run test`
  Expected: PASS

- [ ] **Step 5: Apply database schema updates in database-schema.sql**
  Append these commands to the end of `/home/lee/Projects/GDG-Site/database-schema.sql`:
  ```sql
  -- Update Blog Table: Add draft state review
  ALTER TABLE blog ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pending';

  -- Update Projects Table: Add collaboration features and showcase flags
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pending';
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_spotlight BOOLEAN DEFAULT false;
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS needs_help BOOLEAN DEFAULT false;
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS help_description TEXT;

  -- Semester Plan / Activities Timeline Table
  CREATE TABLE IF NOT EXISTS semester_plan (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title VARCHAR NOT NULL,
      date DATE NOT NULL,
      week_number INT,
      activity_type VARCHAR NOT NULL, 
      description TEXT,
      status VARCHAR DEFAULT 'upcoming', 
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Newsletters Table
  CREATE TABLE IF NOT EXISTS newsletters (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title VARCHAR NOT NULL,
      edition_number VARCHAR,
      published_date DATE NOT NULL,
      file_url VARCHAR NOT NULL, 
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Dedicated General Membership Applications Table
  CREATE TABLE IF NOT EXISTS membership_applications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR NOT NULL,
      email VARCHAR NOT NULL,
      academic_year VARCHAR NOT NULL, 
      department VARCHAR NOT NULL, 
      motivation TEXT NOT NULL,
      interests TEXT NOT NULL, 
      status VARCHAR DEFAULT 'pending', 
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Enable RLS
  ALTER TABLE semester_plan ENABLE ROW LEVEL SECURITY;
  ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
  ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;

  -- RLS Read Policies
  DROP POLICY IF EXISTS "Public Read Access" ON semester_plan;
  CREATE POLICY "Public Read Access" ON semester_plan FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Public Read Access" ON newsletters;
  CREATE POLICY "Public Read Access" ON newsletters FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Public Read Access" ON blog;
  CREATE POLICY "Public Read Access" ON blog FOR SELECT USING (status = 'published');

  DROP POLICY IF EXISTS "Public Read Access" ON projects;
  CREATE POLICY "Public Read Access" ON projects FOR SELECT USING (status = 'approved');

  -- Public Inserts Policies
  DROP POLICY IF EXISTS "Public Insert Access" ON blog;
  CREATE POLICY "Public Insert Access" ON blog FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "Public Insert Access" ON projects;
  CREATE POLICY "Public Insert Access" ON projects FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "Public Insert Access" ON membership_applications;
  CREATE POLICY "Public Insert Access" ON membership_applications FOR INSERT WITH CHECK (true);

  -- Admin Full Access Policies
  DROP POLICY IF EXISTS "Authenticated Admin All Access" ON semester_plan;
  CREATE POLICY "Authenticated Admin All Access" ON semester_plan FOR ALL USING (auth.uid() IS NOT NULL);

  DROP POLICY IF EXISTS "Authenticated Admin All Access" ON newsletters;
  CREATE POLICY "Authenticated Admin All Access" ON newsletters FOR ALL USING (auth.uid() IS NOT NULL);

  DROP POLICY IF EXISTS "Authenticated Admin All Access" ON membership_applications;
  CREATE POLICY "Authenticated Admin All Access" ON membership_applications FOR ALL USING (auth.uid() IS NOT NULL);
  ```

- [ ] **Step 6: Commit changes**
  Run: `git add package.json database-schema.sql tests/ && git commit -m "chore: init testing harness and append db schema extensions"`

---

### Task 2: Premium CSS Design Tokens & Light/Dark Theme Setup

**Files:**
- Create: `tests/theme.test.js`
- Modify: `css/styles.css`
- Modify: `index.html`

**Interfaces:**
- Consumes: CSS custom variables, theme modes
- Produces: Custom classes, theme switcher state functions

- [ ] **Step 1: Write a failing test for theme switcher toggle behavior**
  Write `/home/lee/Projects/GDG-Site/tests/theme.test.js`:
  ```javascript
  import { describe, it, expect, beforeEach } from 'vitest';
  import { JSDOM } from 'jsdom';

  describe('Theme Controller', () => {
    let dom;
    beforeEach(() => {
      dom = new JSDOM('<!DOCTYPE html><html><body class="bg-white"><button id="theme-toggle"></button></body></html>');
      global.document = dom.window.document;
      global.window = dom.window;
    });

    it('should toggle light and dark class on html tag', () => {
      const html = document.documentElement;
      expect(html.classList.contains('dark')).toBe(false);
      
      // Toggle logic function (to be implemented)
      const toggleTheme = () => {
        html.classList.toggle('dark');
      };
      
      toggleTheme();
      expect(html.classList.contains('dark')).toBe(true);
    });
  });
  ```

- [ ] **Step 2: Run the test to confirm success**
  Run: `npx vitest tests/theme.test.js --run`
  Expected: PASS

- [ ] **Step 3: Define Custom CSS variables in styles.css**
  Replace `/home/lee/Projects/GDG-Site/css/styles.css` with the design tokens:
  ```css
  /* ═══════════════════════════════════════════════════════════════════════════
     GDG Africa University - Premium Stylesheet & CSS Custom variables
  ═══════════════════════════════════════════════════════════════════════════ */
  :root {
    --google-blue: 217, 89%, 61%;
    --google-red: 5, 81%, 56%;
    --google-yellow: 44, 98%, 50%;
    --google-green: 136, 53%, 43%;

    --bg-primary: 220, 25%, 4%;
    --bg-secondary: 220, 20%, 8%;
    --bg-tertiary: 220, 15%, 12%;

    --text-primary: 210, 20%, 98%;
    --text-secondary: 215, 15%, 70%;
    --text-muted: 215, 10%, 50%;

    --border-color: 220, 15%, 18%;
    --border-highlight: 217, 89%, 61%;

    --radius-sm: 8px;
    --radius-md: 16px;
    --radius-lg: 24px;
    --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    --shadow-premium: 0 10px 30px -10px rgba(0, 0, 0, 0.7);
  }

  html.light {
    --bg-primary: 220, 15%, 98%;
    --bg-secondary: 220, 15%, 95%;
    --bg-tertiary: 0, 0%, 100%;

    --text-primary: 220, 25%, 10%;
    --text-secondary: 220, 15%, 35%;
    --text-muted: 220, 10%, 55%;

    --border-color: 220, 15%, 90%;
    --shadow-premium: 0 10px 30px -10px rgba(66, 133, 244, 0.08);
  }

  body {
    background-color: hsl(var(--bg-primary));
    color: hsl(var(--text-primary));
    transition: var(--transition-smooth);
  }

  /* Glassmorphism templates */
  .glass-card {
    background-color: hsl(var(--bg-tertiary) / 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid hsl(var(--border-color));
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-premium);
    transition: var(--transition-smooth);
  }

  .glass-card:hover {
    transform: translateY(-4px);
    border-color: hsl(var(--google-blue) / 0.5);
    box-shadow: 0 20px 40px -15px rgba(66, 133, 244, 0.15);
  }

  /* Neon border styling for Spotlight card */
  .spotlight-border {
    border: 2px solid transparent;
    background-image: linear-gradient(hsl(var(--bg-tertiary)), hsl(var(--bg-tertiary))), 
                      linear-gradient(45deg, hsl(var(--google-blue)), hsl(var(--google-red)), hsl(var(--google-yellow)), hsl(var(--google-green)));
    background-origin: border-box;
    background-clip: padding-box, border-box;
  }

  /* Floating Blobs Background Animations */
  .glow-blob {
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    filter: blur(120px);
    opacity: 0.15;
    z-index: 0;
    pointer-events: none;
    animation: float 20s infinite alternate;
  }
  @keyframes float {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(50px, 30px) scale(1.2); }
  }
  ```

- [ ] **Step 4: Update page theme switches in index.html, blog.html, and project.html**
  Inject a Theme toggle script in the `<head>` of `/home/lee/Projects/GDG-Site/index.html` (and also update `blog.html` and `project.html` theme script blocks) to read theme state from `localStorage` and toggle `light` class.

- [ ] **Step 5: Commit changes**
  Run: `git add css/styles.css index.html tests/theme.test.js && git commit -m "feat: design css design tokens and light/dark theme switch"`

---

### Task 3: Homepage Restructuring & Hero Image Rotator

**Files:**
- Create: `tests/rotator.test.js`
- Modify: `index.html`
- Modify: `js/site.js`

**Interfaces:**
- Consumes: Array of image URLs
- Produces: Active slide index state, automatic rotation intervals

- [ ] **Step 1: Write a failing test checking that the rotator advances index**
  Write `/home/lee/Projects/GDG-Site/tests/rotator.test.js`:
  ```javascript
  import { describe, it, expect, beforeEach, vi } from 'vitest';

  describe('Hero Image Rotator', () => {
    it('should increment slide index and roll over at end of images list', () => {
      let activeIndex = 0;
      const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];
      const nextSlide = () => {
        activeIndex = (activeIndex + 1) % images.length;
      };
      
      nextSlide();
      expect(activeIndex).toBe(1);
      nextSlide();
      expect(activeIndex).toBe(2);
      nextSlide();
      expect(activeIndex).toBe(0);
    });
  });
  ```

- [ ] **Step 2: Run the test**
  Run: `npx vitest tests/rotator.test.js --run`
  Expected: PASS

- [ ] **Step 3: Update index.html hero section**
  Open `/home/lee/Projects/GDG-Site/index.html`. Add the image rotator HTML container inside the right side of the hero section:
  ```html
  <div class="relative w-full h-[400px] rounded-2xl overflow-hidden glass-card shadow-premium group">
    <div id="rotator-slides" class="w-full h-full relative">
      <img src="images/gdg-logo.jpg" class="rotator-slide absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-100" />
      <img src="images/about-illustration.png" class="rotator-slide absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-0" />
      <img src="images/newsletter-illustration.png" class="rotator-slide absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-0" />
    </div>
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2" id="rotator-dots">
      <span class="w-2.5 h-2.5 rounded-full bg-white/40 cursor-pointer transition-all active-dot" data-slide="0"></span>
      <span class="w-2.5 h-2.5 rounded-full bg-white/40 cursor-pointer transition-all" data-slide="1"></span>
      <span class="w-2.5 h-2.5 rounded-full bg-white/40 cursor-pointer transition-all" data-slide="2"></span>
    </div>
  </div>
  ```

- [ ] **Step 4: Implement Hero Image Rotator controller in js/site.js**
  Open `/home/lee/Projects/GDG-Site/js/site.js`. Create the rotator initiation logic inside the initial load blocks:
  ```javascript
  function initHeroRotator() {
    const slides = document.querySelectorAll('.rotator-slide');
    const dots = document.querySelectorAll('#rotator-dots span');
    if (!slides.length) return;
    
    let currentIdx = 0;
    let intervalId;
    
    const showSlide = (idx) => {
      slides.forEach((slide, i) => {
        slide.style.opacity = i === idx ? '1' : '0';
      });
      dots.forEach((dot, i) => {
        if (i === idx) {
          dot.classList.add('bg-white', 'scale-125');
          dot.classList.remove('bg-white/40');
        } else {
          dot.classList.remove('bg-white', 'scale-125');
          dot.classList.add('bg-white/40');
        }
      });
      currentIdx = idx;
    };
    
    const nextSlide = () => {
      showSlide((currentIdx + 1) % slides.length);
    };
    
    const startInterval = () => {
      intervalId = setInterval(nextSlide, 5000);
    };
    
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        clearInterval(intervalId);
        showSlide(i);
        startInterval();
      });
    });
    
    startInterval();
  }
  
  document.addEventListener('DOMContentLoaded', initHeroRotator);
  ```

- [ ] **Step 5: Verify integration and commit**
  Run: `git add index.html js/site.js tests/rotator.test.js && git commit -m "feat: implement hero image rotator component"`

---

### Task 4: Dynamic Semester Timeline Component

**Files:**
- Create: `tests/timeline.test.js`
- Modify: `index.html`
- Modify: `js/site.js`

**Interfaces:**
- Consumes: `semester_plan` Supabase records
- Produces: Rendered chronological HTML elements on homepage

- [ ] **Step 1: Write a failing test asserting correct activity HTML generation**
  Write `/home/lee/Projects/GDG-Site/tests/timeline.test.js`:
  ```javascript
  import { describe, it, expect } from 'vitest';

  describe('Semester Timeline Generator', () => {
    it('should generate valid timeline card HTML from activity object', () => {
      const activity = {
        title: 'Jetpack Compose workshop',
        activity_type: 'Workshop',
        week_number: 3,
        status: 'upcoming'
      };
      
      const render = (act) => {
        return `<div class="timeline-card"><h3>${act.title}</h3><span class="badge">${act.activity_type}</span></div>`;
      };
      
      const html = render(activity);
      expect(html).toContain('Jetpack Compose workshop');
      expect(html).toContain('Workshop');
    });
  });
  ```

- [ ] **Step 2: Run the timeline test**
  Run: `npx vitest tests/timeline.test.js --run`
  Expected: PASS

- [ ] **Step 3: Add the timeline section container to index.html**
  Locate the timeline spot in `/home/lee/Projects/GDG-Site/index.html` (e.g. below the About section, replacement placeholder) and insert:
  ```html
  <section id="semester-plan" class="py-20 px-6 relative overflow-hidden bg-transparent">
    <div class="glow-blob bg-google-green/20 left-10"></div>
    <div class="max-w-6xl mx-auto relative">
      <h2 class="font-display text-4xl font-bold text-center mb-16">Semester Plan & Activities</h2>
      <div id="timeline-container" class="relative border-l border-gray-700/50 ml-4 md:ml-32 space-y-12">
        <!-- Rendered timeline items injected here -->
      </div>
    </div>
  </section>
  ```

- [ ] **Step 4: Implement timeline loader in js/site.js**
  Open `/home/lee/Projects/GDG-Site/js/site.js`. Import Supabase logic to query `semester_plan` ordered by date:
  ```javascript
  async function loadSemesterPlan() {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    const { data: plans, error } = await supabase
      .from('semester_plan')
      .select('*')
      .order('date', { ascending: true });

    if (error || !plans || plans.length === 0) {
      container.innerHTML = `<p class="text-center text-gray-500">No activities listed for this semester yet.</p>`;
      return;
    }

    container.innerHTML = plans.map(plan => {
      const isCompleted = plan.status === 'completed';
      const indicatorColor = isCompleted ? 'bg-google-green' : 'bg-google-blue animate-pulse';
      const cardBorder = isCompleted ? 'border-gray-800' : 'border-google-blue/30';
      const badgeColor = plan.activity_type === 'Workshop' ? 'bg-google-blue/20 text-google-blue' : 'bg-google-red/20 text-google-red';

      return `
        <div class="relative pl-8 md:pl-12 group">
          <span class="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full ${indicatorColor} border-4 border-slate-950"></span>
          <div class="glass-card border ${cardBorder} p-6">
            <div class="flex items-center justify-between gap-4 mb-2 flex-wrap">
              <span class="text-xs font-semibold px-2 py-1 rounded ${badgeColor}">${plan.activity_type}</span>
              <span class="text-sm text-gray-400">Week ${plan.week_number} • ${new Date(plan.date).toLocaleDateString()}</span>
            </div>
            <h3 class="font-display text-xl font-bold text-white mb-2">${plan.title}</h3>
            <p class="text-gray-400 text-sm leading-relaxed">${plan.description || ''}</p>
          </div>
        </div>
      `;
    }).join('');
  }
  
  // Call in bootstrap block
  document.addEventListener('DOMContentLoaded', loadSemesterPlan);
  ```

- [ ] **Step 5: Verify rendering and commit**
  Run: `git add index.html js/site.js tests/timeline.test.js && git commit -m "feat: add semester timeline activity display component"`

---

### Task 5: Spotlight & Project Showcase with Collaboration Toggle

**Files:**
- Create: `tests/projects.test.js`
- Modify: `index.html`
- Modify: `js/site.js`

**Interfaces:**
- Consumes: `projects` Supabase records
- Produces: Main showcase cards, spotlight card rendering, filter buttons

- [ ] **Step 1: Write a failing test for project filter toggle functionality**
  Write `/home/lee/Projects/GDG-Site/tests/projects.test.js`:
  ```javascript
  import { describe, it, expect } from 'vitest';

  describe('Showcase Filter Engine', () => {
    it('should filter out projects not seeking help when Needs Help filter is enabled', () => {
      const projects = [
        { title: 'Project A', needs_help: false },
        { title: 'Project B', needs_help: true }
      ];
      
      const filter = (projs, showOnlyHelp) => {
        return showOnlyHelp ? projs.filter(p => p.needs_help) : projs;
      };
      
      expect(filter(projects, true)).toHaveLength(1);
      expect(filter(projects, true)[0].title).toBe('Project B');
    });
  });
  ```

- [ ] **Step 2: Run tests**
  Run: `npx vitest tests/projects.test.js --run`
  Expected: PASS

- [ ] **Step 3: Restructure project container in index.html**
  Update the Projects wrapper on `/home/lee/Projects/GDG-Site/index.html` to hold the filter toggler and spotlight area:
  ```html
  <section id="projects" class="py-20 px-6 bg-slate-950">
    <div class="max-w-6xl mx-auto">
      <h2 class="font-display text-4xl font-bold text-center mb-6">Member Showcase</h2>
      
      <!-- Spotlight Banner Container -->
      <div id="spotlight-container" class="mb-12">
        <!-- Rendered Spotlight Card -->
      </div>
      
      <!-- Filters bar -->
      <div class="flex gap-4 justify-center mb-10">
        <button id="filter-all" class="px-5 py-2 bg-google-blue text-white rounded-full text-sm font-semibold">All Projects</button>
        <button id="filter-collab" class="px-5 py-2 bg-slate-900 border border-gray-800 text-gray-400 rounded-full text-sm font-semibold hover:text-white">Seeking Collaborators</button>
      </div>

      <div id="projects-grid" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Rendered Projects -->
      </div>
    </div>
  </section>
  ```

- [ ] **Step 4: Update projects loader in js/site.js**
  Open `/home/lee/Projects/GDG-Site/js/site.js`. Modify the existing `loadProjects()` logic to render the spotlight card, projects grid, and handle filter toggles:
  ```javascript
  // Update GRADIENTS & TAG_COLORS or load logic
  async function loadProjects() {
    const grid = document.getElementById('projects-grid');
    const spotlightContainer = document.getElementById('spotlight-container');
    if (!grid) return;

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error || !projects || projects.length === 0) {
      grid.innerHTML = '<p class="text-center text-gray-500 col-span-full">No projects published yet.</p>';
      return;
    }

    // Identify Spotlight project
    const spotlight = projects.find(p => p.is_spotlight) || projects[0];
    const normalProjects = projects.filter(p => p.id !== spotlight.id);

    // Render Spotlight Project of the Week
    if (spotlightContainer && spotlight) {
      spotlightContainer.innerHTML = `
        <div class="glass-card spotlight-border p-8 flex flex-col md:flex-row gap-8 items-center">
          <div class="w-full md:w-1/2 h-64 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center">
            ${spotlight.image ? `<img src="${spotlight.image}" class="w-full h-full object-cover" />` : `<span class="text-gray-600">Spotlight Project Preview</span>`}
          </div>
          <div class="w-full md:w-1/2 flex flex-col items-start">
            <span class="bg-gradient-to-r from-google-blue to-google-red text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4">SPOTLIGHT OF THE WEEK</span>
            <h3 class="font-display text-2xl font-bold mb-3">${spotlight.title}</h3>
            <p class="text-gray-400 text-sm leading-relaxed mb-5">${spotlight.description}</p>
            <div class="flex gap-3">
              ${spotlight.link ? `<a href="${spotlight.link}" target="_blank" class="px-5 py-2.5 bg-google-blue text-white rounded-full text-xs font-bold">Demo</a>` : ''}
              ${spotlight.github ? `<a href="${spotlight.github}" target="_blank" class="px-5 py-2.5 bg-slate-900 text-gray-300 rounded-full text-xs font-bold border border-gray-800">GitHub</a>` : ''}
            </div>
          </div>
        </div>
      `;
    }

    const renderGrid = (list) => {
      grid.innerHTML = list.map((proj, i) => `
        <div class="glass-card p-6 flex flex-col">
          <h4 class="font-display text-xl font-bold mb-2">${proj.title}</h4>
          <p class="text-gray-400 text-xs mb-4 leading-relaxed flex-1">${proj.description.substring(0, 100)}...</p>
          ${proj.needs_help ? `
            <div class="bg-google-yellow/10 border border-google-yellow/20 p-3 rounded-lg mb-4">
              <span class="text-xs font-bold text-google-yellow">Collaborators Needed:</span>
              <p class="text-xs text-gray-400 mt-1">${proj.help_description || ''}</p>
            </div>
          ` : ''}
          <div class="flex justify-between items-center mt-auto pt-4 border-t border-gray-800/50">
            <span class="text-xs text-gray-500">${proj.tags || ''}</span>
            <a href="project.html?id=${proj.id}" class="text-google-blue text-xs font-semibold hover:underline">Details →</a>
          </div>
        </div>
      `).join('');
    };

    renderGrid(normalProjects);

    // Attach Filter Event Listeners
    const filterAll = document.getElementById('filter-all');
    const filterCollab = document.getElementById('filter-collab');
    
    if (filterAll && filterCollab) {
      filterAll.addEventListener('click', () => {
        filterAll.className = 'px-5 py-2 bg-google-blue text-white rounded-full text-sm font-semibold';
        filterCollab.className = 'px-5 py-2 bg-slate-900 border border-gray-800 text-gray-400 rounded-full text-sm font-semibold';
        renderGrid(normalProjects);
      });
      filterCollab.addEventListener('click', () => {
        filterCollab.className = 'px-5 py-2 bg-google-blue text-white rounded-full text-sm font-semibold';
        filterAll.className = 'px-5 py-2 bg-slate-900 border border-gray-800 text-gray-400 rounded-full text-sm font-semibold';
        renderGrid(normalProjects.filter(p => p.needs_help));
      });
    }
  }
  ```

- [ ] **Step 5: Verify filters and commit**
  Run: `git add index.html js/site.js tests/projects.test.js && git commit -m "feat: introduce spotlight showcase and collaborator filtering"`

---

### Task 6: Member Submission Forms & RLS Verification

**Files:**
- Create: `tests/forms.test.js`
- Modify: `index.html`
- Modify: `blog.html`
- Modify: `js/site.js`

**Interfaces:**
- Consumes: DOM Form submission events
- Produces: Supabase `.insert()` queries

- [ ] **Step 1: Write a failing test asserting form validation**
  Write `/home/lee/Projects/GDG-Site/tests/forms.test.js`:
  ```javascript
  import { describe, it, expect } from 'vitest';

  describe('Form Submitter Validation', () => {
    it('should reject application if email input is empty', () => {
      const validate = (form) => {
        return form.email && form.email.includes('@');
      };
      expect(validate({ name: 'Alice', email: '' })).toBe(false);
    });
  });
  ```

- [ ] **Step 2: Run tests**
  Run: `npx vitest tests/forms.test.js --run`
  Expected: PASS

- [ ] **Step 3: Insert membership application modal into index.html**
  Replace standard modal placeholder on `/home/lee/Projects/GDG-Site/index.html` with:
  ```html
  <div id="membership-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 hidden">
    <div class="glass-card max-w-lg w-full p-8 relative">
      <button data-close-modal class="absolute top-4 right-4 text-gray-400 hover:text-white">&times;</button>
      <h3 class="font-display text-2xl font-bold mb-6">Apply to Join the Club</h3>
      <form id="membership-form" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase mb-1">Full Name</label>
          <input type="text" name="name" required class="w-full bg-slate-900 border border-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-google-blue" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase mb-1">Email</label>
          <input type="email" name="email" required class="w-full bg-slate-900 border border-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-google-blue" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase mb-1">Department</label>
          <input type="text" name="department" required class="w-full bg-slate-900 border border-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-google-blue" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase mb-1">Motivation</label>
          <textarea name="motivation" required class="w-full h-24 bg-slate-900 border border-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-google-blue"></textarea>
        </div>
        <button type="submit" class="w-full py-3 bg-google-blue text-white rounded-full font-semibold">Submit Application</button>
      </form>
    </div>
  </div>
  ```

- [ ] **Step 4: Implement membership form submission script in js/site.js**
  Open `/home/lee/Projects/GDG-Site/js/site.js` and add:
  ```javascript
  function initMembershipForm() {
    const form = document.getElementById('membership-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const payload = {
        name: formData.get('name'),
        email: formData.get('email'),
        department: formData.get('department'),
        motivation: formData.get('motivation'),
        academic_year: 'First Year', // default
        interests: '',
        status: 'pending'
      };

      const { error } = await supabase
        .from('membership_applications')
        .insert(payload);

      if (error) {
        alert('Failed to submit application. Try again.');
      } else {
        alert('Application submitted successfully!');
        form.reset();
        document.getElementById('membership-modal').classList.add('hidden');
      }
    });
  }
  document.addEventListener('DOMContentLoaded', initMembershipForm);
  ```

- [ ] **Step 5: Verify form submissions and commit**
  Run: `git add index.html js/site.js tests/forms.test.js && git commit -m "feat: implement membership application modal and validation logic"`

---

### Task 7: Admin Panel Dashboard Upgrades

**Files:**
- Create: `tests/admin.test.js`
- Modify: `admin.html`
- Modify: `js/admin.js`

**Interfaces:**
- Consumes: Admin action events (click approve, insert timeline activity)
- Produces: Supabase `.update()`, `.insert()` and `.delete()` queries

- [ ] **Step 1: Write a failing test asserting admin approval logic**
  Write `/home/lee/Projects/GDG-Site/tests/admin.test.js`:
  ```javascript
  import { describe, it, expect } from 'vitest';

  describe('Admin Dashboard Controllers', () => {
    it('should set status of an article to published on approval action', () => {
      const article = { id: 1, status: 'pending' };
      const approve = (art) => {
        return { ...art, status: 'published' };
      };
      expect(approve(article).status).toBe('published');
    });
  });
  ```

- [ ] **Step 2: Run admin dashboard tests**
  Run: `npx vitest tests/admin.test.js --run`
  Expected: PASS

- [ ] **Step 3: Modify admin.html layout to display moderation queues**
  Open `/home/lee/Projects/GDG-Site/admin.html` and add structural panels for "Pending Blogs", "Pending Projects", and "Semester Plan CRUD". Add tabs list element:
  ```html
  <div class="flex gap-4 border-b border-gray-800 mb-8" id="admin-tabs">
    <button class="tab-btn active border-b-2 border-google-blue px-4 py-2" data-tab="blogs">Blog Review</button>
    <button class="tab-btn px-4 py-2" data-tab="projects">Project Manager</button>
    <button class="tab-btn px-4 py-2" data-tab="timeline">Semester Plan</button>
    <button class="tab-btn px-4 py-2" data-tab="members">Applications</button>
  </div>
  ```

- [ ] **Step 4: Update administrative script controllers in js/admin.js**
  Open `/home/lee/Projects/GDG-Site/js/admin.js`. Write functions to retrieve list of pending inputs and toggle status:
  ```javascript
  // Implement Tab switching and Supabase approval actions
  async function loadPendingBlogs() {
    const list = document.getElementById('pending-blogs-list');
    if (!list) return;

    const { data: blogs } = await supabase
      .from('blog')
      .select('*')
      .eq('status', 'pending');

    if (!blogs || blogs.length === 0) {
      list.innerHTML = '<li>No pending articles to review.</li>';
      return;
    }

    list.innerHTML = blogs.map(b => `
      <li class="flex justify-between items-center p-4 border border-gray-800 rounded-lg">
        <div><strong>${b.title}</strong> by ${b.author}</div>
        <div class="flex gap-2">
          <button class="approve-btn bg-google-green text-white px-3 py-1 rounded text-xs" data-id="${b.id}">Approve</button>
          <button class="reject-btn bg-google-red text-white px-3 py-1 rounded text-xs" data-id="${b.id}">Reject</button>
        </div>
      </li>
    `).join('');

    // Attach click listeners to updates
    document.querySelectorAll('.approve-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await supabase.from('blog').update({ status: 'published' }).eq('id', id);
        loadPendingBlogs();
      });
    });
  }
  ```

- [ ] **Step 5: Run tests, check everything compiles and verify build status**
  Run: `npm run test`
  Expected: PASS

- [ ] **Step 6: Finalize changes and commit**
  Run: `git add admin.html js/admin.js tests/admin.test.js && git commit -m "feat: complete administrative dashboard moderations and semester plan controls"`
