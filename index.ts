#!/usr/bin/env node

import yargs from 'yargs';
import path from 'path';

import { publish, publish_with_path } from './publish';

export interface Options {
  title: string;
  template: string;
  toc_levels: number[];
}

const argv = yargs(process.argv.slice(2))
  .usage('Usage: $0 [FILE] [-o FILE] [-t NAME]')
  .example('$0 input.md -o output.html', 'Convert input.md to output.html.')
  .example('cat input.md | $0 > output.html', 'Convert input.md to output.html.')
  .option('output', {
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
  .help()
  .argv;

let opath: string;
if (argv['output']) {
  opath = path.resolve(argv['output']);
}

const opts: Options = {
  title: argv['output'] ? path.basename(argv['output']) : 'HTML Document',
  template: argv['template'],
  toc_levels: Array.from({ length: argv['toc-max'] - argv['toc-min'] + 1 }, (_, i) => argv['toc-min'] + i),
};

if (argv['_'].length > 0) {
  publish_with_path(path.resolve(argv['_'][0]), opath, opts);
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
    if (input.length === 0) {
      console.error('No input received from stdin.');
      process.exit(1);
    }

    publish(input, opath, opts);
  });
}
