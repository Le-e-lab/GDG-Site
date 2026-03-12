const fs = require('fs');
const files = ['index.html', 'blog.html', 'admin.html'];

const replacements = [
  // Remove the invert
  { 
    regex: /dark:invert dark:opacity-90/g, 
    dest: 'dark:opacity-95 dark:rounded-3xl dark:mix-blend-normal' 
  }
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    replacements.forEach(r => {
      content = content.replace(r.regex, r.dest);
    });
    fs.writeFileSync(file, content);
  }
});
