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
        const imageUrl = post.image_url || null;
        const excerpt = post.content.replace(/\n/g, ' ').substring(0, 140) + '…';
        const initial = post.author.charAt(0).toUpperCase();
        const accent = accents[i % accents.length];
        const [gradFrom, gradTo, textClass] = gradientMap[accent].split(' ');

        return `
        <article class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col group cursor-pointer">
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
        </article>`;
    }).join('');
}

document.addEventListener('DOMContentLoaded', fetchBlogPosts);
