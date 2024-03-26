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
    outputDebug(axiosError);
    if (axiosError.isAxiosError) {
        if (axiosError.response) {
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
        return outputError(`${axiosError.name}: ${axiosError.message}`);
    }
    return outputError('Unexpected error occurred. Please contact us if this problem persists.');
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
