import { supabase } from './supabase-config.js';

async function fetchBlogPosts() {
    const loadingEl = document.getElementById('blog-loading');
    const blogContainer = document.getElementById('blog-container');

    const { data, error } = await supabase
        .from('blog')
        .select('*')
        .order('created_at', { ascending: false });

    // Hide loading skeleton in all cases
    if (loadingEl) loadingEl.classList.add('hidden');
    if (blogContainer) {
        blogContainer.classList.remove('hidden');
        // fix: add back grid class since classList.remove('hidden') removes it from multi-class
        blogContainer.className = 'grid md:grid-cols-2 lg:grid-cols-3 gap-8';
    }

    // Empty state (no posts yet OR table not set up)
    if (error || !data || data.length === 0) {
        if (blogContainer) blogContainer.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-24 text-center">
                <div class="w-24 h-24 rounded-3xl bg-google-blue/10 flex items-center justify-center mb-6">
                    <svg class="w-12 h-12 text-google-blue/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                    </svg>
                </div>
                <h3 class="font-display text-2xl font-bold text-gray-900 mb-3">No Posts Yet</h3>
                <p class="text-gray-500 max-w-sm">The first article is still being written. Check back soon for the latest tech news and club stories!</p>
            </div>`;
        return;
    }

    const accents = ['google-blue', 'google-red', 'google-green', 'google-yellow'];
    const gradientMap = {
        'google-blue': 'from-blue-50 to-blue-100 text-google-blue',
        'google-red': 'from-red-50 to-orange-100 text-google-red',
        'google-green': 'from-green-50 to-emerald-100 text-google-green',
        'google-yellow': 'from-yellow-50 to-amber-100 text-google-yellow',
    };

    blogContainer.innerHTML = data.map((post, i) => {
        const dateString = new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const imageUrl = post.image || null;
        const excerpt = post.content.replace(/\n/g, ' ').substring(0, 140) + '…';
        const initial = post.author.charAt(0).toUpperCase();
        const accent = accents[i % accents.length];
        const [gradFrom, gradTo, textClass] = gradientMap[accent].split(' ');

        return `
        <a href="blog.html?id=${post.id}" class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col group cursor-pointer block">
            <div class="h-52 w-full relative overflow-hidden ${!imageUrl ? `bg-gradient-to-br ${gradFrom} ${gradTo} flex items-center justify-center` : ''}">
                ${imageUrl
                    ? `<img src="${imageUrl}" alt="${post.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">`
                    : `<svg class="w-16 h-16 ${textClass} opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`
                }
                <span class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-600 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">${dateString}</span>
            </div>

            <div class="p-6 flex-1 flex flex-col">
                <h2 class="font-display text-xl font-bold mb-3 text-gray-900 leading-tight group-hover:${textClass} transition-colors">${post.title}</h2>
                <p class="text-gray-500 text-sm leading-relaxed flex-1 mb-5">${excerpt}</p>

                <div class="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center font-bold text-sm">
                            ${initial}
                        </div>
                        <span class="text-sm font-semibold text-gray-700">${post.author}</span>
                    </div>
                    <span class="${textClass} text-xs font-bold uppercase tracking-wide">Read →</span>
                </div>
            </div>
        </a>`;
    }).join('');
}

async function fetchSinglePost(id) {
    const loadingEl = document.getElementById('blog-loading');
    const blogContainer = document.getElementById('blog-container');
    const header = document.getElementById('blog-header');
    const divider = document.getElementById('blog-divider');

    const { data: post, error } = await supabase
        .from('blog')
        .select('*')
        .eq('id', id)
        .single();

    if (loadingEl) loadingEl.classList.add('hidden');
    
    if (error || !post) {
      if (blogContainer) {
        blogContainer.classList.remove('hidden');
        blogContainer.innerHTML = `<div class="text-center py-20 text-red-500 font-bold">Post not found. <br><br><a href="blog.html" class="px-6 py-2 bg-google-blue text-white rounded-full">Go back</a></div>`;
      }
      return;
    }

    // Hide hero for a cleaner reading experience
    if (header) header.classList.add('hidden');
    if (divider) divider.classList.add('hidden');

    if (blogContainer) {
        blogContainer.classList.remove('hidden');
        blogContainer.className = 'max-w-3xl mx-auto w-full';

        const dateString = new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const imageUrl = post.image || null;
        const shareUrl = window.location.href;
        
        // Simple markdown parsing for paragraphs and bold text
        let formattedContent = post.content
          .replace(/\n\n/g, '</p><p class="mb-6">')
          .replace(/\n/g, '<br>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          
        if (!formattedContent.startsWith('<p>')) formattedContent = `<p class="mb-6">${formattedContent}</p>`;

        blogContainer.innerHTML = `
        <article class="bg-white rounded-2xl md:p-12 p-6 shadow-sm border border-gray-100 mt-8 mb-16">
            <h1 class="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">${post.title}</h1>
            
            <div class="flex items-center gap-4 mb-10 pb-10 border-b border-gray-100">
                <div class="w-14 h-14 rounded-full bg-google-blue/10 flex items-center justify-center text-google-blue font-bold text-xl">
                    ${post.author.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div class="font-bold text-gray-900 text-lg">${post.author}</div>
                    <div class="text-gray-500 text-sm tracking-wide uppercase">${dateString}</div>
                </div>
            </div>

            ${imageUrl ? `<img src="${imageUrl}" alt="${post.title}" class="w-full rounded-2xl mb-12 object-cover max-h-[500px]">` : ''}

            <div class="prose prose-lg max-w-none text-gray-800 leading-relaxed font-sans text-lg">
                ${formattedContent}
            </div>
            
            <!-- Social Sharing -->
            <div class="mt-12 pt-8 border-t border-gray-100">
                <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Share this post</p>
                <div class="flex flex-wrap gap-3">
                    <a href="https://wa.me/?text=${encodeURIComponent(post.title + ' — Read it here: ' + shareUrl)}" target="_blank" rel="noopener"
                       class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        WhatsApp
                    </a>
                    <a href="https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}" target="_blank" rel="noopener"
                       class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0A66C2] text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        LinkedIn
                    </a>
                    <button onclick="navigator.clipboard.writeText('${shareUrl}').then(()=>{this.textContent='✓ Copied!';setTimeout(()=>{this.innerHTML='<svg class=\\&quot;w-4 h-4\\&quot; fill=\\&quot;none\\&quot; stroke=\\&quot;currentColor\\&quot; viewBox=\\&quot;0 0 24 24\\&quot;><path stroke-linecap=\\&quot;round\\&quot; stroke-linejoin=\\&quot;round\\&quot; stroke-width=\\&quot;2\\&quot; d=\\&quot;M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3\\&quot;/></svg> Copy Link'},1500)})" 
                       class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-800 text-white font-semibold text-sm hover:bg-gray-700 transition-colors shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                        Copy Link
                    </button>
                </div>
            </div>

            <div class="mt-8 pt-6 border-t border-gray-100">
                <a href="blog.html" class="inline-flex items-center gap-2 text-google-blue font-semibold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                    ← Back to all posts
                </a>
            </div>
        </article>`;
        document.title = `${post.title} | GDSC Africa University`;
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
            blogContainer.innerHTML = `<div class="text-center py-20 text-red-500 font-bold">Project not found. <br><br><a href="blog.html" class="px-6 py-2 bg-google-blue text-white rounded-full">Go back</a></div>`;
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
        const tags = project.tags ? project.tags.split(',').map(t => `<span class="px-3 py-1 bg-google-blue/10 text-google-blue text-xs font-semibold rounded-full">${t.trim()}</span>`).join('') : '';
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

            ${imageUrl ? `<img src="${imageUrl}" alt="${project.title}" class="w-full rounded-2xl mb-12 object-cover max-h-[500px]">` : ''}

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

            <!-- Share -->
            <div class="mt-10 pt-8 border-t border-gray-100">
                <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Share this project</p>
                <div class="flex flex-wrap gap-3">
                    <a href="https://wa.me/?text=${encodeURIComponent(project.title + ' — Check it out: ' + shareUrl)}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366] text-white font-semibold text-sm hover:opacity-90 transition-opacity">WhatsApp</a>
                    <a href="https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(project.title)}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0A66C2] text-white font-semibold text-sm hover:opacity-90 transition-opacity">LinkedIn</a>
                </div>
            </div>

            <div class="mt-8 pt-6 border-t border-gray-100">
                <a href="index.html#projects" class="inline-flex items-center gap-2 text-google-blue font-semibold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                    ← Back to projects
                </a>
            </div>
        </article>`;
        document.title = `${project.title} | GDSC Africa University`;
    }
}

async function fetchBlogData() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    const projectId = urlParams.get('project');

    if (postId) {
        await fetchSinglePost(postId);
    } else if (projectId) {
        await fetchSingleProject(projectId);
    } else {
        await fetchBlogPosts();
    }
}

document.addEventListener('DOMContentLoaded', fetchBlogData);
