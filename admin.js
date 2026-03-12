import { supabase } from './supabase-config.js';

// --- Global UI Elements ---
const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const tabBtns = document.querySelectorAll('.tab-btn');
const mobileTabSelect = document.getElementById('mobile-tab-select');
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');
const contentContainer = document.getElementById('content-container');
const addNewBtn = document.getElementById('addNewBtn'); // Wait, button id is add-new-btn
const addNewBtnReal = document.getElementById('add-new-btn');

const editModal = document.getElementById('edit-modal');
const editModalContent = document.getElementById('edit-modal-content');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelModalBtn = document.getElementById('cancel-modal-btn');
const editForm = document.getElementById('edit-form');
const formFields = document.getElementById('form-fields');
const modalTitle = document.getElementById('modal-title');
const saveModalBtn = document.getElementById('save-modal-btn');

// --- New Dashboard Elements ---
const tableSearch = document.getElementById('table-search');
const mobileSidebarToggle = document.getElementById('mobile-sidebar-toggle');
const sidebar = document.querySelector('aside');
const adminUserEmail = document.getElementById('admin-user-email');
const toastContainer = document.getElementById('toast-container');
const confirmModal = document.getElementById('confirm-modal');
const confirmModalContent = document.getElementById('confirm-modal-content');
const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

// --- State ---
let currentTab = 'blog';
let dataList = [];
let editingId = null; // null if adding new
let confirmResolve = null; // for custom confirm promise

// --- Configuration per Tab ---
const tableConfigs = {
    blog: {
        title: 'Manage Blog',
        subtitle: 'Add or edit blog posts for the site.',
        table: 'blog',
        hasPreview: true,
        fields: [
            { name: 'title', label: 'Title', type: 'text', required: true },
            { name: 'author', label: 'Author', type: 'text', required: true },
            { name: 'content', label: 'Content (Markdown/Text)', type: 'textarea', required: true },
            { name: 'image', label: 'Cover Image', type: 'file', required: false, isImage: true }
        ],
        displayCols: ['title', 'author', 'created_at']
    },
    projects: {
        title: 'Manage Projects',
        subtitle: 'Showcase projects built by members.',
        table: 'projects',
        hasPreview: true,
        fields: [
            { name: 'title', label: 'Project Title', type: 'text', required: true },
            { name: 'description', label: 'Description', type: 'textarea', required: true },
            { name: 'tags', label: 'Tags (comma separated)', type: 'text', required: false },
            { name: 'link', label: 'Project / Demo Link', type: 'url', required: false },
            { name: 'github', label: 'GitHub Repository', type: 'url', required: false },
            { name: 'image', label: 'Project Image', type: 'file', required: false, isImage: true }
        ],
        displayCols: ['title', 'link']
    },
    team: {
        title: 'Manage Core Team',
        subtitle: 'Update members of the core team.',
        table: 'team',
        hasPreview: true,
        fields: [
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'role', label: 'Role', type: 'select', required: true, options: [
                'Chapter Lead', 'Technical Lead', 'Design Lead', 'Community Lead', 'Events Lead', 'Content Lead', 'Member'
            ] },
            { name: 'linkedin', label: 'LinkedIn URL', type: 'url', required: false },
            { name: 'github', label: 'GitHub URL', type: 'url', required: false },
            { name: 'image', label: 'Profile Picture', type: 'file', required: false, isImage: true }
        ],
        displayCols: ['name', 'role']
    },
    events: {
        title: 'Manage Events',
        subtitle: 'Update upcoming and past events.',
        table: 'events',
        hasPreview: true,
        fields: [
            { name: 'title', label: 'Event Title', type: 'text', required: true },
            { name: 'date', label: 'Event Date (YYYY-MM-DD)', type: 'date', required: true },
            { name: 'description', label: 'Description', type: 'textarea', required: true },
            { name: 'link', label: 'Event Link (Bevy)', type: 'url', required: false },
            { name: 'image', label: 'Event Banner', type: 'file', required: false, isImage: true }
        ],
        displayCols: ['title', 'date']
    },
    testimonials: {
        title: 'Manage Testimonials',
        subtitle: 'Add quotes from members and partners.',
        table: 'testimonials',
        hasPreview: true,
        fields: [
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'role', label: 'Role/Company', type: 'text', required: true },
            { name: 'content', label: 'Testimonial', type: 'textarea', required: true },
            { name: 'image', label: 'Profile Picture', type: 'file', required: false, isImage: true }
        ],
        displayCols: ['name', 'role']
    },
    applications: {
        title: 'Lead Role Applications',
        subtitle: 'View submissions from the application form.',
        table: 'applications',
        readonly: true,
        allowDelete: true,
        hasDetails: true,
        fields: [
            { name: 'name', label: 'Applicant Name', type: 'text' },
            { name: 'email', label: 'Email Address', type: 'text' },
            { name: 'role', label: 'Applied Role', type: 'text' },
            { name: 'skills', label: 'Level and Skills', type: 'textarea' },
            { name: 'created_at', label: 'Applied On', type: 'text' }
        ],
        displayCols: ['name', 'email', 'role', 'created_at']
    },
    newsletter: {
        title: 'Newsletter Subscribers',
        subtitle: 'View and manage emails subscribed to the newsletter.',
        table: 'newsletter_subscribers',
        readonly: true,
        allowDelete: true,
        hasCompose: true,
        fields: [],
        displayCols: ['email', 'created_at']
    }
};

// --- Authentication ---
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        loginModal.classList.add('hidden');
        if (adminUserEmail) adminUserEmail.textContent = session.user.email;
        loadTabData(currentTab);
        loadDashboardStats();
    } else {
        loginModal.classList.remove('hidden');
    }
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    loginError.classList.add('hidden');
    const btn = loginForm.querySelector('button');
    btn.textContent = "Signing in...";
    btn.disabled = true;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    btn.textContent = "Sign In";
    btn.disabled = false;

    if (error) {
        loginError.textContent = error.message;
        loginError.classList.remove('hidden');
    } else {
        loginModal.classList.add('hidden');
        checkAuth(); // refresh user email and stats
    }
});

logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    loginModal.classList.remove('hidden');
});

// --- Tab Navigation ---
function switchTab(tabId) {
    currentTab = tabId;
    
    // Update Desktop Sidebar UI
    tabBtns.forEach(btn => {
        if (btn.dataset.tab === tabId) {
            btn.classList.add('text-google-blue', 'bg-blue-50');
            btn.classList.remove('text-gray-600', 'hover:bg-gray-50');
        } else {
            btn.classList.remove('text-google-blue', 'bg-blue-50');
            btn.classList.add('text-gray-600', 'hover:bg-gray-50');
        }
    });
    
    // Update Mobile Select UI
    mobileTabSelect.value = tabId;

    // Update Header Content
    const config = tableConfigs[tabId];
    pageTitle.textContent = config.title;
    pageSubtitle.textContent = config.subtitle;
    
    if (config.readonly) {
        addNewBtnReal.classList.add('hidden');
    } else {
        addNewBtnReal.classList.remove('hidden');
    }

    // Show compose button for newsletter
    let composeBtn = document.getElementById('compose-newsletter-btn');
    if (config.hasCompose) {
        if (!composeBtn) {
            composeBtn = document.createElement('button');
            composeBtn.id = 'compose-newsletter-btn';
            composeBtn.className = 'bg-google-green text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-green-600 transition-colors shadow-sm flex items-center gap-2';
            composeBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> Compose Newsletter`;
            composeBtn.addEventListener('click', composeNewsletter);
            addNewBtnReal.parentElement.appendChild(composeBtn);
        }
        composeBtn.classList.remove('hidden');
    } else if (composeBtn) {
        composeBtn.classList.add('hidden');
    }

    loadTabData(tabId);
}

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        switchTab(btn.dataset.tab);
        // Close sidebar on mobile after clicking tab
        sidebar.classList.add('hidden');
    });
});

mobileTabSelect.addEventListener('change', (e) => switchTab(e.target.value));

    if (mobileSidebarToggle) {
        mobileSidebarToggle.classList.add('hidden');
    }

// --- Dashboard Stats ---
async function loadDashboardStats() {
    const getCount = async (table) => {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        return error ? 0 : count;
    };
    
    document.getElementById('stat-blog').textContent = await getCount('blog');
    document.getElementById('stat-projects').textContent = await getCount('projects');
    document.getElementById('stat-team').textContent = await getCount('team');
    document.getElementById('stat-events').textContent = await getCount('events');
}

// --- Dynamic Toasts and Modals ---
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const isError = type === 'error';
    toast.className = `flexitems-center p-4 rounded-lg shadow-lg border-l-4 transform transition-all translate-y-full opacity-0 duration-300 ${isError ? 'bg-white border-red-500 text-red-700' : 'bg-white border-google-green text-gray-800'}`;
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            ${isError ? 
              `<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` : 
              `<svg class="w-5 h-5 text-google-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`
            }
            <p class="font-semibold text-sm">${message}</p>
        </div>
    `;
    toastContainer.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-y-full', 'opacity-0');
    }, 10);

    // Remove after 3s
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-full');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function customConfirm() {
    return new Promise((resolve) => {
        confirmModal.classList.remove('hidden');
        setTimeout(() => {
            confirmModal.classList.remove('opacity-0');
            confirmModalContent.classList.remove('scale-95');
        }, 10);

        confirmResolve = resolve;
    });
}

function closeConfirmModal(result) {
    confirmModal.classList.add('opacity-0');
    confirmModalContent.classList.add('scale-95');
    setTimeout(() => {
        confirmModal.classList.add('hidden');
        if (confirmResolve) confirmResolve(result);
    }, 200);
}

if(confirmCancelBtn) confirmCancelBtn.addEventListener('click', () => closeConfirmModal(false));
if(confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', () => closeConfirmModal(true));

// --- Search Filtering ---
if (tableSearch) {
    tableSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (!query) {
            renderTable(dataList, tableConfigs[currentTab]);
            return;
        }
        
        const config = tableConfigs[currentTab];
        const filtered = dataList.filter(item => {
            return config.displayCols.some(col => {
                const val = item[col];
                return val && String(val).toLowerCase().includes(query);
            });
        });
        renderTable(filtered, config);
    });
}

// --- Data Loading & Rendering ---
async function loadTabData(tabId) {
    contentContainer.innerHTML = `<div class="p-8 text-center text-gray-500">Loading...</div>`;
    
    const config = tableConfigs[tabId];
    const { data, error } = await supabase
        .from(config.table)
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        contentContainer.innerHTML = `<div class="p-8 text-center text-red-500">Error loading data: ${error.message}. <br>Make sure the table '${config.table}' exists in Supabase.</div>`;
        return;
    }

    dataList = data;
    if(tableSearch) tableSearch.value = ""; // clear search on load
    renderTable(data, config);
}

function renderTable(data, config) {
    if (data.length === 0) {
        contentContainer.innerHTML = `<div class="p-8 text-center text-gray-500">No records found.</div>`;
        return;
    }

    let thead = `<thead class="bg-gray-50 border-b border-gray-200"><tr>`;
    config.displayCols.forEach(col => {
        thead += `<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">${col.replace('_', ' ')}</th>`;
    });
    if (!config.readonly || config.allowDelete || config.hasPreview || config.hasDetails) {
        thead += `<th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>`;
    }
    thead += `</tr></thead>`;

    let tbody = `<tbody class="divide-y divide-gray-200">`;
    data.forEach(item => {
        tbody += `<tr class="hover:bg-gray-50 transition-colors">`;
        config.displayCols.forEach(col => {
            let val = item[col] || '';
            let content = '';

            // Handle images nicely, or author avatars
            if (col === 'author' && currentTab === 'blog') {
               content = `
                  <div class="flex items-center">
                    <div class="w-8 h-8 rounded-full bg-google-blue/10 flex items-center justify-center text-google-blue font-bold mr-3">
                      ${val.charAt(0).toUpperCase()}
                    </div>
                    <span>${val}</span>
                  </div>`;
            } else if (col === 'role') {
               content = `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">${val}</span>`;
            } else if (col === 'created_at') {
                content = new Date(val).toLocaleDateString();
            } else {
               if (val && typeof val === 'string' && val.length > 50) val = val.substring(0, 50) + '...';
               content = val;
            }

            tbody += `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${content}</td>`;
        });
        
        if (!config.readonly || config.allowDelete || config.hasPreview || config.hasDetails) {
            tbody += `<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">`;
            
            if (config.hasPreview) {
               let previewHref = 'index.html';
               if(currentTab === 'blog') previewHref = `blog.html?id=${item.id}`;
               else if(currentTab === 'projects') previewHref = `blog.html?project=${item.id}`;
               else previewHref = `index.html#${currentTab}`;
               
               tbody += `<a href="${previewHref}" target="_blank" class="text-green-600 hover:text-green-900 mr-3 transition-colors hover:bg-green-50 px-2 py-1 rounded inline-block">Preview</a>`;
            }
            if (config.hasDetails) {
                 tbody += `<button class="text-indigo-600 hover:text-indigo-900 mr-3 edit-item-btn transition-colors hover:bg-indigo-50 px-2 py-1 rounded" data-id="${item.id}">Details</button>`;
            } else if (!config.readonly) {
                 tbody += `<button class="text-indigo-600 hover:text-indigo-900 mr-3 edit-item-btn transition-colors hover:bg-indigo-50 px-2 py-1 rounded" data-id="${item.id}">Edit</button>`;
            }
            if (!config.readonly || config.allowDelete) {
                 tbody += `<button class="text-red-600 hover:text-red-900 delete-item-btn transition-colors hover:bg-red-50 px-2 py-1 rounded" data-id="${item.id}">Delete</button>`;
            }
            tbody += `</td>`;
        }
        tbody += `</tr>`;
    });
    tbody += `</tbody>`;

    contentContainer.innerHTML = `<div class="overflow-x-auto"><table class="min-w-full divide-y divide-gray-200">${thead}${tbody}</table></div>`;

    // Attach event listeners to buttons
    if (!config.readonly || config.hasDetails) {
        document.querySelectorAll('.edit-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => openModal(e.target.dataset.id));
        });
    }
    if (!config.readonly || config.allowDelete) {
        document.querySelectorAll('.delete-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => deleteItem(e.target.dataset.id));
        });
    }
}

// --- CRUD Operations ---
function openModal(id = null) {
    editingId = id;
    const config = tableConfigs[currentTab];
    modalTitle.textContent = id ? `Edit Item` : `Add New Item`;
    
    let itemData = {};
    if (id) {
        itemData = dataList.find(d => d.id == id) || {};
    }

    // Build form
    let html = '';
    
    if (config.readonly) {
        saveModalBtn.classList.add('hidden');
    } else {
        saveModalBtn.classList.remove('hidden');
    }

    config.fields.forEach(field => {
        let val = itemData[field.name] || '';
        if (field.name === 'created_at' && val) val = new Date(val).toLocaleString();
        
        html += `<div class="mb-4">
            <label class="block text-sm font-semibold text-gray-700 mb-1">${field.label} ${field.required && !config.readonly ? '<span class="text-red-500">*</span>' : ''}</label>`;
        
        if (config.readonly) {
            html += `<div class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 whitespace-pre-wrap">${val}</div>`;
        } else if (field.type === 'textarea') {
            html += `<textarea name="${field.name}" ${field.required ? 'required' : ''} rows="4" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue outline-none transition-all">${val}</textarea>`;
        } else if (field.type === 'file') {
            html += `<input type="file" name="${field.name}" accept="image/*" class="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition-all">`;
            if (val) {
                html += `<div class="text-sm text-gray-500 mt-1">Current: <a href="${val}" target="_blank" class="text-blue-500 underline">View Image</a></div>`;
            }
        } else if (field.type === 'select' && field.options) {
            html += `<select name="${field.name}" ${field.required ? 'required' : ''} class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue outline-none transition-all bg-white">`;
            html += `<option value="" disabled ${!val ? 'selected' : ''}>Select ${field.label}...</option>`;
            field.options.forEach(opt => {
                html += `<option value="${opt}" ${val === opt ? 'selected' : ''}>${opt}</option>`;
            });
            html += `</select>`;
        } else {
            html += `<input type="${field.type}" name="${field.name}" value="${val}" ${field.required ? 'required' : ''} class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue outline-none transition-all">`;
        }
        html += `</div>`;
    });

    formFields.innerHTML = html;
    
    // Show modal
    editModal.classList.remove('hidden');
    // slight delay for animation
    setTimeout(() => {
        editModal.classList.remove('opacity-0');
        editModalContent.classList.remove('scale-95');
    }, 10);
}

function closeModal() {
    editModal.classList.add('opacity-0');
    editModalContent.classList.add('scale-95');
    setTimeout(() => {
        editModal.classList.add('hidden');
        editForm.reset();
    }, 200);
}

closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);
addNewBtnReal.addEventListener('click', () => openModal(null));

// Generate a random id for new entries (or rely on Supabase UUID, but we use string/int depending on schema)
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const config = tableConfigs[currentTab];
    const formData = new FormData(editForm);
    const saveObj = {};

    saveModalBtn.textContent = "Saving...";
    saveModalBtn.disabled = true;

    // Process fields
    for (const field of config.fields) {
        if (field.type === 'file') {
            const file = formData.get(field.name);
            if (file && file.size > 0) {
                // Upload to Supabase Storage
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${currentTab}/${fileName}`;
                
                const { data, error } = await supabase.storage
                    .from('gdg-images') // User must create this bucket!
                    .upload(filePath, file);

                if (error) {
                    showToast('Error uploading image: ' + error.message, 'error');
                    saveModalBtn.textContent = "Save Changes";
                    saveModalBtn.disabled = false;
                    return;
                }
                
                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('gdg-images')
                    .getPublicUrl(filePath);
                
                saveObj.image = publicUrl;
            }
        } else {
            saveObj[field.name] = formData.get(field.name);
        }
    }

    if (!editingId) {
        // Create
        const { error } = await supabase.from(config.table).insert([saveObj]);
        if (error) { showToast(error.message, 'error'); } else { showToast('Item created successfully'); }
    } else {
        // Update
        const { error } = await supabase.from(config.table).update(saveObj).eq('id', editingId);
        if (error) { showToast(error.message, 'error'); } else { showToast('Item updated successfully'); }
    }

    saveModalBtn.textContent = "Save Changes";
    saveModalBtn.disabled = false;
    closeModal();
    loadTabData(currentTab);
    loadDashboardStats();
});

async function deleteItem(id) {
    const isConfirmed = await customConfirm();
    if (isConfirmed) {
        const config = tableConfigs[currentTab];
        const { error } = await supabase.from(config.table).delete().eq('id', id);
        if (error) {
            showToast(error.message, 'error');
        } else {
            showToast('Item deleted successfully');
            loadTabData(currentTab);
            loadDashboardStats(); // update stats
        }
    }
}

// --- Newsletter Compose ---
async function composeNewsletter() {
    // Fetch all subscribers
    const { data: subscribers, error } = await supabase
        .from('newsletter_subscribers')
        .select('email');
    
    if (error || !subscribers || subscribers.length === 0) {
        showToast('No subscribers found or error fetching emails.', 'error');
        return;
    }

    const emails = subscribers.map(s => s.email);
    
    // Show compose modal
    modalTitle.textContent = 'Compose Newsletter';
    saveModalBtn.classList.remove('hidden');
    saveModalBtn.textContent = 'Open in Email Client';
    editingId = '__newsletter__';

    formFields.innerHTML = `
        <div class="mb-2 text-sm text-gray-500">Sending to <strong class="text-google-blue">${emails.length}</strong> subscriber(s)</div>
        <div class="mb-4">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Subject <span class="text-red-500">*</span></label>
            <input type="text" name="newsletter-subject" required placeholder="e.g. GDG Monthly Update — March 2026" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue outline-none transition-all">
        </div>
        <div class="mb-4">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Message Body <span class="text-red-500">*</span></label>
            <textarea name="newsletter-body" required rows="8" placeholder="Write your newsletter content here..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue outline-none transition-all"></textarea>
        </div>
        <input type="hidden" name="newsletter-emails" value="${emails.join(',')}">
    `;

    editModal.classList.remove('hidden');
    setTimeout(() => {
        editModal.classList.remove('opacity-0');
        editModalContent.classList.remove('scale-95');
    }, 10);
}

// Override form submit for newsletter compose
const originalFormSubmit = editForm.onsubmit;
editForm.addEventListener('submit', async (e) => {
    if (editingId === '__newsletter__') {
        e.preventDefault();
        e.stopImmediatePropagation();
        const formData = new FormData(editForm);
        const subject = formData.get('newsletter-subject');
        const body = formData.get('newsletter-body');
        const emailsStr = formData.get('newsletter-emails');
        
        if (!subject || !body) {
            showToast('Please fill in subject and body.', 'error');
            return;
        }

        const mailtoLink = `mailto:?bcc=${encodeURIComponent(emailsStr)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink, '_blank');
        showToast(`Email client opened with ${emailsStr.split(',').length} recipient(s) in BCC.`);
        closeModal();
        editingId = null;
        saveModalBtn.textContent = 'Save Changes';
    }
}, true); // Use capture to run before the other submit handler

// --- Initialization ---
checkAuth();
switchTab('blog'); // Default tab
