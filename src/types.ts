// Configuration interface
export interface MD2PDFConfig {
  template?: string;         // Path to Handlebars template
  style?: string;            // Path to CSS file
  pdfOptions?: PDFOptions;   // Puppeteer PDF options
  partials?: Record<string, string>; // Additional partials
}

export interface PDFOptions {
  format?: string;
  width?: string;
  height?: string;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  landscape?: boolean;
}

// Default configuration
export const DEFAULT_CONFIG: MD2PDFConfig = {
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

// Frontmatter interface
export interface FrontMatter {
  title?: string;
  author?: string;
  date?: string;
  [key: string]: any;
}

// Conversion result
export interface ConversionResult {
  success: boolean;
  outputPath?: string;
  error?: string;
}
