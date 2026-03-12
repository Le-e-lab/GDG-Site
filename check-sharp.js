const fs = require('fs');
const path = require('path');
const https = require('https');

// A simple script to call TinyPNG API or use sharp to compress images, but we might not have sharp.
// Let's just create a script that uses canvas to convert PNG to WebP to save space if needed.
// Actually, let's see if we can use a pure node approach or just remove high res if we don't have tools.
// Let's check if sharp is installed.
try {
  const sharp = require('sharp');
  console.log('sharp is installed');
} catch (e) {
  console.log('sharp is not installed');
}
