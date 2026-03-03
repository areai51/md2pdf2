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
npm install -g md2pdf2

# Or use npx
npx md2pdf2 convert input.md -o output.pdf

# Initialize a new project with sample files
md2pdf2 init

# With a custom template
md2pdf2 convert input.md --template my-template.hbs -o output.pdf

# Dev mode with live preview
md2pdf2 dev input.md
```

## Agent Skill

Install the md2pdf2 skill for Claude Code, Amp, OpenCode etc:

```bash
npx skills add areai51/md2pdf2
```

This adds the skill to your Claude Code environment, enabling intelligent PDF generation with automatic template selection and markdown formatting.

## MCP Server

Use md2pdf2 as an MCP server with AI agents:

```bash
# Using npx (no installation required)
npx md2pdf2-mcp

# Or install globally
npm install -g md2pdf2
md2pdf2-mcp
```

### Configure in Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "md2pdf2": {
      "command": "npx",
      "args": ["md2pdf2-mcp"]
    }
  }
}
```

### Available Tools

- **convert**: Convert a Markdown file to PDF
- **convertMarkdown**: Convert a Markdown string to PDF
- **listTemplates**: List available built-in templates

### Example Usage

Agents can now use the MCP tools to convert markdown:

```json
{
  "tool": "convert",
  "arguments": {
    "input": "./document.md",
    "output": "./document.pdf",
    "template": "./templates/modern.hbs",
    "format": "A4"
  }
}
```

## Dev Mode

Start a live preview server to see your markdown rendered in different templates:

```bash
md2pdf2 dev input.md --port 3456
```

Opens a browser with:
- **Left pane**: Template selector (switch between templates)
- **Right pane**: Live preview of your markdown

Changes to your `.md` file or templates auto-reload the preview.

### Built-in Templates

- `default` - Clean, professional look
- `modern` - Bold colors, Inter-style typography
- `minimal` - Simple, classic serif
- `newsletter` - Email newsletter style
- `resume` - CV/resume formatting

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
├── md2pdf2.config.js
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

`md2pdf2.config.js`:

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
