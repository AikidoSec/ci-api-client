#!/usr/bin/env node
import chalk from 'chalk';
import { Command } from 'commander';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import apiKey from './commands/apiKey.js';
import scan from './commands/scan.js';
import upload from './commands/upload.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __rootdirname = dirname(__dirname);
dotenv.config(process.env.NODE_ENV ? { path: `.env.${process.env.NODE_ENV}` } : {});
const pkgJsonPath = join('/', __rootdirname, 'package.json');
export const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
export const program = new Command();
program
    .name(pkgJson.name)
    .description(pkgJson.description)
    .version(pkgJson.version);
apiKey.cliSetup(program);
scan.cliSetup(program);
upload.cliSetup(program);
program
    .option('-q, --quiet', 'Disable console output when executing commands')
    .on('option:quiet', function () {
    process.env.QUIET = true;
});
program
    .option('--debug', 'Add additional debug information to command output')
    .on('option:debug', function () {
    process.env.CLI_DEBUG = true;
});
program.option('--apikey <apikey>', 'Use a cli apikey instead of reading the key from the configuration');
program.configureOutput({
    outputError: (str, write) => write(chalk.red(str)),
});
program.parse();
