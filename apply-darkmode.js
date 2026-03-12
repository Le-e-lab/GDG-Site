const fs = require('fs');
const files = ['index.html', 'blog.html', 'admin.html', 'site.js', 'blog.js', 'admin.js'];

const replacements = [
  { regex: /(?<!dark:)text-gray-900(?! dark:text-white)/g, dest: 'text-gray-900 dark:text-white' },
  { regex: /(?<!dark:)text-gray-800(?! dark:text-gray-100)/g, dest: 'text-gray-800 dark:text-gray-100' },
  { regex: /(?<!dark:)text-gray-600(?! dark:text-gray-300)/g, dest: 'text-gray-600 dark:text-gray-300' },
  { regex: /(?<!dark:)text-gray-500(?! dark:text-gray-400)/g, dest: 'text-gray-500 dark:text-gray-400' },
  { regex: /(?<!dark:)border-gray-200(?! dark:border-gray-800)/g, dest: 'border-gray-200 dark:border-gray-800' },
  { regex: /(?<!dark:)border-gray-100(?! dark:border-gray-800)/g, dest: 'border-gray-100 dark:border-gray-800' },
  { regex: /(?<!dark:)bg-gray-50(?! dark:bg-gray-800\/50)/g, dest: 'bg-gray-50 dark:bg-gray-800/50' }
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
