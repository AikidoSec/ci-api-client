import ora, { Ora } from 'ora';
import { program } from './index.js';
import { AxiosError } from 'axios';
import chalk from 'chalk';

// Output a console message
export const outputLog = (message: string): void => {
  if (!process.env.QUIET) {
    console.log(message);
  }
};

// Output some message, var, .. if --debug was provided
export const outputDebug = (variable: any): void => {
  if (process.env.CLI_DEBUG == true || process.env.CLI_DEBUG == 'true') {
    console.log(
      chalk.blue(
        typeof variable == 'object' ? JSON.stringify(variable) : variable
      )
    );
  }
};

// Output an error message
// Error output should not take into account the global "quiet" option
export const outputError = (message: string, exitCode: number = 1): void => {
  program.error(message, {
    exitCode,
  });
};

export const outputHttpError = (axiosError: AxiosError): void => {
  if (axiosError.code === 'ECONNREFUSED') {
    outputError(
      `Could not connect to Aikido API (${axiosError.message}). Please verify your network settings`
    );
  } else if (
    axiosError.response?.status &&
    axiosError.response?.status === 401
  ) {
    outputError(
      'Request failed. The provided api key is most likely no longer valid and has been rotated or revoked. Visit https://app.aikido.dev/settings/integrations/continuous-integration to generate a new key.'
    );
  } else if (
    axiosError.response?.status &&
    axiosError.response?.status === 403
  ) {
    outputError(
      'Could not authenticate with the Aikido API. Please verify your Aikdio API key.'
    );
  } else if (
    axiosError.response?.status &&
    axiosError.response?.status === 500
  ) {
    outputError('Something went wrong contacting the Aikido API.');
  }

  const statusStr = axiosError.response?.status
    ? ` (${axiosError.response?.status})`
    : '';

  if (axiosError.response) {
    outputDebug(axiosError.response?.status);
    outputDebug(axiosError.response?.headers);
    outputDebug(axiosError.response?.data);
  }

  outputError(
    `Something unexpected went wrong${statusStr}... Please contact us if this problem persists.`
  );
};

// Start a new spinner
// The result of this function can be null if the global "quiet" option
// was set. Spinners should always be treated as optionals
// (e.g. mySpinner?.stop())
export const startSpinner = (message: string): Ora | null => {
  if (process.env.QUIET) {
    return null;
  }

  const spinner = ora(message);
  spinner.color = 'magenta';
  spinner.start();

  return spinner;
};
