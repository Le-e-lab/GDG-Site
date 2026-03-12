import { supabase } from './supabase-config.js';

async function fetchProjects() {
    const loadingEl = document.getElementById('blog-loading');
    const blogContainer = document.getElementById('blog-container');

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    // Store globally for search filtering
    window.allProjects = data || [];

    // Hide loading skeleton in all cases
    if (loadingEl) loadingEl.classList.add('hidden');
    if (blogContainer) {
        blogContainer.classList.remove('hidden');
        blogContainer.className = 'grid md:grid-cols-2 lg:grid-cols-3 gap-8';
    }

    if (error || !data || data.length === 0) {
        if (blogContainer) blogContainer.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-24 text-center">
                <div class="w-24 h-24 rounded-3xl bg-google-green/10 flex items-center justify-center mb-6">
                    <svg class="w-12 h-12 text-google-green/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                </div>
                <h3 class="font-display text-2xl font-bold text-gray-900 mb-3">No Projects Yet</h3>
                <p class="text-gray-500 max-w-sm">Our students are busy building. Check back soon for amazing solutions.</p>
            </div>`;
        return;
    }

    let currentPage = 1;
    const postsPerPage = 6;
    let currentFilteredPosts = window.allProjects;
    const loadMoreContainer = document.getElementById('load-more-container');
    const loadMoreBtn = document.getElementById('load-more-btn');

    window.renderPosts = (projectsToDisplay) => {
        currentFilteredPosts = projectsToDisplay;
        const postsToRender = currentFilteredPosts.slice(0, currentPage * postsPerPage);

        if (!postsToRender || postsToRender.length === 0) {
            blogContainer.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-24 text-center">
                    <p class="text-gray-500 max-w-sm">No projects found matching your search.</p>
                </div>`;
            return;
        }

        const html = postsToRender.map((project) => {
            const tagsHtml = project.tags ? project.tags.split(',').map(tag => `<span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md">${tag.trim()}</span>`).join('') : '';
            return `
            <a href="project.html?v=v2&id=${project.id}" class="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow block">
                <div class="h-48 w-full bg-gray-100 relative overflow-hidden">
                    ${project.image ? `<img src="${project.image}" alt="${project.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">` : '<div class="w-full h-full flex items-center justify-center text-gray-400">No Image</div>'}
                </div>
                <div class="p-6">
                    <h3 class="font-display text-xl font-bold text-gray-900 mb-2">${project.title}</h3>
                    <p class="text-gray-500 text-sm mb-4 line-clamp-2">${project.description || ''}</p>
                    <div class="flex flex-wrap gap-2">
                        ${tagsHtml}
                    </div>
                </div>
            </a>`;
        }).join('');

        blogContainer.innerHTML = html;

        if (postsToRender.length < currentFilteredPosts.length) {
            loadMoreContainer.classList.remove('hidden');
        } else {
            loadMoreContainer.classList.add('hidden');
        }
    };

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentPage++;
            window.renderPosts(currentFilteredPosts);
        });
    }

    window.renderPosts(window.allProjects);

    const searchInput = document.getElementById('blog-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            currentPage = 1;
            const filtered = window.allProjects.filter(p => 
                p.title.toLowerCase().includes(query) || 
                (p.description && p.description.toLowerCase().includes(query)) ||
                (p.tags && p.tags.toLowerCase().includes(query))
            );
            window.renderPosts(filtered);
        });
    }
}

async function fetchSingleProject(id) {
    const loadingEl = document.getElementById('blog-loading');
    const blogContainer = document.getElementById('blog-container');
    const header = document.getElementById('blog-header');
    const divider = document.getElementById('blog-divider');

    const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

    if (loadingEl) loadingEl.classList.add('hidden');
    
    if (error || !project) {
        if (blogContainer) {
            blogContainer.classList.remove('hidden');
            blogContainer.innerHTML = `<div class="text-center py-20 text-red-500 font-bold">Project not found. <br><br><a href="project.html?v=v2" class="px-6 py-2 bg-google-blue text-white rounded-full">Go back</a></div>`;
        }
        return;
    }

    if (header) header.classList.add('hidden');
    if (divider) divider.classList.add('hidden');

    if (blogContainer) {
        blogContainer.classList.remove('hidden');
        blogContainer.className = 'max-w-3xl mx-auto w-full';

        const dateString = new Date(project.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const imageUrl = project.image || null;
        const tags = project.tags ? project.tags.split(',').map(t => `<span class="px-3 py-1 bg-google-green/10 text-google-green text-xs font-semibold rounded-full">${t.trim()}</span>`).join('') : '';
        const shareUrl = window.location.href;

        let formattedDesc = project.description
            .replace(/\n\n/g, '</p><p class="mb-6">')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        if (!formattedDesc.startsWith('<p>')) formattedDesc = `<p class="mb-6">${formattedDesc}</p>`;

        blogContainer.innerHTML = `
        <article class="bg-white rounded-2xl md:p-12 p-6 shadow-sm border border-gray-100 mt-8 mb-16">
            <h1 class="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">${project.title}</h1>
            
            <div class="flex flex-wrap gap-2 mb-6">${tags}</div>
            <div class="text-gray-500 text-sm mb-8">Added ${dateString}</div>

            ${imageUrl ? `<img src="${imageUrl}" alt="${project.title}" class="w-full rounded-2xl mb-12 object-cover max-h-[500px] mix-blend-multiply">` : ''}

            <div class="prose prose-lg max-w-none text-gray-800 leading-relaxed font-sans text-lg">
                ${formattedDesc}
            </div>
            
            <div class="mt-10 flex flex-wrap gap-3">
                ${project.link ? `<a href="${project.link}" target="_blank" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-google-blue text-white font-bold text-sm hover:bg-google-blue/90 transition-colors shadow-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    Live Demo
                </a>` : ''}
                ${project.github ? `<a href="${project.github}" target="_blank" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition-colors shadow-sm">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    View on GitHub
                </a>` : ''}
            </div>
            
            <div class="mt-10 pt-8 border-t border-gray-100">
                <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Share this project</p>
                <div class="flex flex-wrap gap-3">
                    <a href="https://wa.me/?text=${encodeURIComponent(project.title + ' — Check it out: ' + shareUrl)}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366] text-white font-semibold text-sm hover:opacity-90 transition-opacity">WhatsApp</a>
                    <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0A66C2] text-white font-semibold text-sm hover:opacity-90 transition-opacity">LinkedIn</a>
                    <a href="mailto:?subject=${encodeURIComponent(project.title + ' — GDSC Africa University')}&body=${encodeURIComponent('Check out this project from GDSC Africa University:\n\n' + project.title + '\n\n' + shareUrl)}" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-google-red text-white font-semibold text-sm hover:opacity-90 transition-opacity">Email</a>
                </div>
            </div>

            <div class="mt-8 pt-6 border-t border-gray-100">
                <a href="project.html?v=v2" class="inline-flex items-center gap-2 text-google-green font-semibold hover:bg-green-50 px-4 py-2 rounded-lg transition-colors">
                    ← Back to all projects
                </a>
            </div>
        </article>`;
        document.title = `${project.title} | GDSC Africa University`;
        
        const pureTextDesc = project.description.replace(/<[^>]+>/g, '').substring(0, 160) + '...';
        const metaDesc = document.getElementById('meta-description');
        const ogTitle = document.getElementById('meta-og-title');
        const ogDesc = document.getElementById('meta-og-description');
        const ogImage = document.getElementById('meta-og-image');
        const ogUrl = document.getElementById('meta-og-url');

        if(metaDesc) metaDesc.content = pureTextDesc;
        if(ogTitle) ogTitle.content = document.title;
        if(ogDesc) ogDesc.content = pureTextDesc;
        if(ogImage && imageUrl) ogImage.content = imageUrl;
        if(ogUrl) ogUrl.content = shareUrl;
    }
}

async function fetchProjectData() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    if (projectId) {
        await fetchSingleProject(projectId);
    } else {
        await fetchProjects();
    }
}

document.addEventListener('DOMContentLoaded', fetchProjectData);
