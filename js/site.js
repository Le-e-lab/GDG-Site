/**
 * site.js  –  GDG Africa University | Main site module (Supabase powered)
 * Handles:
 *   1. All existing UI interactions from script.js (mobile menu, navbar, modal, back-to-top)
 *   2. Dynamic rendering of Projects, Team, Events & Testimonials from Supabase
 *   3. Lead Role Application form submission to Supabase
 */

import { supabase } from './supabase-config.js';

// ==========================================
//  PRELOADER - Terminal Typing + Image Preload
// ==========================================
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const linesContainer = document.getElementById('preloader-lines');
  const progressBar = document.getElementById('preloader-progress');
  const percentText = document.getElementById('preloader-percent');
  if (!preloader || !linesContainer) return;

  const terminalLines = [
    { type: 'cmd', text: 'init gdg-africa-university' },
    { type: 'output', text: '> Loading community modules...' },
    { type: 'cmd', text: 'fetch members --from=supabase' },
    { type: 'output', text: '> Connecting to database...' },
    { type: 'success', text: '✓ Members loaded successfully' },
    { type: 'cmd', text: 'preload hero-images --count=15' },
    { type: 'output', text: '> Fetching assets...' },
    { type: 'info', text: '> GDG Africa University v2.0' },
    { type: 'success', text: '✓ Ready to build the future' },
  ];

  let lineIdx = 0;
  const typeLine = () => {
    if (lineIdx >= terminalLines.length) return;
    const line = terminalLines[lineIdx];
    const div = document.createElement('div');
    div.className = 'preloader-line';
    if (line.type === 'cmd') {
      div.innerHTML = `<span class="cmd">$ ${line.text}</span>`;
    } else {
      div.innerHTML = `<span class="${line.type}">${line.text}</span>`;
    }
    linesContainer.appendChild(div);
    lineIdx++;
    const pct = Math.min(Math.round((lineIdx / terminalLines.length) * 70), 70);
    if (progressBar) progressBar.style.width = pct + '%';
    if (percentText) percentText.textContent = pct + '%';
    setTimeout(typeLine, 150 + Math.random() * 200);
  };

  setTimeout(typeLine, 300);

  // Preload hero images — club member photos
  const imagesToPreload = [
    'images/1000267438-compressed.jpg',
    'images/1000267415-compressed.jpg',
    'images/1000267427-compressed.jpg',
    'images/PHOTO-2025-09-05-06-21-59.jpg',
    'images/PHOTO-2025-09-10-18-45-24.jpg',
    'images/PHOTO-2025-09-05-06-21-11_2.jpg',
    'images/PHOTO-2025-09-05-06-21-11.jpg',
  ];

  let loaded = 0;
  const total = imagesToPreload.length;
  const startTime = Date.now();
  const MIN_DISPLAY_TIME = 3500; // 3.5 seconds minimum

  const onImageLoad = () => {
    loaded++;
    const pct = Math.min(70 + Math.round((loaded / total) * 30), 100);
    if (progressBar) progressBar.style.width = pct + '%';
    if (percentText) percentText.textContent = pct + '%';
    if (loaded >= total) finishPreloader();
  };

  imagesToPreload.forEach(src => {
    const img = new Image();
    img.onload = onImageLoad;
    img.onerror = onImageLoad;
    img.src = src;
  });

  // Safety timeout — 8 seconds max
  setTimeout(finishPreloader, 8000);

  let dismissed = false;
  function finishPreloader() {
    if (dismissed) return;
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);
    // Wait until minimum display time has passed
    setTimeout(() => {
      if (dismissed) return;
      dismissed = true;
      if (progressBar) progressBar.style.width = '100%';
      if (percentText) percentText.textContent = '100%';
      const doneLine = document.createElement('div');
      doneLine.className = 'preloader-line';
      doneLine.innerHTML = '<span class="success">✓ All systems ready</span>';
      linesContainer.appendChild(doneLine);
      setTimeout(() => {
        preloader.classList.add('hidden');
        setTimeout(() => preloader.remove(), 600);
      }, 800);
    }, remaining);
  }
}

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
// Module-level cache so filter toggles don't re-query Supabase
let projectsCache = [];

async function loadProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  // Render skeleton loaders
  grid.innerHTML = `
    ${Array(3).fill(`
      <div class="bg-brandBgTertiary border border-brandBorder rounded-2xl overflow-hidden shadow-sm animate-pulse">
        <div class="h-48 bg-brandBgSecondary"></div>
        <div class="p-6">
          <div class="flex gap-2 mb-3"><div class="h-4 w-12 bg-brandBgSecondary rounded"></div><div class="h-4 w-12 bg-brandBgSecondary rounded"></div></div>
          <div class="h-6 w-3/4 bg-brandBgSecondary rounded mb-3"></div>
          <div class="h-4 w-full bg-brandBgSecondary rounded mb-2"></div>
          <div class="h-4 w-5/6 bg-brandBgSecondary rounded mb-4"></div>
          <div class="h-4 w-24 bg-brandBgSecondary rounded"></div>
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
    projectsCache = [];
    // Show empty state + keep the 'Build With Us' CTA
    grid.innerHTML = `
      <div class="col-span-full md:col-span-2 lg:col-span-2 flex flex-col items-center justify-center py-16 text-center">
        <div class="w-20 h-20 rounded-2xl bg-google-green/10 flex items-center justify-center mb-5">
          <svg class="w-10 h-10 text-google-green/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
          </svg>
        </div>
        <h3 class="font-display text-2xl font-bold text-brandTextPrimary mb-2">Projects Coming Soon</h3>
        <p class="text-brandTextSecondary max-w-sm">Our members are building great things. The first projects will be showcased here shortly!</p>
        <a href="https://github.com/Le-e-lab" target="_blank" class="mt-4 text-google-blue text-sm font-semibold hover:underline">Browse our GitHub in the meantime →</a>
      </div>`;

    // Always add the Build With Us CTA card
    grid.insertAdjacentHTML('beforeend', buildWithUsCard());
    attachModalTriggers();
    return;
  }

  // Data loaded — store for filtering + render
  projectsCache = data;
  renderProjectCards('all');
  wireProjectFilters();
  attachModalTriggers();

  // Refresh AOS animations since new DOM elements were added
  if (typeof AOS !== 'undefined') AOS.refresh();
}

function projectCardHtml(project, i) {
  const gradient = GRADIENTS[i % GRADIENTS.length];
  const tags = project.tags ? project.tags.split(',').map(t => t.trim()) : [];
  const tagsHtml = tags.map((tag, j) => `<span class="px-2 py-1 rounded text-xs font-semibold ${TAG_COLORS[j % TAG_COLORS.length]}">${tag}</span>`).join('');
  const imageHtml = project.image
    ? `<img src="${project.image}" alt="${project.title}" class="w-full h-full object-cover">`
    : `<svg class="w-16 h-16 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>`;
  const helpHtml = project.needs_help
    ? `<div class="bg-google-yellow/10 border border-google-yellow/25 rounded-lg p-3 mb-4">
        <p class="text-xs font-bold text-google-yellow mb-1">Collaborators Needed</p>
        <p class="text-xs text-brandTextSecondary leading-relaxed">${project.help_description || 'This project is looking for teammates to join the build.'}</p>
      </div>`
    : '';

  return `
    <a href="project.html?v=v2&id=${project.id}" class="group bg-brandBgTertiary border border-brandBorder rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow block card-hover">
      <div class="h-48 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden">
        ${imageHtml}
      </div>
      <div class="p-6">
        <div class="flex items-center gap-2 mb-3">${tagsHtml}</div>
        <h3 class="font-display text-xl font-bold mb-2 text-brandTextPrimary">${project.title}</h3>
        <p class="text-brandTextSecondary text-sm leading-relaxed mb-4">${project.description.substring(0, 120)}${project.description.length > 120 ? '...' : ''}</p>
        ${helpHtml}
        <span class="text-google-blue text-sm font-semibold group-hover:text-brandTextPrimary transition-colors inline-flex items-center gap-1">View Project <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></span>
      </div>
    </a>
  `;
}

function buildWithUsCard() {
  return `
    <div class="bg-gradient-to-br from-google-blue/10 to-google-green/10 border border-google-blue/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
      <div class="w-16 h-16 mb-6 rounded-full bg-google-blue/20 flex items-center justify-center">
        <svg class="w-8 h-8 text-google-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
      </div>
      <h3 class="font-display text-xl font-bold mb-2 text-brandTextPrimary">Build With Us</h3>
      <p class="text-brandTextSecondary text-sm mb-6">Have an idea? Join our chapter and turn it into reality.</p>
      <button data-open-modal class="bg-google-blue text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-google-blue/90 transition-colors">Start Building</button>
    </div>
  `;
}

function renderProjectCards(filter) {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  const list = filter === 'collab'
    ? projectsCache.filter(p => p.needs_help)
    : projectsCache;

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-16 text-center">
        <div class="w-16 h-16 mb-5 rounded-2xl bg-google-yellow/10 flex items-center justify-center">
          <svg class="w-8 h-8 text-google-yellow/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
        </div>
        <h3 class="font-display text-xl font-bold text-brandTextPrimary mb-2">No Collaborators Needed Right Now</h3>
        <p class="text-brandTextSecondary max-w-sm text-sm">No projects are currently seeking teammates. Check back soon or view all projects!</p>
      </div>`;
    grid.insertAdjacentHTML('beforeend', buildWithUsCard());
    return;
  }

  grid.innerHTML = list.map(projectCardHtml).join('') + buildWithUsCard();
  attachModalTriggers();
  if (typeof AOS !== 'undefined') AOS.refresh();
}

function wireProjectFilters() {
  const filterAll = document.getElementById('filter-all');
  const filterCollab = document.getElementById('filter-collab');
  if (!filterAll || !filterCollab) return;

  const setActive = (active) => {
    filterAll.className = active === 'all'
      ? 'filter-btn px-5 py-2 bg-google-blue text-white rounded-full text-sm font-semibold shadow-sm hover:bg-google-blue/90 transition-colors'
      : 'filter-btn px-5 py-2 bg-brandBgTertiary border border-brandBorder text-brandTextSecondary rounded-full text-sm font-semibold hover:border-google-yellow/60 hover:text-brandTextPrimary transition-colors';
    filterCollab.className = active === 'collab'
      ? 'filter-btn px-5 py-2 bg-google-blue text-white rounded-full text-sm font-semibold shadow-sm hover:bg-google-blue/90 transition-colors'
      : 'filter-btn px-5 py-2 bg-brandBgTertiary border border-brandBorder text-brandTextSecondary rounded-full text-sm font-semibold hover:border-google-yellow/60 hover:text-brandTextPrimary transition-colors';
  };

  filterAll.addEventListener('click', () => { setActive('all'); renderProjectCards('all'); });
  filterCollab.addEventListener('click', () => { setActive('collab'); renderProjectCards('collab'); });
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
        <div class="w-32 h-32 mx-auto mb-6 rounded-full bg-brandBgSecondary border border-brandBorder"></div>
        <div class="h-5 w-3/4 bg-brandBgSecondary rounded mx-auto mb-2"></div>
        <div class="h-4 w-1/2 bg-brandBgSecondary rounded mx-auto mb-2"></div>
        <div class="h-4 w-full bg-brandBgSecondary rounded mx-auto mb-4"></div>
        <div class="flex justify-center gap-3"><div class="w-6 h-6 bg-brandBgSecondary rounded-full"></div><div class="w-6 h-6 bg-brandBgSecondary rounded-full"></div></div>
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
      : `<div class="w-full h-full rounded-full bg-brandBgSecondary flex items-center justify-center">
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
        <h3 class="font-display text-xl font-bold text-brandTextPrimary mb-1">${member.name}</h3>
        <p class="text-google-blue text-sm mb-1">${member.role}</p>
        ${member.bio ? `<p class="text-brandTextSecondary text-sm mb-3">${member.bio}</p>` : '<div class="mb-3"></div>'}
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
      <div class="bg-brandBgTertiary border border-brandBorder rounded-2xl overflow-hidden shadow-sm animate-pulse">
        <div class="h-3 bg-brandBgSecondary"></div>
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-14 h-14 rounded-xl bg-brandBgSecondary border border-brandBorder"></div>
            <div class="flex-1"><div class="h-5 w-3/4 bg-brandBgSecondary rounded mb-2"></div></div>
          </div>
          <div class="h-4 w-full bg-brandBgSecondary rounded mb-2"></div>
          <div class="h-4 w-5/6 bg-brandBgSecondary rounded mb-4"></div>
          <div class="h-4 w-24 bg-brandBgSecondary rounded"></div>
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
      <div class="bg-brandBgTertiary border border-brandBorder rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow card-hover">
        <div class="h-3 bg-gradient-to-r ${accent.bar}"></div>
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-14 h-14 rounded-xl ${accent.box} flex flex-col items-center justify-center">
              <span class="text-xs ${accent.text} font-bold">${month}</span>
              <span class="text-xl text-brandTextPrimary font-bold">${day}</span>
            </div>
            <div>
              <h4 class="text-brandTextPrimary font-bold">${event.title}</h4>
            </div>
          </div>
          <p class="text-brandTextSecondary text-sm mb-4">${event.description}</p>
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
      <div class="bg-brandBgSecondary border border-brandBorder rounded-2xl p-8 shadow-sm flex flex-col justify-between hidden md:flex animate-pulse">
        <div><div class="h-6 w-full bg-brandBgTertiary rounded mb-2"></div><div class="h-6 w-5/6 bg-brandBgTertiary rounded mb-6"></div></div>
        <div class="flex items-center gap-4"><div class="w-12 h-12 rounded-full bg-brandBgTertiary border border-brandBorder"></div><div><div class="h-4 w-24 bg-brandBgTertiary rounded mb-1"></div><div class="h-3 w-16 bg-brandBgTertiary rounded"></div></div></div>
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
      <div class="bg-brandBgSecondary rounded-2xl p-8 border border-brandBorder">
        ${stars}
        <p class="text-brandTextSecondary leading-relaxed mb-6">"${t.content}"</p>
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold overflow-hidden">
            ${avatarHtml}
          </div>
          <div>
            <h4 class="font-bold text-brandTextPrimary">${t.name}</h4>
            <p class="text-brandTextSecondary/80 text-sm">${t.role}</p>
          </div>
        </div>
      </div>
    `);
  });
}

// ==========================================
//  SEMESTER PLAN TIMELINE
// ==========================================
async function loadSemesterPlan() {
  const container = document.getElementById('timeline-container');
  if (!container) return;

  container.innerHTML = `
    <div class="flex items-center gap-3 py-2">
      <div class="w-4 h-4 rounded-full bg-google-blue/30 animate-pulse"></div>
      <p class="text-brandTextSecondary">Loading semester plan...</p>
    </div>
  `;

  const { data, error } = await supabase
    .from('semester_plan')
    .select('*')
    .order('date', { ascending: true });

  if (error || !data || data.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center gap-3 py-16 text-center">
        <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
        <p class="text-brandTextSecondary font-medium">No activities scheduled for this semester yet. Check back soon!</p>
      </div>`;
    return;
  }

  container.innerHTML = '';

  data.forEach((plan, i) => {
    const isCompleted = plan.status === 'completed';
    const isLive = plan.status === 'live' || plan.status === 'ongoing';
    const indicatorColor = isCompleted ? 'bg-google-green' : isLive ? 'bg-google-yellow' : 'bg-google-blue animate-pulse';
    const cardBorder = isCompleted ? 'border-brandBorder' : 'border-google-blue/30';
    const badgeColor = plan.activity_type === 'Workshop'
      ? 'bg-google-blue/20 text-google-blue'
      : plan.activity_type === 'Community'
        ? 'bg-google-green/20 text-google-green'
        : 'bg-google-red/20 text-google-red';
    const statusBadge = isCompleted
      ? '<span class="text-xs font-semibold px-2 py-1 rounded bg-google-green/20 text-google-green">Completed</span>'
      : isLive
        ? '<span class="text-xs font-semibold px-2 py-1 rounded bg-google-yellow/20 text-google-yellow">Live Now</span>'
        : '';
    const delay = Math.min(i * 60, 300);

    container.insertAdjacentHTML('beforeend', `
      <div class="relative pl-8 md:pl-12 group" data-aos="fade-up" data-aos-delay="${delay}">
        <span class="absolute -left-[9px] top-2 w-4 h-4 rounded-full ${indicatorColor} border-4 border-brandBgPrimary"></span>
        <div class="bg-brandBgTertiary border ${cardBorder} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between gap-4 mb-2 flex-wrap">
            <span class="text-xs font-semibold px-2 py-1 rounded ${badgeColor}">${plan.activity_type || 'Activity'}</span>
            ${statusBadge}
          </div>
          <h3 class="font-display text-xl font-bold text-brandTextPrimary mb-2">${plan.title}</h3>
          <p class="text-brandTextSecondary text-sm leading-relaxed">${plan.description || ''}</p>
          ${plan.date ? `<p class="text-brandTextSecondary/70 text-xs mt-4 flex items-center gap-1.5"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> ${new Date(plan.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>` : ''}
        </div>
      </div>
    `);
  });

  if (typeof AOS !== 'undefined') AOS.refresh();
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
  const hamburgerIcon = mobileMenuBtn ? mobileMenuBtn.querySelector('.hamburger-icon') : null;
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      if (hamburgerIcon) hamburgerIcon.classList.toggle('active');
    });
    mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      if (hamburgerIcon) hamburgerIcon.classList.remove('active');
    }));
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

async function initHeroGrid() {
  const track1 = document.getElementById('grid-track-1');
  const track2 = document.getElementById('grid-track-2');
  const track3 = document.getElementById('grid-track-3');
  if (!track1) return;

  // ALL club member photos — your actual images only
  const clubPhotos = [
    'images/1000267438-compressed.jpg',
    'images/1000267415-compressed.jpg',
    'images/1000267427-compressed.jpg',
    'images/PHOTO-2025-09-03-15-49-49.jpg',
    'images/PHOTO-2025-09-05-01-20-52.jpg',
    'images/PHOTO-2025-09-05-01-20-47.jpg',
    'images/PHOTO-2025-09-05-01-20-41.jpg',
    'images/PHOTO-2025-09-05-01-20-42.jpg',
    'images/PHOTO-2025-09-05-01-20-49.jpg',
    'images/PHOTO-2025-10-01-10-36-48.jpg',
    'images/PHOTO-2025-09-05-06-21-11.jpg',
    'images/PHOTO-2025-09-05-06-21-11_2.jpg',
    'images/PHOTO-2025-09-10-18-45-24.jpg',
    'images/PHOTO-2025-09-05-06-21-59.jpg',
    'images/gdg-logo.jpg',
  ];

  const allImages = clubPhotos;

  // Build image items for a track (duplicated for seamless loop)
  const buildTrack = (track, imgs) => {
    const doubled = [...imgs, ...imgs];
    track.innerHTML = doubled.map(src => `
      <div class="hero-grid-item">
        <img src="${src}" alt="GDG Community" loading="eager" fetchpriority="high" />
      </div>
    `).join('');
  };

  // Populate grid IMMEDIATELY with local images
  const row1 = allImages.filter((_, i) => i % 3 === 0);
  const row2 = allImages.filter((_, i) => i % 3 === 1);
  const row3 = allImages.filter((_, i) => i % 3 === 2);

  buildTrack(track1, row1.length > 0 ? row1 : allImages);
  buildTrack(track2, row2.length > 0 ? row2 : allImages);
  if (track3) buildTrack(track3, row3.length > 0 ? row3 : allImages);

  // THEN try to add Supabase member photos (non-blocking, fire and forget)
  supabase.from('team').select('image').not('image', 'is', null).limit(12)
    .then(({ data: members }) => {
      if (members && members.length > 0) {
        const memberImages = members.map(m => m.image).filter(Boolean);
        if (memberImages.length > 0) {
          const enriched = [...memberImages, ...localImages, ...extraImages];
          const r1 = enriched.filter((_, i) => i % 3 === 0);
          const r2 = enriched.filter((_, i) => i % 3 === 1);
          const r3 = enriched.filter((_, i) => i % 3 === 2);
          buildTrack(track1, r1.length > 0 ? r1 : enriched);
          buildTrack(track2, r2.length > 0 ? r2 : enriched);
          if (track3) buildTrack(track3, r3.length > 0 ? r3 : enriched);
        }
      }
    })
    .catch(() => {}); // silently fail
}

// ==========================================
//  MEMBER SPOTLIGHT
// ==========================================
async function loadSpotlight() {
  const container = document.getElementById('spotlight-container');
  if (!container) return;

  // Fetch the spotlight member (most recent spotlight_date or is_spotlight flag)
  const { data: spotlight, error } = await supabase
    .from('team')
    .select('*')
    .eq('is_spotlight', true)
    .order('spotlight_date', { ascending: false })
    .limit(1)
    .single();

  if (error || !spotlight) {
    // If no spotlight member, try to get the most recently added team member
    const { data: latest } = await supabase
      .from('team')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (!latest) {
      container.innerHTML = '<p class="text-center text-brandTextSecondary">No spotlight member yet. Check back soon!</p>';
      return;
    }
    renderSpotlight(latest);
    return;
  }

  renderSpotlight(spotlight);
}

function renderSpotlight(member) {
  const avatar = document.getElementById('spotlight-avatar');
  const name = document.getElementById('spotlight-name');
  const role = document.getElementById('spotlight-role');
  const quote = document.getElementById('spotlight-quote');
  const project = document.getElementById('spotlight-project');
  const socials = document.getElementById('spotlight-socials');

  if (avatar) avatar.src = member.image || 'images/gdg-logo.jpg';
  if (name) name.textContent = member.name;
  if (role) role.textContent = member.role;
  if (quote) quote.textContent = member.spotlight_quote || '"Proud to be part of the GDG Africa University community!"';
  
  if (project && member.spotlight_project) {
    project.innerHTML = `
      <div class="inline-flex items-center gap-2 bg-brandBgTertiary border border-brandBorder rounded-xl px-4 py-2">
        <svg class="w-5 h-5 text-google-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        <span class="text-sm text-brandTextSecondary">Currently working on: <strong class="text-brandTextPrimary">${member.spotlight_project}</strong></span>
      </div>
    `;
  }

  if (socials) {
    let socialsHtml = '';
    if (member.linkedin) {
      socialsHtml += `<a href="${member.linkedin}" target="_blank" class="w-10 h-10 rounded-full bg-brandBgTertiary border border-brandBorder flex items-center justify-center text-brandTextSecondary hover:text-google-blue hover:border-google-blue transition-all"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>`;
    }
    if (member.github) {
      socialsHtml += `<a href="${member.github}" target="_blank" class="w-10 h-10 rounded-full bg-brandBgTertiary border border-brandBorder flex items-center justify-center text-brandTextSecondary hover:text-brandTextPrimary hover:border-brandTextPrimary transition-all"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>`;
    }
    socials.innerHTML = socialsHtml;
  }
}

// ==========================================
//  HERO BACKGROUND IMAGE ROTATOR
// ==========================================
function initHeroBgRotator() {
  const slides = document.querySelectorAll('.hero-bg-slide');
  if (!slides.length) return;

  let currentIdx = 0;
  const intervalTime = 6000; // 6 seconds per slide

  const showSlide = (idx) => {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === idx);
    });
    currentIdx = idx;
  };

  const nextSlide = () => {
    showSlide((currentIdx + 1) % slides.length);
  };

  setInterval(nextSlide, intervalTime);
}

// ==========================================
//  SCROLL-TRIGGERED REVEAL ANIMATIONS
// ==========================================
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.scroll-reveal').forEach(el => {
    observer.observe(el);
  });
}

// ==========================================
//  NAV SCROLL EFFECT
// ==========================================
function initNavScroll() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });
}

// ==========================================
//  STAT COUNTER ANIMATION
// ==========================================
function initStatCounters() {
  const stats = document.querySelectorAll('.stat-number[data-count]');
  if (!stats.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const duration = 1500;
        const start = performance.now();

        const animate = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(target * eased);
          if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(stat => observer.observe(stat));
}

// ==========================================
//  INIT
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  initPreloader();
  initUI();
  initHeroBgRotator();
  initHeroGrid();
  initScrollReveal();
  initNavScroll();
  initStatCounters();
  await Promise.all([loadProjects(), loadTeam(), loadEvents(), loadTestimonials(), loadSpotlight(), loadSemesterPlan(), checkBlogUpdates()]);
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
