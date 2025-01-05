#!/usr/bin/env node

import yargs from 'yargs';
import path from 'path';

import { publish, publish_with_path, templates } from './publish';

export interface Options {
  title: string;
  template: string;
  toc_levels: number[];
  html: boolean;
}

const convert = (argv: Record<string, any>) => {
  let opath: string;
  if (argv['output']) {
    opath = path.resolve(argv['output']);
  }

  const opts: Options = {
    title: argv['output'] ? path.basename(argv['output']) : 'HTML Document',
    template: argv['template'],
    toc_levels: Array.from({ length: argv['toc-max'] - argv['toc-min'] + 1 }, (_, i) => argv['toc-min'] + i),
    html: argv['html'],
  };

  if (argv['input']) {
    publish_with_path(path.resolve(argv['input']), opath, opts);
  } else {
    let input = '';

    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
      const chunk = process.stdin.read();
      if (chunk !== null) {
        input += chunk;
      }
    });

    process.stdin.on('end', () => {
      console.log(argv);
      if (input.length === 0) {
        console.error('No input received from stdin.');
        process.exit(1);
      }

      publish(input, opath, opts);
    });
  }
};

yargs(process.argv.slice(2))
  .usage('Usage: $0 [FILE] [-o FILE] [-t NAME]')
  .example('$0 input.md -o output.html', 'Convert input.md to output.html.')
  .example('cat input.md | $0 > output.html', 'Convert input.md to output.html.')
  .command(
    '* [input]',
    'Convert a markdown to HTML',
    (yargs) => yargs.positional('input', {
      type: 'string',
      describe: 'Input file path',
    }).option('output', {
        alias: 'o',
        type: 'string',
        describe: 'Output file path',
      })
      .option('template', {
        alias: 't',
        type: 'string',
        default: 'default',
        describe: 'Template name',
      })
      .option('toc-min', {
        type: 'number',
        default: 2,
        describe: 'Minimum heading level to include in the table of contents',
      })
      .option('toc-max', {
        type: 'number',
        default: 4,
        describe: 'Maximum heading level to include in the table of contents',
      })
      .option('html', {
        type: 'boolean',
        default: false,
        describe: 'Allow HTML in the input',
      }),
    (argv) => convert(argv),
  )
  .command(
    'templates',
    'Show available templates',
    (yargs) => yargs,
    (_) => templates(),
  )
  .version('v0.0.9')
  .help()
  .argv;
