const fs = require('fs');
const path = require('path');

const folders = ['js', 'css', 'images'];
folders.forEach(f => {
    if (!fs.existsSync(f)) fs.mkdirSync(f);
});

const fileMoves = {
    'admin.js': 'js/admin.js',
    'blog.js': 'js/blog.js',
    'project.js': 'js/project.js',
    'script.js': 'js/script.js',
    'site.js': 'js/site.js',
    'supabase-config.js': 'js/supabase-config.js',
    'styles.css': 'css/styles.css',
    'gdg-logo.jpg': 'images/gdg-logo.jpg',
    'about-illustration.png': 'images/about-illustration.png',
    'newsletter-illustration.png': 'images/newsletter-illustration.png'
};

for (const [src, dest] of Object.entries(fileMoves)) {
    if (fs.existsSync(src)) {
        fs.renameSync(src, dest);
        console.log(`Moved ${src} to ${dest}`);
    }
}

const htmlFiles = ['index.html', 'blog.html', 'project.html', 'admin.html'];
htmlFiles.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // Replace script references
        content = content.replace(/src="admin\.js"/g, 'src="js/admin.js"');
        content = content.replace(/src="blog\.js"/g, 'src="js/blog.js"');
        content = content.replace(/src="project\.js"/g, 'src="js/project.js"');
        content = content.replace(/src="script\.js"/g, 'src="js/script.js"');
        content = content.replace(/src="site\.js"/g, 'src="js/site.js"');
        content = content.replace(/src="supabase-config\.js"/g, 'src="js/supabase-config.js"');
        
        // Replace CSS
        content = content.replace(/href="styles\.css"/g, 'href="css/styles.css"');
        
        // Replace images
        content = content.replace(/src="gdg-logo\.jpg"/g, 'src="images/gdg-logo.jpg"');
        content = content.replace(/href="gdg-logo\.jpg"/g, 'href="images/gdg-logo.jpg"');
        content = content.replace(/src="about-illustration\.png"/g, 'src="images/about-illustration.png"');
        content = content.replace(/src="newsletter-illustration\.png"/g, 'src="images/newsletter-illustration.png"');
        
        // Fix illustration styling: Let mix-blend-multiply work naturally in dark mode
        content = content.replace(/dark:opacity-95 dark:rounded-3xl dark:mix-blend-normal/g, '');
        
        // Fix search bar styling so it's not a blocky grey box on a dark bg (for blog.html and project.html)
        if (file === 'blog.html' || file === 'project.html') {
            content = content.replace(
                /bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm/g,
                'bg-transparent p-0 rounded-none border-0 shadow-none'
            );
            content = content.replace(
                /bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/g,
                'bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-800'
            );
        }

        fs.writeFileSync(file, content);
        console.log(`Updated refs in ${file}`);
    }
});

// Update manifest.json
if (fs.existsSync('manifest.json')) {
    let manifest = fs.readFileSync('manifest.json', 'utf8');
    manifest = manifest.replace(/"gdg-logo\.jpg"/g, '"images/gdg-logo.jpg"');
    fs.writeFileSync('manifest.json', manifest);
    console.log('Updated manifest.json');
}

// Update sw.js
if (fs.existsSync('sw.js')) {
    let sw = fs.readFileSync('sw.js', 'utf8');
    sw = sw.replace(/'\/styles\.css'/g, "'/css/styles.css'");
    sw = sw.replace(/'\/gdg-logo\.jpg'/g, "'/images/gdg-logo.jpg'");
    sw = sw.replace(/'\/script\.js'/g, "'/js/script.js'");
    fs.writeFileSync('sw.js', sw);
    console.log('Updated sw.js');
}
