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

// --- State ---
let currentTab = 'blog';
let dataList = [];
let editingId = null; // null if adding new

// --- Configuration per Tab ---
const tableConfigs = {
    blog: {
        title: 'Manage Blog',
        subtitle: 'Add or edit blog posts for the site.',
        table: 'blog',
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
        fields: [
            { name: 'title', label: 'Project Title', type: 'text', required: true },
            { name: 'description', label: 'Description', type: 'textarea', required: true },
            { name: 'tags', label: 'Tags (comma separated)', type: 'text', required: false },
            { name: 'link', label: 'Project Link', type: 'url', required: false },
            { name: 'image', label: 'Project Image', type: 'file', required: false, isImage: true }
        ],
        displayCols: ['title', 'link']
    },
    team: {
        title: 'Manage Core Team',
        subtitle: 'Update members of the core team.',
        table: 'team',
        fields: [
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'role', label: 'Role', type: 'text', required: true },
            { name: 'linkedin', label: 'LinkedIn URL', type: 'url', required: false },
            { name: 'twitter', label: 'Twitter URL', type: 'url', required: false },
            { name: 'image', label: 'Profile Picture', type: 'file', required: false, isImage: true }
        ],
        displayCols: ['name', 'role']
    },
    events: {
        title: 'Manage Events',
        subtitle: 'Update upcoming and past events.',
        table: 'events',
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
        displayCols: ['name', 'email', 'role', 'created_at']
    }
};

// --- Authentication ---
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        loginModal.classList.add('hidden');
        loadTabData(currentTab);
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
        loadTabData(currentTab);
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

    loadTabData(tabId);
}

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

mobileTabSelect.addEventListener('change', (e) => switchTab(e.target.value));

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
    if (!config.readonly) {
        thead += `<th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>`;
    }
    thead += `</tr></thead>`;

    let tbody = `<tbody class="divide-y divide-gray-200">`;
    data.forEach(item => {
        tbody += `<tr class="hover:bg-gray-50 transition-colors">`;
        config.displayCols.forEach(col => {
            let val = item[col] || '';
            if (val && typeof val === 'string' && val.length > 50) val = val.substring(0, 50) + '...';
            tbody += `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${val}</td>`;
        });
        
        if (!config.readonly) {
            tbody += `<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-indigo-600 hover:text-indigo-900 mr-3 edit-item-btn" data-id="${item.id}">Edit</button>
                <button class="text-red-600 hover:text-red-900 delete-item-btn" data-id="${item.id}">Delete</button>
            </td>`;
        }
        tbody += `</tr>`;
    });
    tbody += `</tbody>`;

    contentContainer.innerHTML = `<div class="overflow-x-auto"><table class="min-w-full divide-y divide-gray-200">${thead}${tbody}</table></div>`;

    // Attach event listeners to buttons
    if (!config.readonly) {
        document.querySelectorAll('.edit-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => openModal(e.target.dataset.id));
        });
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
    config.fields.forEach(field => {
        const val = itemData[field.name] || '';
        html += `<div class="mb-4">
            <label class="block text-sm font-semibold text-gray-700 mb-1">${field.label} ${field.required ? '<span class="text-red-500">*</span>' : ''}</label>`;
        
        if (field.type === 'textarea') {
            html += `<textarea name="${field.name}" ${field.required ? 'required' : ''} rows="4" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue outline-none transition-all">${val}</textarea>`;
        } else if (field.type === 'file') {
            html += `<input type="file" name="${field.name}" accept="image/*" class="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition-all">`;
            if (val) {
                html += `<div class="text-sm text-gray-500 mt-1">Current: <a href="${val}" target="_blank" class="text-blue-500 underline">View Image</a></div>`;
            }
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
                    alert('Error uploading image: ' + error.message);
                    saveModalBtn.textContent = "Save Changes";
                    saveModalBtn.disabled = false;
                    return;
                }
                
                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('gdg-images')
                    .getPublicUrl(filePath);
                
                saveObj.image_url = publicUrl; // Use standard column name
            }
        } else {
            saveObj[field.name] = formData.get(field.name);
        }
    }

    if (!editingId) {
        // Create
        const { error } = await supabase.from(config.table).insert([saveObj]);
        if (error) alert(error.message);
    } else {
        // Update
        const { error } = await supabase.from(config.table).update(saveObj).eq('id', editingId);
        if (error) alert(error.message);
    }

    saveModalBtn.textContent = "Save Changes";
    saveModalBtn.disabled = false;
    closeModal();
    loadTabData(currentTab);
});

async function deleteItem(id) {
    if (confirm("Are you sure you want to delete this item?")) {
        const config = tableConfigs[currentTab];
        const { error } = await supabase.from(config.table).delete().eq('id', id);
        if (error) {
            alert(error.message);
        } else {
            loadTabData(currentTab);
        }
    }
}

// --- Initialization ---
checkAuth();
switchTab('blog'); // Default tab
