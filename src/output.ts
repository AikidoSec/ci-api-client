import ora, { Ora } from 'ora';
import { program } from './index.js';
import { AxiosError } from 'axios';
import chalk from 'chalk';
import { getUseOidc } from './configuration.js';

// Output a console message
export const outputLog = (message: string): void => {
  if (!process.env.QUIET) {
    console.log(message);
  }
};

// Output a machine readable result
// This ignores the global "quiet" option: it is the output that was asked
// for, not human readable progress information
export const outputJson = (data: unknown): void => {
  console.log(JSON.stringify(data, null, 2));
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
  outputDebug(axiosError);

  if (axiosError.isAxiosError) {
    if (axiosError.response) {
      const statusStr = `${axiosError.response.status} ${axiosError.response.statusText}`;
      const useOidc = getUseOidc();

      switch (axiosError.response.status) {
        case 401:
          if (useOidc) {
            return outputError(
              oidcFailureMessage(
                axiosError,
                `${statusStr}: OIDC authentication was rejected`,
                'Ensure the repo is connected to Aikido, the job has `permissions: id-token: write`, and `--region` matches your workspace.'
              )
            );
          }
          return outputError(
            `${statusStr}: Authentication failed. The provided API key is most likely no longer valid and has been rotated or revoked. Generate a new key at https://app.aikido.dev/settings/integrations/continuous-integration`
          );
        case 403:
          if (useOidc) {
            return outputError(
              oidcFailureMessage(
                axiosError,
                `${statusStr}: Could not authenticate with the Aikido API via OIDC`,
                'Verify your OIDC setup (`--use-oidc` and `--region` must match your workspace).'
              )
            );
          }
          return outputError(
            `${statusStr}: Could not authenticate with the Aikido API. Please verify your Aikido API key.`
          );
        case 500:
          return outputError(
            `${statusStr}: Something went wrong contacting the Aikido API. Please try again later.`
          );
        default:
          return outputError(
            `${statusStr}: ${
              axiosError.response.data ?? ''
            } Please contact us if this problem persists.`
          );
      }
    }

    return outputError(`${axiosError.name}: ${axiosError.message}`);
  }

  return outputError(
    'Unexpected error occurred. Please contact us if this problem persists.'
  );
};

const oidcFailureMessage = (axiosError: AxiosError,prefix: string,fallbackHint: string): string => {
  const data = axiosError.response?.data as any;
  const fromBody = typeof data === 'string' ? data : data?.reason_phrase || data?.error || data?.message || data?.detail;

  if (typeof fromBody === 'string' && fromBody.trim()) {
    return `${prefix}: ${fromBody.trim()}`;
  }

  const detail = axiosError.response?.statusText?.trim() ?? null;
  if (!detail) {
    return `${prefix}. ${fallbackHint}`;
  }

  return `${prefix}: ${detail}`;
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
