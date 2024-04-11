import * as ejs from 'ejs';
import { promises as fs } from 'fs';
import * as path from 'path';

import MarkdownIt from 'markdown-it';
import katex from 'katex';
import highlightJs from 'highlight.js';
import mdFootnote from 'markdown-it-footnote';
import mdTex from 'markdown-it-texmath';
import mdAnchor from 'markdown-it-anchor';
import mdInlineComment from 'markdown-it-inline-comments';
import { full as mdEmoji } from 'markdown-it-emoji';
import mdMermaid from 'markdown-it-mermaid';
import mdContainer from 'markdown-it-container';

interface Document {
  title: string;
  html: string;
}

const md: MarkdownIt = new MarkdownIt({
  html: false,
  xhtmlOut: false,
  breaks: false,
  langPrefix: 'language-',
  linkify: true,
  typographer: true,
  quotes: '“”‘’',
  highlight: (str, language) => {
    if (language && highlightJs.getLanguage(language)) {
      return `<pre class="hljs"><code>${highlightJs.highlight(str, { language, ignoreIllegals: true }).value}</code></pre>`;
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
}).use(mdFootnote)
.use(mdInlineComment)
.use(mdMermaid)
.use(mdEmoji)
.use(mdTex, {
  engine: katex,
  delimiters: 'dollars',
  macros: { '\\RR': '\\mathbb{R}' },
})
.use(mdAnchor)
.use(mdContainer, 'TOGGLE', {
  validate(params: any) {
    return params.trim().match(/^TOGGLE\s+(.*)$/);
  },
  render(tokens: any[], idx: number) {
    const content = tokens[idx].info.trim().match(/^TOGGLE\s+(.*)$/);
    if (tokens[idx].nesting === 1) {
      return `<details><summary>${md.utils.escapeHtml(content[1])}</summary>\n`;
    }
    return '</details>\n';
  },
});

const template_path = (name: string = 'default') => {
  return path.resolve(__dirname, `../templates/${name}.ejs`);
};

const document = (markdown: string, html: string): Document => {
  return { title: markdown.match(/^#\s.*/)[0].replace(/^#\s/, ''), html }
};

export const publish_with_path = async (input: string, output?: string, template?: string) => {
  const markdown = (await fs.readFile(input)).toString();
  publish(markdown, output, template);
};

export const publish = async (markdown: string, output?: string, template?: string) => {
  const html = ejs.render(
    String(await fs.readFile(template_path(template))),
    { document: document(markdown, md.render(markdown)) },
  );

  if (output) {
    fs.writeFile(output, html);
  } else {
    process.stdout.write(html);
  }
};
