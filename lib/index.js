#!/usr/bin/env node
import chalk from 'chalk';
import { Command } from 'commander';
import dotenv from 'dotenv';
import apiKey from './commands/apiKey.js';
import scan from './commands/scan.js';
import scanRelease from './commands/scanRelease.js';
import upload from './commands/upload.js';
dotenv.config(process.env.NODE_ENV ? { path: `.env.${process.env.NODE_ENV}` } : {});
export const program = new Command();
program
    .name('Aikido API Client')
    .description('CLI api client to easily integrate the Aikido public CI API into custom deploy scripts')
    .version('1.0.8');
apiKey.cliSetup(program);
scan.cliSetup(program);
scanRelease.cliSetup(program);
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
program
    .option('--plain-output', 'Disables the formatting on output')
    .on('option:plain-output', function () {
    chalk.level = 0;
});
program.option('--apikey <apikey>', 'Use a cli apikey instead of reading the key from the configuration');
program.configureOutput({
    outputError: (str, write) => write(chalk.red(str)),
});
program.parse();
