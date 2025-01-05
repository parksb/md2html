import os from 'os';
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
import mdTableOfContents from 'markdown-it-table-of-contents';

import { Options } from './index';

interface Document {
  title: string;
  html: string;
}

const template_dir_path = async () => {
  try {
    const tpath = path.resolve(__dirname, `../templates`);
    await fs.access(tpath);
    return tpath;
  } catch (e) {
    try {
      const tpath = path.join(os.homedir(), `.config/md2html/templates`)
      await fs.access(tpath);
      return tpath;
    } catch (e) {
      throw new Error(`Template directory not found.`);
    }
  }
};

const template_path = async (name: string) => {
  return path.join(await template_dir_path(), `${name}.ejs`);
};

export const templates = async () => {
  const tpath = await template_dir_path();
  const templates = (await fs.readdir(tpath)).map((t) => t.replace(/\.ejs$/, '')).join('\n');
  process.stdout.write(`${tpath}\n${templates}`);
};

const document = (markdown: string, html: string, opts: Options): Document => {
  const title = markdown.match(/^#\s.*/);

  if (!title) {
    return { title: opts.title, html };
  }

  return { title: title[0].replace(/^#\s/, ''), html }
};

export const publish_with_path = async (input: string, output: string, opts: Options) => {
  const markdown = (await fs.readFile(input)).toString();
  publish(markdown, output, opts);
};

export const publish = async (markdown: string, output: string, opts: Options) => {
  const { template, toc_levels } = opts;

  const md: MarkdownIt = new MarkdownIt({
    html: opts.html,
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
  .use(mdTableOfContents, {
    includeLevel: toc_levels,
    listType: 'ul',
  })
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

  const html = ejs.render(
    String(await fs.readFile(await template_path(template))),
    { document: document(markdown, md.render(markdown), opts) },
  );

  if (output) {
    fs.writeFile(output, html);
  } else {
    process.stdout.write(html);
  }
};
