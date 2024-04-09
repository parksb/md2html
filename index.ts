#!/usr/bin/env node

import yargs from 'yargs';
import path from 'path';

import { publish, publish_with_path } from './publish';

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
  .help()
  .argv;

let outputpath: string;
if (argv['output']) {
  outputpath = path.resolve(argv['output']);
}

if (argv['_'].length > 0) {
  publish_with_path(path.resolve(argv['_'][0]), outputpath, argv['template']);
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

    publish(input, outputpath, argv['template']);
  });
}
