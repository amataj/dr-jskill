#!/usr/bin/env node

import { resolve } from 'node:path';
import { parseJdlFile } from './parse-jdl.mjs';
import { normalizeModel } from './normalize-model.mjs';
import { generateProject } from './generate-project.mjs';

function usage() {
  console.log(`Usage: node scripts/cl-etl-generator/index.mjs --jdl <path> [--output <dir>] [--write]

Options:
  --jdl <path>       Path to the input JDL file
  --output <dir>     Output directory for generated artifacts (default: current directory)
  --write            Write bootstrap files instead of dry-run
  -h, --help         Show this help

This bootstrap implementation:
  - parses entity and enum declarations from JDL
  - normalizes them into an ETL Clean Architecture model
  - prints or writes a generation plan
`);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const options = {
    outputDir: process.cwd(),
    write: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--jdl') {
      options.jdlPath = args[i + 1];
      i += 1;
    } else if (arg === '--output') {
      options.outputDir = args[i + 1];
      i += 1;
    } else if (arg === '--write') {
      options.write = true;
    } else if (arg === '-h' || arg === '--help') {
      options.help = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

try {
  const options = parseArgs(process.argv);
  if (options.help) {
    usage();
    process.exit(0);
  }
  if (!options.jdlPath) {
    usage();
    throw new Error('Missing required --jdl <path> option.');
  }

  const parsed = await parseJdlFile(resolve(options.jdlPath));
  const model = normalizeModel(parsed);
  const result = await generateProject({
    model,
    outputDir: resolve(options.outputDir),
    write: options.write,
  });

  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
