/**
 * site.js  –  GDG Africa University | Main site module (Supabase powered)
 * Handles:
 *   1. All existing UI interactions from script.js (mobile menu, navbar, modal, back-to-top)
 *   2. Dynamic rendering of Projects, Team, Events & Testimonials from Supabase
 *   3. Lead Role Application form submission to Supabase
 */

import { supabase } from './supabase-config.js';

// ==========================================
//  COLOUR PALETTES (for dynamic cards)
// ==========================================
const GRADIENTS = [
  'from-google-red/30 to-google-yellow/20',
  'from-google-blue/30 to-google-green/20',
  'from-google-green/30 to-google-yellow/20',
  'from-google-yellow/30 to-google-green/20',
  'from-google-red/30 to-google-blue/20',
];
const TAG_COLORS = [
  'bg-google-blue/20 text-google-blue',
  'bg-google-red/20 text-google-red',
  'bg-google-green/20 text-google-green',
  'bg-google-yellow/20 text-google-yellow',
];
const AVATAR_GRADIENTS = [
  'from-google-blue to-google-green',
  'from-google-red to-google-yellow',
  'from-google-yellow to-google-green',
  'from-google-green to-google-blue',
];
const EVENT_ACCENT_CLASSES = [
  { bar: 'from-google-blue to-google-green', box: 'bg-google-blue/20', text: 'text-google-blue' },
  { bar: 'from-google-red to-google-yellow', box: 'bg-google-red/20', text: 'text-google-red' },
  { bar: 'from-google-yellow to-google-green', box: 'bg-google-yellow/20', text: 'text-google-yellow' },
];

// ==========================================
//  PROJECTS
// ==========================================
async function loadProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  // Render skeleton loaders
  grid.innerHTML = `
    ${Array(3).fill(`
      <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm animate-pulse">
        <div class="h-48 bg-gray-200"></div>
        <div class="p-6">
          <div class="flex gap-2 mb-3"><div class="h-4 w-12 bg-gray-200 rounded"></div><div class="h-4 w-12 bg-gray-200 rounded"></div></div>
          <div class="h-6 w-3/4 bg-gray-200 rounded mb-3"></div>
          <div class="h-4 w-full bg-gray-200 rounded mb-2"></div>
          <div class="h-4 w-5/6 bg-gray-200 rounded mb-4"></div>
          <div class="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    `).join('')}
  `;

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  // Always clear static HTML placeholders first
  grid.innerHTML = '';

  if (error || !data || data.length === 0) {
    // Show empty state + keep the 'Build With Us' CTA
    grid.innerHTML = `
      <div class="col-span-full md:col-span-2 lg:col-span-2 flex flex-col items-center justify-center py-16 text-center">
        <div class="w-20 h-20 rounded-2xl bg-google-green/10 flex items-center justify-center mb-5">
          <svg class="w-10 h-10 text-google-green/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
          </svg>
        </div>
        <h3 class="font-display text-2xl font-bold text-gray-900 mb-2">Projects Coming Soon</h3>
        <p class="text-gray-500 max-w-sm">Our members are building great things. The first projects will be showcased here shortly!</p>
        <a href="https://github.com/Le-e-lab" target="_blank" class="mt-4 text-google-blue text-sm font-semibold hover:underline">Browse our GitHub in the meantime →</a>
      </div>`;

    // Always add the Build With Us CTA card
    grid.insertAdjacentHTML('beforeend', `
      <div class="bg-gradient-to-br from-google-blue/10 to-google-green/10 border border-google-blue/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
        <div class="w-16 h-16 mb-6 rounded-full bg-google-blue/20 flex items-center justify-center">
          <svg class="w-8 h-8 text-google-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
        </div>
        <h3 class="font-display text-xl font-bold mb-2 text-gray-900">Build With Us</h3>
        <p class="text-gray-600 text-sm mb-6">Have an idea? Join our chapter and turn it into reality.</p>
        <button data-open-modal class="bg-google-blue text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-google-blue/90 transition-colors">Start Building</button>
      </div>`);
    attachModalTriggers();
    return;
  }

  // Data loaded — render project cards

  data.forEach((project, i) => {
    const gradient = GRADIENTS[i % GRADIENTS.length];
    const tags = project.tags ? project.tags.split(',').map(t => t.trim()) : [];
    const tagsHtml = tags.map((tag, j) => `<span class="px-2 py-1 rounded text-xs font-semibold ${TAG_COLORS[j % TAG_COLORS.length]}">${tag}</span>`).join('');
    const imageHtml = project.image
      ? `<img src="${project.image}" alt="${project.title}" class="w-full h-full object-cover">`
      : `<svg class="w-16 h-16 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>`;

    grid.insertAdjacentHTML('beforeend', `
      <a href="project.html?id=${project.id}" class="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow block card-hover">
        <div class="h-48 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden">
          ${imageHtml}
        </div>
        <div class="p-6">
          <div class="flex items-center gap-2 mb-3">${tagsHtml}</div>
          <h3 class="font-display text-xl font-bold mb-2 text-gray-900">${project.title}</h3>
          <p class="text-gray-600 text-sm leading-relaxed mb-4">${project.description.substring(0, 120)}${project.description.length > 120 ? '...' : ''}</p>
          <span class="text-google-blue text-sm font-semibold group-hover:text-gray-900 transition-colors inline-flex items-center gap-1">View Project <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></span>
        </div>
      </a>
    `);;
  });

  // Re-add the "Build With Us" CTA card
  grid.insertAdjacentHTML('beforeend', `
    <div class="bg-gradient-to-br from-google-blue/10 to-google-green/10 border border-google-blue/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
      <div class="w-16 h-16 mb-6 rounded-full bg-google-blue/20 flex items-center justify-center">
        <svg class="w-8 h-8 text-google-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
      </div>
      <h3 class="font-display text-xl font-bold mb-2 text-gray-900">Build With Us</h3>
      <p class="text-gray-600 text-sm mb-6">Have an idea? Join our chapter and turn it into reality.</p>
      <button data-open-modal class="bg-google-blue text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-google-blue/90 transition-colors">Start Building</button>
    </div>
  `);

  // Re-attach modal trigger for CTA card
  attachModalTriggers();

  // Refresh AOS animations since new DOM elements were added
  if (typeof AOS !== 'undefined') AOS.refresh();
}

const ROLE_BADGES = {
  'Chapter Lead': { label: 'LEAD', color: 'bg-google-blue' },
  'Technical Lead': { label: 'TECH', color: 'bg-google-red' },
  'Design Lead': { label: 'DESIGN', color: 'bg-google-yellow' },
  'Community Lead': { label: 'COMMUNITY', color: 'bg-google-green' },
  'Events Lead': { label: 'EVENTS', color: 'bg-google-red' },
  'Content Lead': { label: 'CONTENT', color: 'bg-google-blue' },
  'Member': { label: 'MEMBER', color: 'bg-gray-600' },
};
const ROLE_TEXT_COLORS = ['text-google-blue', 'text-google-red', 'text-google-yellow', 'text-google-green'];

async function loadTeam() {
  const grid = document.getElementById('team-grid');
  if (!grid) return;

  // Render skeleton loaders
  grid.innerHTML = `
    ${Array(4).fill(`
      <div class="text-center animate-pulse">
        <div class="w-32 h-32 mx-auto mb-6 rounded-full bg-gray-200"></div>
        <div class="h-5 w-3/4 bg-gray-200 rounded mx-auto mb-2"></div>
        <div class="h-4 w-1/2 bg-gray-200 rounded mx-auto mb-2"></div>
        <div class="h-4 w-full bg-gray-200 rounded mx-auto mb-4"></div>
        <div class="flex justify-center gap-3"><div class="w-6 h-6 bg-gray-200 rounded-full"></div><div class="w-6 h-6 bg-gray-200 rounded-full"></div></div>
      </div>
    `).join('')}
  `;

  const { data, error } = await supabase
    .from('team')
    .select('*')
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) return;

  grid.innerHTML = '';

  data.forEach((member, i) => {
    const gradient = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
    const initials = member.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const badge = ROLE_BADGES[member.role] || { label: member.role.split(' ')[0].toUpperCase(), color: 'bg-gray-600' };
    const initialsColor = ROLE_TEXT_COLORS[i % ROLE_TEXT_COLORS.length];

    const avatarHtml = member.image
      ? `<img src="${member.image}" alt="${member.name}" class="w-full h-full object-cover rounded-full">`
      : `<div class="w-full h-full rounded-full bg-white flex items-center justify-center">
            <span class="text-4xl font-bold ${initialsColor}">${initials}</span>
          </div>`;

    grid.insertAdjacentHTML('beforeend', `
      <div class="text-center group">
        <div class="relative w-32 h-32 mx-auto mb-6">
          <div class="w-full h-full rounded-full bg-gradient-to-br ${gradient} p-1">
            ${avatarHtml}
          </div>
          <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 ${badge.color} text-white text-xs font-bold px-3 py-1 rounded-full">
            ${badge.label}
          </div>
        </div>
        <h3 class="font-display text-xl font-bold text-gray-900 mb-1">${member.name}</h3>
        <p class="text-google-blue text-sm mb-1">${member.role}</p>
        ${member.bio ? `<p class="text-gray-600 text-sm mb-3">${member.bio}</p>` : '<div class="mb-3"></div>'}
        <div class="flex justify-center gap-3 mt-4">
          ${member.linkedin ? `<a href="${member.linkedin}" target="_blank" class="text-gray-500 hover:text-google-blue transition-colors"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>` : ''}
          ${member.github ? `<a href="${member.github}" target="_blank" class="text-gray-500 hover:text-gray-900 transition-colors"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>` : ''}
        </div>
      </div>
    `);
  });
}

// ==========================================
//  EVENTS
// ==========================================
async function loadEvents() {
  const grid = document.getElementById('events-grid');
  if (!grid) return;

  // Render skeleton loaders
  grid.innerHTML = `
    ${Array(3).fill(`
      <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm animate-pulse">
        <div class="h-3 bg-gray-200"></div>
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-14 h-14 rounded-xl bg-gray-200"></div>
            <div class="flex-1"><div class="h-5 w-3/4 bg-gray-200 rounded mb-2"></div></div>
          </div>
          <div class="h-4 w-full bg-gray-200 rounded mb-2"></div>
          <div class="h-4 w-5/6 bg-gray-200 rounded mb-4"></div>
          <div class="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    `).join('')}
  `;

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (error || !data || data.length === 0) {
    grid.innerHTML = `
      <div class="col-span-3 py-16 text-center flex flex-col items-center gap-3">
        <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        <p class="text-gray-400 font-medium">No upcoming events scheduled yet. Check back soon!</p>
        <a href="https://gdsc.community.dev/" target="_blank" class="text-google-blue text-sm font-semibold hover:underline">View past events on Bevy →</a>
      </div>`;
    return;
  }

  grid.innerHTML = '';

  data.forEach((event, i) => {
    const accent = EVENT_ACCENT_CLASSES[i % EVENT_ACCENT_CLASSES.length];
    const eventDate = new Date(event.date);
    const month = eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = eventDate.getDate().toString().padStart(2, '0');

    grid.insertAdjacentHTML('beforeend', `
      <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow card-hover">
        <div class="h-3 bg-gradient-to-r ${accent.bar}"></div>
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-14 h-14 rounded-xl ${accent.box} flex flex-col items-center justify-center">
              <span class="text-xs ${accent.text} font-bold">${month}</span>
              <span class="text-xl text-gray-900 font-bold">${day}</span>
            </div>
            <div>
              <h4 class="text-gray-900 font-bold">${event.title}</h4>
            </div>
          </div>
          <p class="text-gray-600 text-sm mb-4">${event.description}</p>
          ${event.link ? `<a href="${event.link}" target="_blank" class="text-google-blue text-xs font-semibold hover:underline">Register on Bevy →</a>` : ''}
        </div>
      </div>
    `);
  });
}

// ==========================================
//  TESTIMONIALS
// ==========================================
async function loadTestimonials() {
  const grid = document.getElementById('testimonials-grid');
  if (!grid) return;

  // Render skeleton loaders (grid needs to parent elements directly, assuming flex layout inside)
  grid.innerHTML = `
    ${Array(2).fill(`
      <div class="bg-gray-50 border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col justify-between hidden md:flex animate-pulse">
        <div><div class="h-6 w-full bg-gray-200 rounded mb-2"></div><div class="h-6 w-5/6 bg-gray-200 rounded mb-6"></div></div>
        <div class="flex items-center gap-4"><div class="w-12 h-12 rounded-full bg-gray-200"></div><div><div class="h-4 w-24 bg-gray-200 rounded mb-1"></div><div class="h-3 w-16 bg-gray-200 rounded"></div></div></div>
      </div>
    `).join('')}
  `;

  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });

  // If no testimonials yet, hide the whole section cleanly
  if (error || !data || data.length === 0) {
    // Clear all placeholder/loading text — show nothing
    grid.innerHTML = '';
    // Also hide the parent section so there is no empty space
    const section = document.getElementById('testimonials');
    if (section) section.classList.add('hidden');
    return;
  }

  const stars = `<div class="flex items-center gap-1 mb-4">${Array(5).fill('<svg class="w-5 h-5 text-google-yellow" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>').join('')}</div>`;

  grid.innerHTML = '';

  data.forEach((t, i) => {
    const gradient = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
    const initials = t.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const avatarHtml = t.image_url
      ? `<img src="${t.image_url}" alt="${t.name}" class="w-full h-full object-cover rounded-full">`
      : initials;

    grid.insertAdjacentHTML('beforeend', `
      <div class="bg-gray-50 rounded-2xl p-8 border border-gray-100">
        ${stars}
        <p class="text-gray-600 leading-relaxed mb-6">"${t.content}"</p>
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold overflow-hidden">
            ${avatarHtml}
          </div>
          <div>
            <h4 class="font-bold text-gray-900">${t.name}</h4>
            <p class="text-gray-500 text-sm">${t.role}</p>
          </div>
        </div>
      </div>
    `);
  });
}

// ==========================================
//  LEAD ROLE APPLICATION FORM
// ==========================================
async function handleApplicationForm() {
  const form = document.getElementById('apply-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('apply-submit-btn');
    const successDiv = document.getElementById('apply-success');
    const errorDiv = document.getElementById('apply-error');

    btn.textContent = 'Submitting...';
    btn.disabled = true;
    errorDiv.classList.add('hidden');
    successDiv.classList.add('hidden');

    const formData = new FormData(form);
    const skills = `[${formData.get('level')}] ${formData.get('skills')}`;

    const { error } = await supabase.from('applications').insert([{
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      skills: skills,
    }]);

    btn.textContent = 'Submit Application';
    btn.disabled = false;

    if (error) {
      errorDiv.textContent = 'Something went wrong: ' + error.message;
      errorDiv.classList.remove('hidden');
    } else {
      form.reset();
      successDiv.classList.remove('hidden');
      btn.classList.add('hidden');
    }
  });
}

// ==========================================
//  NEWSLETTER FORM
// ==========================================
async function handleNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('newsletter-submit-btn');
    const successDiv = document.getElementById('newsletter-success');
    const errorDiv = document.getElementById('newsletter-error');

    btn.textContent = 'Subscribing...';
    btn.disabled = true;
    errorDiv.classList.add('hidden');
    successDiv.classList.add('hidden');

    const formData = new FormData(form);
    
    // Insert into Supabase
    const { error } = await supabase.from('newsletter_subscribers').insert([{
      email: formData.get('email')
    }]);

    btn.textContent = 'Subscribe';
    btn.disabled = false;

    if (error) {
       // if error code 23505 it means duplicate email (UNIQUE constraint)
       if(error.code === '23505') {
         errorDiv.textContent = 'This email is already subscribed!';
       } else {
         errorDiv.textContent = 'Something went wrong: ' + error.message;
       }
       errorDiv.classList.remove('hidden');
    } else {
       form.reset();
       successDiv.classList.remove('hidden');
       form.classList.add('hidden'); // hide the form to indicate success
    }
  });
}

// ==========================================
//  UI INTERACTIONS (from original script.js)
// ==========================================
function initUI() {
  // Mobile menu
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => mobileMenu.classList.add('hidden')));
  }

  // Navbar scroll shadow
  const nav = document.querySelector('nav');
  if (nav) window.addEventListener('scroll', () => nav.classList.toggle('shadow-lg', window.scrollY > 50));

  // Back to top
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('opacity-0', window.scrollY <= 500);
      backToTop.classList.toggle('invisible', window.scrollY <= 500);
      backToTop.classList.toggle('opacity-100', window.scrollY > 500);
      backToTop.classList.toggle('visible', window.scrollY > 500);
    });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // Active nav highlighting
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 100) current = section.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.toggle('text-google-blue', link.getAttribute('href') === `#${current}`);
    });
  });

  // Scroll Animations (Intersection Observer)
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
        entry.target.classList.remove('opacity-0', 'translate-y-8');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    el.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700', 'ease-out');
    observer.observe(el);
  });

  // Membership modal
  attachModalTriggers();
}

function attachModalTriggers() {
  const membershipModal = document.getElementById('membership-modal');
  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (membershipModal) { membershipModal.classList.add('active'); document.body.style.overflow = 'hidden'; }
    });
  });
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (membershipModal) { membershipModal.classList.remove('active'); document.body.style.overflow = ''; }
    });
  });
  if (membershipModal) {
    membershipModal.addEventListener('click', (e) => {
      if (e.target === membershipModal) { membershipModal.classList.remove('active'); document.body.style.overflow = ''; }
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && membershipModal?.classList.contains('active')) {
      membershipModal.classList.remove('active'); document.body.style.overflow = '';
    }
  });
}

// ==========================================
//  BLOG UPDATES
// ==========================================
async function checkBlogUpdates() {
  const { count, error } = await supabase
    .from('blog')
    .select('id', { count: 'exact', head: true });

  if (error || count === null) return;

  const seenCount = parseInt(localStorage.getItem('blog_seen_count') || '0', 10);
  const newPosts = count - seenCount;

  if (newPosts > 0) {
    const desktopBadge = document.getElementById('blog-badge');
    const mobileBadge = document.getElementById('mobile-blog-badge');

    if (desktopBadge) {
      desktopBadge.textContent = newPosts;
      desktopBadge.classList.remove('hidden');
    }
    if (mobileBadge) {
      mobileBadge.textContent = newPosts;
      mobileBadge.classList.remove('hidden');
    }
  }
}

// ==========================================
//  INIT
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  initUI();
  await Promise.all([loadProjects(), loadTeam(), loadEvents(), loadTestimonials(), checkBlogUpdates()]);
  handleApplicationForm();
  handleNewsletterForm();

  const showApplyBtn = document.getElementById('show-apply-btn');
  const applySection = document.getElementById('apply');
  if (showApplyBtn && applySection) {
    showApplyBtn.addEventListener('click', () => {
      applySection.classList.remove('hidden');
      applySection.scrollIntoView({ behavior: 'smooth' });
    });
  }
});
