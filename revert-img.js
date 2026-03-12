const fs = require('fs');
const files = ['index.html', 'blog.html', 'admin.html'];

const replacements = [
  // Fix illustrations: replace the white card background with dark:invert
  { 
    regex: /dark:bg-gray-100 dark:rounded-3xl dark:p-4/g, 
    dest: 'dark:invert dark:opacity-90' 
  },
  // Fix gdg-logo.jpg: remove the explicit white background box
  { 
    regex: / dark:bg-white dark:rounded-md dark:p-0\.5/g, 
    dest: '' 
  }
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
