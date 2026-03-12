const fs = require('fs');
const files = ['index.html', 'blog.html', 'admin.html'];

const replacements = [
  // Fix mix-blend-multiply for illustrations
  { 
    regex: /class="([^"]*)mix-blend-multiply([^"]*)"/g, 
    dest: 'class="$1mix-blend-multiply dark:mix-blend-normal dark:bg-gray-100 dark:rounded-3xl dark:p-4$2"' 
  },
  // Fix gdg-logo.jpg background
  { 
    regex: /<img[^>]*src="gdg-logo\.jpg"[^>]*class="([^"]*)"/g, 
    dest: (match, p1) => {
      // Avoid double-adding
      if (p1.includes('dark:bg-white')) return match;
      return match.replace(`class="${p1}"`, `class="${p1} dark:bg-white dark:rounded-md dark:p-0.5"`);
    }
  }
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    replacements.forEach(r => {
      if (typeof r.dest === 'function') {
        content = content.replace(r.regex, r.dest);
      } else {
        content = content.replace(r.regex, r.dest);
      }
    });
    fs.writeFileSync(file, content);
    console.log(`Processed ${file}`);
  }
});
