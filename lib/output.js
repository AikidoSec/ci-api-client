import ora from 'ora';
import { program } from './index.js';
import chalk from 'chalk';
export const outputLog = (message) => {
    if (!process.env.QUIET) {
        console.log(message);
    }
};
export const outputDebug = (variable) => {
    if (process.env.CLI_DEBUG == true || process.env.CLI_DEBUG == 'true') {
        console.log(chalk.blue(typeof variable == 'object' ? JSON.stringify(variable) : variable));
    }
};
export const outputError = (message, exitCode = 1) => {
    program.error(message, {
        exitCode,
    });
};
export const outputHttpError = (axiosError) => {
    if (axiosError.code === 'ECONNREFUSED') {
        outputError(`Could not connect to Aikido API (${axiosError.message}). Please verify your network settings`);
    }
    else if (axiosError.response?.status &&
        axiosError.response?.status === 401) {
        outputError('Request failed. The provided api key is most likely no longer valid and has been rotated or revoked. Visit https://app.aikido.dev/settings/integrations/continuous-integration to generate a new key.');
    }
    else if (axiosError.response?.status &&
        axiosError.response?.status === 403) {
        outputError('Could not authenticate with the Aikido API. Please verify your Aikdio API key.');
    }
    else if (axiosError.response?.status &&
        axiosError.response?.status === 500) {
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
    outputError(`Something unexpected went wrong${statusStr}... Please contact devsupport@aikido.dev if this problem persists.`);
};
export const startSpinner = (message) => {
    if (process.env.QUIET) {
        return null;
    }
    const spinner = ora(message);
    spinner.color = 'magenta';
    spinner.start();
    return spinner;
};
