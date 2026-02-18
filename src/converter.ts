import fm from 'front-matter';
import { marked } from 'marked';
import { FrontMatter } from './types.js';

export class Converter {
  constructor() {
    // Configure marked options
    marked.setOptions({
      gfm: true,
      breaks: true
    });
  }

  convert(markdown: string): { html: string; frontMatter: FrontMatter } {
    const { attributes, body } = fm(markdown);
    const html = marked(body, { async: false }) as string;
    return {
      html,
      frontMatter: attributes as FrontMatter
    };
  }

  async convertFile(filePath: string): Promise<{ html: string; frontMatter: FrontMatter }> {
    // Will be implemented with file reading
    const content = await (await import('./utils.js')).readFileAsync(filePath);
    return this.convert(content);
  }
}
