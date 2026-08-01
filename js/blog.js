import { supabase } from './supabase-config.js';

async function fetchBlogPosts() {
    const loadingEl = document.getElementById('blog-loading');
    const blogContainer = document.getElementById('blog-container');

    const { data, error } = await supabase
        .from('blog')
        .select('*')
        .order('created_at', { ascending: false });

    // Store globally for search filtering
    window.allBlogPosts = data || [];

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
                <h3 class="font-display text-2xl font-bold text-brandTextPrimary mb-3">No Posts Yet</h3>
                <p class="text-brandTextSecondary max-w-sm">The first article is still being written. Check back soon for the latest tech news and club stories!</p>
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

    let currentPage = 1;
    const postsPerPage = 6;
    let currentFilteredPosts = window.allBlogPosts;
    const loadMoreContainer = document.getElementById('load-more-container');
    const loadMoreBtn = document.getElementById('load-more-btn');

    window.renderPosts = (posts, append = false) => {
        currentFilteredPosts = posts;
        const postsToRender = currentFilteredPosts.slice(0, currentPage * postsPerPage);

        if (!postsToRender || postsToRender.length === 0) {
            blogContainer.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-24 text-center">
                    <p class="text-brandTextSecondary max-w-sm">No articles found matching your search.</p>
                </div>`;
            return;
        }

        const html = postsToRender.map((post, i) => {
        const dateString = new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const imageUrl = post.image || null;
        const excerpt = post.content.replace(/\n/g, ' ').substring(0, 140) + '…';
        const initial = post.author.charAt(0).toUpperCase();
        const accent = accents[i % accents.length];
        const [gradFrom, gradTo, textClass] = gradientMap[accent].split(' ');

        return `
        <a href="blog.html?v=v2&id=${post.id}" class="bg-brandBgTertiary border border-brandBorder rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col group cursor-pointer block">
            <div class="h-52 w-full relative overflow-hidden ${!imageUrl ? `bg-gradient-to-br ${gradFrom} ${gradTo} flex items-center justify-center` : ''}">
                ${imageUrl
                    ? `<img src="${imageUrl}" alt="${post.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">`
                    : `<svg class="w-16 h-16 ${textClass} opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`
                }
                <span class="absolute top-3 left-3 bg-brandBgTertiary/90 backdrop-blur-sm text-brandTextSecondary text-xs font-semibold px-3 py-1 rounded-full shadow-sm">${dateString}</span>
            </div>

            <div class="p-6 flex-1 flex flex-col">
                <h2 class="font-display text-xl font-bold mb-3 text-brandTextPrimary leading-tight group-hover:${textClass} transition-colors">${post.title}</h2>
                <p class="text-brandTextSecondary text-sm leading-relaxed flex-1 mb-5">${excerpt}</p>

                <div class="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center font-bold text-sm">
                            ${initial}
                        </div>
                        <span class="text-sm font-semibold text-brandTextSecondary">${post.author}</span>
                    </div>
                    <span class="${textClass} text-xs font-bold uppercase tracking-wide">Read →</span>
                </div>
            </div>
        </a>`;
        }).join('');

        blogContainer.innerHTML = html;

        // Toggle Load More button visibility
        if (postsToRender.length < currentFilteredPosts.length) {
            loadMoreContainer.classList.remove('hidden');
        } else {
            loadMoreContainer.classList.add('hidden');
        }
    };

    // Handle Load More clicks
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentPage++;
            window.renderPosts(currentFilteredPosts);
        });
    }

    // Initial Render
    window.renderPosts(window.allBlogPosts);

    // Setup Search Event Listener
    const searchInput = document.getElementById('blog-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            currentPage = 1; // Reset to first page on new search
            const filtered = window.allBlogPosts.filter(p => 
                p.title.toLowerCase().includes(query) || 
                p.content.toLowerCase().includes(query) ||
                p.author.toLowerCase().includes(query)
            );
            window.renderPosts(filtered);
        });
    }
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
        blogContainer.innerHTML = `<div class="text-center py-20 text-red-500 font-bold">Post not found. <br><br><a href="blog.html?v=v2" class="px-6 py-2 bg-google-blue text-white rounded-full">Go back</a></div>`;
      }
      return;
    }

    // Hide hero and search bar for a cleaner reading experience
    if (header) header.classList.add('hidden');
    if (divider) divider.classList.add('hidden');
    const searchBar = document.getElementById('blog-search-bar');
    if (searchBar) searchBar.classList.add('hidden');
    const loadMoreEl = document.getElementById('load-more-container');
    if (loadMoreEl) loadMoreEl.classList.add('hidden');

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
        <article class="bg-brandBgTertiary rounded-2xl md:p-12 p-6 shadow-sm border border-brandBorder mt-8 mb-16">
            <h1 class="font-display text-4xl md:text-5xl font-bold text-brandTextPrimary mb-8 leading-tight">${post.title}</h1>
            
            <div class="flex items-center gap-4 mb-10 pb-10 border-b border-gray-100">
                <div class="w-14 h-14 rounded-full bg-google-blue/10 flex items-center justify-center text-google-blue font-bold text-xl">
                    ${post.author.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div class="font-bold text-brandTextPrimary text-lg">${post.author}</div>
                    <div class="text-brandTextSecondary text-sm tracking-wide uppercase">${dateString}</div>
                </div>
            </div>

            ${imageUrl ? `<img src="${imageUrl}" alt="${post.title}" class="w-full rounded-2xl mb-12 object-cover max-h-[500px] mix-blend-multiply">` : ''}

            <div class="prose prose-lg max-w-none text-brandTextPrimary leading-relaxed font-sans text-lg">
                ${formattedContent}
            </div>
            
            <!-- Social Sharing -->
            <div class="mt-12 pt-8 border-t border-gray-100">
                <p class="text-sm font-semibold text-brandTextSecondary uppercase tracking-wide mb-4">Share this post</p>
                <div class="flex flex-wrap gap-3">
                    <a href="https://wa.me/?text=${encodeURIComponent(post.title + ' — Read it here: ' + shareUrl)}" target="_blank" rel="noopener"
                       class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        WhatsApp
                    </a>
                    <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}" target="_blank" rel="noopener"
                       class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0A66C2] text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        LinkedIn
                    </a>
                    <a href="mailto:?subject=${encodeURIComponent(post.title + ' — GDG Africa University')}&body=${encodeURIComponent('Check out this post from GDG Africa University:\n\n' + post.title + '\n\n' + shareUrl)}" 
                       class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-google-red text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        Email
                    </a>
                    <button onclick="navigator.clipboard.writeText('${shareUrl}').then(()=>{this.textContent='✓ Copied!';setTimeout(()=>{this.innerHTML='<svg class=\\&quot;w-4 h-4\\&quot; fill=\\&quot;none\\&quot; stroke=\\&quot;currentColor\\&quot; viewBox=\\&quot;0 0 24 24\\&quot;><path stroke-linecap=\\&quot;round\\&quot; stroke-linejoin=\\&quot;round\\&quot; stroke-width=\\&quot;2\\&quot; d=\\&quot;M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3\\&quot;/></svg> Copy Link'},1500)})" 
                       class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-800 text-white font-semibold text-sm hover:bg-gray-700 transition-colors shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                        Copy Link
                    </button>
                </div>
            </div>

            <div class="mt-8 pt-6 border-t border-gray-100">
                <a href="blog.html?v=v2" class="inline-flex items-center gap-2 text-google-blue font-semibold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                    ← Back to all posts
                </a>
            </div>
        </article>`;
        document.title = `${post.title} | GDG Africa University`;
        
        const pureTextDesc = post.content.replace(/<[^>]+>/g, '').substring(0, 160) + '...';
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

        // Dynamic BlogPosting structured data (GEO/AEO)
        const existingLd = document.getElementById('ld-article');
        if (existingLd) existingLd.remove();
        const ld = document.createElement('script');
        ld.type = 'application/ld+json';
        ld.id = 'ld-article';
        ld.textContent = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          'headline': post.title,
          'description': pureTextDesc,
          'image': imageUrl || 'https://gdg-africa-university.netlify.app/images/gdg-logo.jpg',
          'datePublished': post.created_at || new Date().toISOString(),
          'author': { '@type': 'Person', 'name': post.author || 'GDG Africa University' },
          'publisher': {
            '@type': 'Organization',
            'name': 'GDG Africa University',
            'logo': { '@type': 'ImageObject', 'url': 'https://gdg-africa-university.netlify.app/images/gdg-logo.jpg' }
          },
          'mainEntityOfPage': shareUrl || 'https://gdg-africa-university.netlify.app/blog.html'
        });
        document.head.appendChild(ld);
        if(ogUrl) ogUrl.content = shareUrl;
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
    
    await markBlogAsSeen();
}

async function markBlogAsSeen() {
    const { count, error } = await supabase
        .from('blog')
        .select('id', { count: 'exact', head: true });
    
    if (!error && count !== null) {
        localStorage.setItem('blog_seen_count', count.toString());
    }
}

// Blog Submission Modal
function initBlogSubmission() {
    const openBtn = document.getElementById('open-blog-submit-modal');
    const closeBtn = document.getElementById('close-blog-submit-modal');
    const modal = document.getElementById('blog-submit-modal');
    const form = document.getElementById('blog-submit-form');

    if (!openBtn || !modal) return;

    openBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        });
    }

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    });

    // Form submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="inline-flex items-center gap-2"><svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Submitting...</span>';

            const payload = {
                title: formData.get('title'),
                author: formData.get('author'),
                content: formData.get('content'),
                image: formData.get('image') || null,
                status: 'pending'
            };

            const { error } = await supabase.from('blog').insert(payload);

            if (error) {
                alert('Failed to submit article. Please try again.');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            } else {
                form.reset();
                modal.classList.add('hidden');
                document.body.style.overflow = '';
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.className = 'fixed top-4 right-4 z-50 bg-google-green text-white px-6 py-3 rounded-xl shadow-lg font-semibold';
                successMsg.textContent = 'Article submitted! It will appear after admin review.';
                document.body.appendChild(successMsg);
                setTimeout(() => successMsg.remove(), 5000);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchBlogData();
    initBlogSubmission();
});
