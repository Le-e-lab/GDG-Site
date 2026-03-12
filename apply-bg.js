const fs = require('fs');
const files = ['index.html', 'blog.html', 'admin.html', 'site.js', 'blog.js', 'admin.js'];

const replacements = [
  // Cards and boxed elements
  { regex: /(?<!dark:)bg-white border(?! dark:bg-gray-800)/g, dest: 'bg-white dark:bg-gray-800 border' },
  // Section backgrounds
  { regex: /<section([^>]*)class="([^"]*)bg-white([^"]*)"/g, dest: '<section$1class="$2bg-white dark:bg-gray-900$3"' },
  { regex: /<header([^>]*)class="([^"]*)bg-white([^"]*)"/g, dest: '<header$1class="$2bg-white dark:bg-gray-900$3"' },
  { regex: /<footer([^>]*)class="([^"]*)bg-white([^"]*)"/g, dest: '<footer$1class="$2bg-white dark:bg-gray-900$3"' },
  { regex: /<main([^>]*)class="([^"]*)bg-white([^"]*)"/g, dest: '<main$1class="$2bg-white dark:bg-gray-900$3"' },
  // Gradients
  { regex: /(?<!dark:)from-white(?! dark:from-gray-900)/g, dest: 'from-white dark:from-gray-900' },
  { regex: /(?<!dark:)via-gray-50(?! dark:via-gray-800)/g, dest: 'via-gray-50 dark:via-gray-800' },
  { regex: /(?<!dark:)to-gray-100(?! dark:to-gray-900)/g, dest: 'to-gray-100 dark:to-gray-900' },
  { regex: /(?<!dark:)to-gray-50(?! dark:to-gray-800)/g, dest: 'to-gray-50 dark:to-gray-800' },
  // Misc
  { regex: /(?<!dark:)bg-white shadow(?! dark:bg-gray-800)/g, dest: 'bg-white dark:bg-gray-800 shadow' },
  { regex: /<div([^>]*)class="([^"]*)bg-white rounded-2xl p-8 max-w-sm([^"]*)"/g, dest: '<div$1class="$2bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm$3"' } // for login modals
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    replacements.forEach(r => {
      content = content.replace(r.regex, r.dest);
    });
    fs.writeFileSync(file, content);
    console.log(`Processed ${file}`);
  }
});
