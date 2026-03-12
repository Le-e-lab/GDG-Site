# GDG Africa University Website

![GDG Badge](https://img.shields.io/badge/Google_Developer_Groups-Africa_University-blue.svg?logo=google&logoColor=white)

Welcome to the official website repository for the **Google Developer Groups (GDG) on Campus at Africa University**. This project serves as a dynamic, scalable, and beautifully designed landing page for our community, providing a centralized hub for events, team introductions, project showcases, and member applications.

## 🚀 Features

- **Modern UI/UX**: Built with Tailwind CSS and raw HTML/JS for peak performance and aesthetics (featuring animations, glassmorphism, and responsive design).
- **Dynamic Content**: Connected to a **Supabase** (PostgreSQL) backend to securely load and display:
  - 📝 **Blog Posts**
  - 🛠️ **Member Projects**
  - 👥 **Core Team Profiles**
  - 📅 **Upcoming Events**
  - 💬 **Testimonials**
- **Admin Dashboard**: A hidden secure panel (`/admin.html`) enabling community leads to seamlessly perform CRUD operations on all site data without touching code. Includes overview stats, search filtering, and customizable previews.
- **Lead Applications**: A public form where passionate members can apply to become Core Team leads, feeding directly into the Admin dashboard.
- **Newsletter Subscription**: Integrated mailing list captures.

## 💻 Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS (via CDN for zero-build-step simplicity)
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
- **Deployment**: Local testing via live-server, hosted on [Netlify](https://www.netlify.com/) / GitHub Pages.

## 🛠️ Setup & Local Development

This is a static site that relies entirely on frontend JavaScript and a remote Supabase project.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Le-e-lab/GDG-Site.git
   cd GDG-Site
   ```

2. **Configure Supabase (`supabase-config.js`):**
   - Ensure the URL and ANON API KEY in `supabase-config.js` match your active Supabase project.

3. **Database Schema:**
   - Go to your Supabase project dashboard -> **SQL Editor**.
   - Copy the contents of `database-schema.sql` and run it to initialize all required tables, Row Level Security (RLS) policies, and structure.

4. **Serve the project locally:**
   - Because it uses ES modules (`type="module"`), you cannot just double-click the `index.html` file.
   - Use a simple local server. For example:
     - **VS Code**: Install the "Live Server" extension and hit "Go Live".
     - **Node.js**: `npx serve .`
     - **Python**: `python -m http.server 8000`

5. **Access the Application**:
   - Public Site: `http://localhost:8000/index.html`
   - Admin Dashboard: `http://localhost:8000/admin.html` (Requires valid Supabase Auth credentials).

## 🗄️ Database Tables (Supabase)

Make sure the following tables are correctly configured with RLS policies in your Supabase project (refer to `database-schema.sql`):
- `blog`
- `projects`
- `team`
- `events`
- `testimonials`
- `applications`
- `newsletter_subscribers`

## 🤝 Contributing

We welcome community members to propose improvements!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingIdea`)
3. Commit your Changes (`git commit -m 'Add some AmazingIdea'`)
4. Push to the Branch (`git push origin feature/AmazingIdea`)
5. Open a Pull Request

---

*Build with us, learn with us, and grow with the GDG Africa University community.*
