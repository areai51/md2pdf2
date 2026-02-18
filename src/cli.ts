#!/usr/bin/env node

import { Command } from 'commander';
import { readFileAsync, writeFileAsync, fileExists, resolvePath } from './utils.js';
import { Converter } from './converter.js';
import { TemplateEngine } from './template-engine.js';
import { PDFGenerator } from './pdf-generator.js';
import { MD2PDFConfig, DEFAULT_CONFIG } from './types.js';

const program = new Command();

program
  .name('md2pdf')
  .description('Convert Markdown to PDF using customizable templates')
  .version('0.1.0');

program
  .command('convert')
  .description('Convert a Markdown file to PDF')
  .argument('<input>', 'Input Markdown file')
  .option('-o, --output <file>', 'Output PDF file')
  .option('-t, --template <file>', 'Custom template file (Handlebars)')
  .option('-s, --style <file>', 'Custom CSS file')
  .option('-c, --config <file>', 'Configuration file (md2pdf.config.js)')
  .option('--no-pdf', 'Only generate HTML, do not create PDF')
  .action(async (input, options) => {
    try {
      // Load configuration
      const config = await loadConfig(options);

      // Override with CLI options
      if (options.template) config.template = options.template;
      if (options.style) config.style = options.style;

      // Validate input file
      if (!(await fileExists(input))) {
        console.error(`Error: Input file not found: ${input}`);
        process.exit(1);
      }

      // Read input markdown
      const markdown = await readFileAsync(input);

      // Convert to HTML
      const converter = new Converter();
      const { html, frontMatter } = converter.convert(markdown);

      // Load styles
      let styles = '';
      if (config.style && await fileExists(config.style!)) {
        styles = await readFileAsync(config.style!);
      }

      // Load and render template
      const engine = new TemplateEngine(config);
      if (config.template && await fileExists(config.template)) {
        await engine.loadTemplate(config.template);
      } else {
        // Use built-in default template
        engine.loadDefaultTemplate();
      }

      const renderedHtml = engine.render(html, frontMatter, styles);

      // Determine output path
      const outputPath = options.output || (await getOutputPath(input));
      const htmlPath = outputPath.replace(/\.pdf$/, '.html');

      // Save HTML for debugging
      await writeFileAsync(htmlPath, renderedHtml);
      console.log(`✓ HTML generated: ${htmlPath}`);

      // Generate PDF unless disabled
      if (!options.pdf) {
        const generator = new PDFGenerator();
        await generator.generate(renderedHtml, outputPath, config.pdfOptions);
        console.log(`✓ PDF generated: ${outputPath}`);
      }

    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

async function loadConfig(options: any): Promise<MD2PDFConfig> {
  const config: MD2PDFConfig = { ...DEFAULT_CONFIG };

  if (options.config && await fileExists(options.config)) {
    const configModule = await import(resolvePath(process.cwd(), options.config));
    const userConfig = configModule.default || configModule;
    Object.assign(config, userConfig);
  }

  return config;
}

function getOutputPath(inputPath: string): string {
  const name = resolvePath(inputPath).split('/').pop() || 'output';
  const baseName = name.replace(/\.(md|markdown)$/i, '');
  return `${baseName}.pdf`;
}

program.parse();
