import { supabase } from './supabase-config.js';

async function fetchBlogPosts() {
    const blogContainer = document.getElementById('blog-container');

    const { data, error } = await supabase
        .from('blog')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching blog posts:', error);
        blogContainer.innerHTML = `<div class="col-span-full text-center text-red-500 py-10">Failed to load blog posts. Please check your database.</div>`;
        return;
    }

    if (data.length === 0) {
        blogContainer.innerHTML = `<div class="col-span-full text-center text-gray-500 py-20 text-lg font-medium">No blog posts have been published yet.</div>`;
        return;
    }

    let html = '';
    data.forEach(post => {
        // Simple markdown parsing to convert lines to paragraphs, although basic text works too
        const parsedContent = post.content.split('\n').map(line => `<p class="mb-2">${line}</p>`).join('');
        const dateString = new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        
        // Use a placeholder if no image exists
        const imageUrl = post.image || 'https://via.placeholder.com/800x400?text=GDSC+Blog';

        html += `
        <article class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div class="h-48 w-full bg-gray-100 relative">
                <img src="${imageUrl}" alt="${post.title}" class="w-full h-full object-cover">
            </div>
            <div class="p-6 flex-1 flex flex-col">
                <div class="flex items-center justify-between text-sm text-gray-500 mb-3 font-medium">
                    <span>${dateString}</span>
                    <span class="bg-blue-50 text-google-blue px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide">Tech / News</span>
                </div>
                <h2 class="font-display text-2xl font-bold mb-3 text-gray-900 leading-snug">${post.title}</h2>
                <div class="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                    ${parsedContent}
                </div>
                <div class="mt-auto pt-4 border-t border-gray-100 text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-google-blue text-white flex items-center justify-center font-bold text-xs uppercase">
                        ${post.author.charAt(0)}
                    </div>
                    By ${post.author}
                </div>
            </div>
        </article>
        `;
    });

    blogContainer.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', fetchBlogPosts);
