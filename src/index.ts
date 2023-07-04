#!/usr/bin/env node
import chalk from 'chalk';
import { Command } from 'commander';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import apiKey from './commands/apiKey.js';
import scan from './commands/scan.js';

// Override global process.env type
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: any; // used any here
      QUIET?: boolean;
    }
  }
}

// Load all .env configuration variables and auto-inject them into process.env
dotenv.config();

// Determine current file location and path to
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __rootdirname = dirname(__dirname);

// Set commander instance info from package.json
const pkgJsonPath = join('/', __rootdirname, 'package.json');
const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));

// Start up commander.js Command instance
export const program = new Command();

program
  .name(pkgJson.name)
  .description(pkgJson.description)
  .version(pkgJson.version);

// Load in all app commands and set them up in the `program` instance
apiKey.cliSetup(program);
scan.cliSetup(program);

// Add global option "quiet"
program
  .option('-q, --quiet', 'Disable console output when executing commands')
  .on('option:quiet', function () {
    process.env.QUIET = true;
  });

program.configureOutput({
  outputError: (str, write) => write(chalk.red(str)),
});

program.parse();
