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
    if (axiosError.isAxiosError) {
        if (axiosError.code === 'ECONNREFUSED') {
            outputError(`Could not connect to Aikido API (${axiosError.message}). Please verify your network settings.`);
        }
        else if (axiosError.response) {
            outputDebug(axiosError.response.status);
            outputDebug(axiosError.response.headers);
            outputDebug(axiosError.response.data);
            const statusStr = `${axiosError.response.status} ${axiosError.response.statusText}`;
            switch (axiosError.response.status) {
                case 401:
                    return outputError(`${statusStr}: The provided api key is most likely no longer valid and has been rotated or revoked. Visit https://app.aikido.dev/settings/integrations/continuous-integration to generate a new key.`);
                case 403:
                    return outputError(`${statusStr}: Could not authenticate with the Aikido API. Please verify your Aikdio API key.`);
                case 500:
                    return outputError(`${statusStr}: Something went wrong contacting the Aikido API. Please try again later.`);
                default:
                    return outputError(`${statusStr}: ${axiosError.response.data ?? ''} Please contact us if this problem persists.`);
            }
        }
        else if (axiosError.request) {
            return outputError('No response received from the server. Please try again later.');
        }
        else if (axiosError.code === 'ECONNREFUSED') {
            return outputError(`Could not connect to Aikido API (${axiosError.message}). Please verify your network settings.`);
        }
        outputDebug(axiosError);
        return outputError(`Error: (${axiosError.message}). Please contact us if this problem persists.`);
    }
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
