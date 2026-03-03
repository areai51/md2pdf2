import { writeFileAsync, fileExists } from './utils.js';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const SAMPLE_MARKDOWN = `---
title: Welcome to MD2PDF
author: Your Name
date: ${new Date().toISOString().split('T')[0]}
---

# Welcome to MD2PDF

This is your **sample document** to get started with md2pdf2.

## Quick Start

You can now run the dev server to preview your document:

\`\`\`bash
md2pdf2 dev document.md
\`\`\`

## Features

- 📄 Convert Markdown to PDF
- 🎨 Customizable templates
- 🔄 Live preview with dev server
- 📝 Frontmatter support

## Editing This Document

1. Edit \`document.md\` to change the content
2. Edit \`templates/default.hbs\` to customize the layout
3. Edit \`templates/styles.css\` to change the styling
4. The preview will auto-reload when you save

## Sample Content

### Code Example

\`\`\`javascript
import { Converter } from 'md2pdf2';

const converter = new Converter();
const { html } = converter.convert('# Hello World');
console.log(html);
\`\`\`

### Table

| Feature | Status |
|---------|--------|
| Markdown Parsing | ✅ |
| PDF Generation | ✅ |
| Templates | ✅ |
| Live Preview | ✅ |

### Blockquote

> "Simplicity is the ultimate sophistication." — Leonardo da Vinci

---

Happy documenting! 🎉
`;

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{#if frontMatter.title}}{{frontMatter.title}}{{else}}Document{{/if}}</title>
  <style>
    {{{styles}}}
  </style>
</head>
<body>
  {{> header}}

  <main>
    {{{content}}}
  </main>

  {{> footer}}
</body>
</html>
`;

const STYLES_CSS = `/* Default styles for md2pdf2 */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.7;
  font-size: 12pt;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.25;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: #111;
}

h1 { 
  font-size: 2.25rem; 
  border-bottom: 1px solid #eee; 
  padding-bottom: 0.5rem; 
}

h2 { font-size: 1.75rem; }
h3 { font-size: 1.5rem; }

p {
  margin-bottom: 1rem;
}

a {
  color: #0066cc;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

code {
  background: #f4f4f4;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 0.9em;
}

pre {
  background: #f4f4f4;
  padding: 1rem;
  border-radius: 5px;
  overflow-x: auto;
  font-size: 0.85rem;
  line-height: 1.5;
}

pre code {
  background: none;
  padding: 0;
}

blockquote {
  border-left: 4px solid #ddd;
  padding-left: 1rem;
  margin-left: 0;
  color: #555;
  font-style: italic;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
}

th, td {
  border: 1px solid #ddd;
  padding: 0.5rem;
  text-align: left;
}

th {
  background: #f9f9f9;
  font-weight: 600;
}

img {
  max-width: 100%;
  height: auto;
}

/* Print-specific adjustments */
@media print {
  body {
    font-size: 10pt;
  }
  h1 { font-size: 1.8rem; }
  h2 { font-size: 1.4rem; }
}
`;

const HEADER_PARTIAL = `<header style="border-bottom: 1px solid #ddd; padding-bottom: 1rem; margin-bottom: 2rem;">
  <h1 style="margin: 0;">{{#if frontMatter.title}}{{frontMatter.title}}{{else}}Document{{/if}}</h1>
  {{#if frontMatter.author}}
    <p style="color: #666; margin: 0.5rem 0 0 0;">By {{frontMatter.author}}</p>
  {{/if}}
  {{#if frontMatter.date}}
    <p style="color: #888; font-size: 0.9rem; margin: 0.25rem 0 0 0;">{{frontMatter.date}}</p>
  {{/if}}
</header>
`;

const FOOTER_PARTIAL = `<footer style="border-top: 1px solid #ddd; padding-top: 1rem; margin-top: 3rem; font-size: 0.85rem; color: #888;">
  <p style="margin: 0;">Generated with ❤️ md2pdf2</p>
  <p style="margin: 0.25rem 0 0 0;">Page <span class="pageNumber"></span></p>
</footer>
`;

const CONFIG_FILE = `export default {
  template: './templates/default.hbs',
  style: './templates/styles.css',
  pdfOptions: {
    format: 'A4',
    margin: {
      top: '1cm',
      right: '1cm',
      bottom: '1cm',
      left: '1cm'
    },
    printBackground: true
  }
};
`;

export async function initProject(targetDir: string = process.cwd()): Promise<void> {
  const files = [
    { path: 'document.md', content: SAMPLE_MARKDOWN },
    { path: 'templates/default.hbs', content: DEFAULT_TEMPLATE },
    { path: 'templates/styles.css', content: STYLES_CSS },
    { path: 'templates/parts/header.hbs', content: HEADER_PARTIAL },
    { path: 'templates/parts/footer.hbs', content: FOOTER_PARTIAL },
    { path: 'md2pdf2.config.js', content: CONFIG_FILE }
  ];

  console.log('Initializing md2pdf2 project...\n');

  for (const file of files) {
    const fullPath = join(targetDir, file.path);
    
    // Check if file already exists
    const exists = await fileExists(fullPath);
    if (exists) {
      console.log(`⚠️  Skipping ${file.path} (already exists)`);
      continue;
    }

    // Create directory if needed
    const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
    try {
      await mkdir(dir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }

    // Write file
    await writeFileAsync(fullPath, file.content);
    console.log(`✓ Created ${file.path}`);
  }

  console.log('\n✨ Project initialized!');
  console.log('\nNext steps:');
  console.log('  1. Edit document.md to customize your content');
  console.log('  2. Run: md2pdf2 dev document.md');
  console.log('  3. Open your browser to preview and convert to PDF\n');
}
