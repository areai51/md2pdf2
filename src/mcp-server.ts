#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { readFileAsync, writeFileAsync, fileExists, resolvePath } from './utils.js';
import { Converter } from './converter.js';
import { TemplateEngine } from './template-engine.js';
import { PDFGenerator } from './pdf-generator.js';
import { MD2PDFConfig, DEFAULT_CONFIG } from './types.js';

// Define tools
const TOOLS: Tool[] = [
  {
    name: 'convert',
    description: 'Convert a Markdown file to PDF',
    inputSchema: {
      type: 'object',
      properties: {
        input: {
          type: 'string',
          description: 'Path to the input Markdown file'
        },
        output: {
          type: 'string',
          description: 'Output PDF file path (default: same as input with .pdf extension)'
        },
        template: {
          type: 'string',
          description: 'Custom template file path (Handlebars)'
        },
        style: {
          type: 'string',
          description: 'Custom CSS file path'
        },
        config: {
          type: 'string',
          description: 'Configuration file path (md2pdf2.config.js)'
        },
        format: {
          type: 'string',
          description: 'PDF format (e.g., A4, letter)'
        },
        title: {
          type: 'string',
          description: 'Document title (overrides frontmatter)'
        }
      },
      required: ['input']
    }
  },
  {
    name: 'convertMarkdown',
    description: 'Convert a Markdown string to PDF',
    inputSchema: {
      type: 'object',
      properties: {
        markdown: {
          type: 'string',
          description: 'Markdown content to convert'
        },
        output: {
          type: 'string',
          description: 'Output PDF file path'
        },
        template: {
          type: 'string',
          description: 'Custom template file path (Handlebars)'
        },
        style: {
          type: 'string',
          description: 'Custom CSS file path'
        },
        config: {
          type: 'string',
          description: 'Configuration file path (md2pdf2.config.js)'
        },
        format: {
          type: 'string',
          description: 'PDF format (e.g., A4, letter)'
        },
        title: {
          type: 'string',
          description: 'Document title'
        }
      },
      required: ['markdown', 'output']
    }
  },
  {
    name: 'listTemplates',
    description: 'List available built-in templates',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

// Create MCP server
const server = new Server(
  {
    name: 'md2pdf2',
    version: '0.2.3'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Handle list tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'convert') {
      return await handleConvert(args as any);
    } else if (name === 'convertMarkdown') {
      return await handleConvertMarkdown(args as any);
    } else if (name === 'listTemplates') {
      return await handleListTemplates();
    } else {
      return {
        content: [{ type: 'text', text: `Unknown tool: ${name}` }],
        isError: true
      };
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true
    };
  }
});

async function handleConvert(params: any) {
  // Validate input file
  if (!(await fileExists(params.input))) {
    return {
      content: [{ type: 'text', text: `Error: Input file not found: ${params.input}` }],
      isError: true
    };
  }

  // Load configuration
  const config = await loadMcpConfig(params);

  // Read input markdown
  const markdown = await readFileAsync(params.input);

  // Convert to HTML
  const converter = new Converter();
  const { html, frontMatter } = converter.convert(markdown);

  // Override title if provided
  if (params.title) {
    frontMatter.title = params.title;
  }

  // Load styles
  let styles = '';
  if (config.style && await fileExists(config.style)) {
    styles = await readFileAsync(config.style);
  }

  // Load and render template
  const engine = new TemplateEngine(config);
  if (config.template && await fileExists(config.template)) {
    await engine.loadTemplate(config.template);
  } else {
    engine.loadDefaultTemplate();
  }

  const renderedHtml = engine.render(html, frontMatter, styles);

  // Determine output path
  const outputPath = params.output || params.input.replace(/\.md$/, '.pdf');
  const htmlPath = outputPath.replace(/\.pdf$/, '.html');

  // Save HTML for debugging
  await writeFileAsync(htmlPath, renderedHtml);

  // Generate PDF
  const generator = new PDFGenerator();
  await generator.generate(renderedHtml, outputPath, config.pdfOptions);

  return {
    content: [
      { type: 'text', text: `✓ PDF generated successfully: ${outputPath}` },
      { type: 'text', text: `✓ HTML generated: ${htmlPath}` }
    ],
    isError: false
  };
}

async function handleConvertMarkdown(params: any) {
  // Load configuration
  const config = await loadMcpConfig(params);

  // Convert to HTML
  const converter = new Converter();
  const { html, frontMatter } = converter.convert(params.markdown);

  // Override title if provided
  if (params.title) {
    frontMatter.title = params.title;
  }

  // Load styles
  let styles = '';
  if (config.style && await fileExists(config.style)) {
    styles = await readFileAsync(config.style);
  }

  // Load and render template
  const engine = new TemplateEngine(config);
  if (config.template && await fileExists(config.template)) {
    await engine.loadTemplate(config.template);
  } else {
    engine.loadDefaultTemplate();
  }

  const renderedHtml = engine.render(html, frontMatter, styles);

  // Generate PDF
  const generator = new PDFGenerator();
  await generator.generate(renderedHtml, params.output, config.pdfOptions);

  return {
    content: [{ type: 'text', text: `✓ PDF generated successfully: ${params.output}` }],
    isError: false
  };
}

async function handleListTemplates() {
  const templates = [
    { name: 'default', description: 'Clean, professional look' },
    { name: 'modern', description: 'Bold colors, Inter-style typography' },
    { name: 'minimal', description: 'Simple, classic serif' },
    { name: 'newsletter', description: 'Email newsletter style' },
    { name: 'resume', description: 'CV/resume formatting' }
  ];

  return {
    content: [
      { type: 'text', text: `Available templates:\n\n${templates.map(t => `- ${t.name}: ${t.description}`).join('\n')}` }
    ],
    isError: false
  };
}

async function loadMcpConfig(params: any): Promise<MD2PDFConfig> {
  const config: MD2PDFConfig = { ...DEFAULT_CONFIG };

  if (params.config && await fileExists(params.config)) {
    const configModule = await import(resolvePath(process.cwd(), params.config));
    const userConfig = configModule.default || configModule;
    Object.assign(config, userConfig);
  }

  // Override with CLI parameters
  if (params.template) config.template = params.template;
  if (params.style) config.style = params.style;
  if (params.format) {
    config.pdfOptions = { ...config.pdfOptions!, format: params.format };
  }

  return config;
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
