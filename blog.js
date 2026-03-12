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
            
            <div class="mt-16 pt-8 border-t border-gray-100">
                <a href="blog.html" class="inline-flex items-center gap-2 text-google-blue font-semibold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                    ← Back to all posts
                </a>
            </div>
        </article>`;
        // Update document title for SEO/UX
        document.title = `${post.title} | GDSC Africa University`;
    }
}

async function fetchBlogData() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (postId) {
        await fetchSinglePost(postId);
    } else {
        await fetchBlogPosts();
    }
}

document.addEventListener('DOMContentLoaded', fetchBlogData);
