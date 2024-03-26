#!/usr/bin/env node
import chalk from 'chalk';
import { Command } from 'commander';
import dotenv from 'dotenv';
import apiKey from './commands/apiKey.js';
import scan from './commands/scan.js';
import upload from './commands/upload.js';

// Load all .env configuration variables and auto-inject them into process.env
dotenv.config(
  process.env.NODE_ENV ? { path: `.env.${process.env.NODE_ENV}` } : {}
);

// Start up commander.js Command instance
export const program = new Command();

program
  .name('Aikido API Client')
  .description(
    'CLI api client to easily integrate the Aikido public CI API into custom deploy scripts'
  )
  .version('1.0.4');

// Load in all app commands and set them up in the `program` instance
apiKey.cliSetup(program);
scan.cliSetup(program);
upload.cliSetup(program);

// Override global process.env type
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: any; // used any here
      QUIET?: boolean;
      CLI_DEBUG?: boolean | string;
    }
  }
}

// Add global option "--quiet"
program
  .option('-q, --quiet', 'Disable console output when executing commands')
  .on('option:quiet', function () {
    process.env.QUIET = true;
  });

// Add global option "--debug"
program
  .option('--debug', 'Add additional debug information to command output')
  .on('option:debug', function () {
    process.env.CLI_DEBUG = true;
  });

// Add global option "--apikey"
program.option(
  '--apikey <apikey>',
  'Use a cli apikey instead of reading the key from the configuration'
);

program.configureOutput({
  outputError: (str, write) => write(chalk.red(str)),
});

program.parse();
