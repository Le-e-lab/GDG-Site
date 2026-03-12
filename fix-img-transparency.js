const fs = require('fs');
const glob = require('path');

const htmlFiles = ['index.html', 'blog.html', 'project.html', 'admin.html'];

htmlFiles.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // 1. Fix illustrations
        // Currently: `mix-blend-multiply dark:mix-blend-normal`
        // We want: `mix-blend-multiply dark:mix-blend-screen dark:invert dark:hue-rotate-180`
        content = content.replace(/dark:mix-blend-normal/g, 'dark:mix-blend-screen dark:invert dark:hue-rotate-180');
        
        // 2. Fix the GDG logo if it has any dark mode bg
        // Wait, did we remove the dark:bg-white from gdg-logo?
        // Let's just make sure gdg logos also get this treatment if needed, but the original request was just illustrations with white boxes.
        // Actually, the user's first screenshot (blog page) showed the GDG logo in the top left. Does it look okay? It has a dark background and the text "GDG" is probably dark, wait, in the screenshot I can see the GDG logo has a white background on the navbar!
        // Look at the image: the navbar has a dark background, and "GDG" is a white box.
        // Oh! I see it. The `gdg-logo.jpg` is a white box.
        // Let's apply the same classes to the gdg-logo.jpg!
        // We can do this by finding `src="images/gdg-logo.jpg"` and ensuring it has these classes.
        content = content.replace(
            /(<img[^>]*src="images\/gdg-logo\.jpg"[^>]*)class="([^"]*)"/g,
            (match, p1, p2) => {
                let newClasses = p2;
                if (!newClasses.includes('mix-blend-multiply')) {
                    newClasses += ' mix-blend-multiply dark:mix-blend-screen dark:invert dark:hue-rotate-180';
                }
                return `${p1}class="${newClasses.trim()}"`;
            }
        );

        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
});
