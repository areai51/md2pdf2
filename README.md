# MD2PDF

A CLI tool that converts Markdown to PDF using customizable templates — think Astro, but for PDFs.

## Features

- Convert Markdown to PDF with a single command
- Customizable templates with layout, styling, and components
- Supports multiple output formats (letter, a4, etc.)
- Template inheritance and partials
- Frontmatter support for metadata
- Built-in template engine (Handlebars-like syntax)
- CLI flags for quick customization
- Watch mode for development

## Quick Start

```bash
# Install globally (once published)
npm install -g md2pdf

# Or use npx
npx md2pdf convert input.md -o output.pdf

# With a custom template
md2pdf convert input.md --template my-template.hbs -o output.pdf
```

## Project Structure

```
my-doc/
├── content/
│   └── my-doc.md
├── templates/
│   ├── default.hbs
│   ├── parts/
│   │   └── header.hbs
│   └── styles.css
├── md2pdf.config.js
└── package.json
```

## Templates

Templates use handlebars-like syntax for placeholders and partials:

```handlebars
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>{{{styles}}}</style>
</head>
<body>
  {{> header}}
  <main>
    {{{content}}}
  </main>
</body>
</html>
```

## Configuration

`md2pdf.config.js`:

```js
export default {
  template: './templates/default.hbs',
  style: './templates/styles.css',
  pdfOptions: {
    format: 'A4',
    margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
  }
}
```

## Development

```bash
# Clone and setup
git clone https://github.com/areai51/md2pdf.git
cd md2pdf
npm install

# Build
npm run build

# Test
npm test

# Link for global use
npm link
```

## License

MIT
