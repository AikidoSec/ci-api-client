import ora from 'ora';
import { program } from './index.js';
export const outputLog = (message) => {
    if (!process.env.QUIET) {
        console.log(message);
    }
};
export const outputError = (message, exitCode = 1) => {
    program.error(message, {
        exitCode,
    });
};
export const outputHttpError = (axiosError) => {
    if (axiosError.code === 'ECONNREFUSED') {
        outputError('Could not connect to Aikido API. Please verify your network settings');
    }
    else if (axiosError.response?.status &&
        axiosError.response?.status === 403) {
        outputError('Could not authenticate with the Aikido API. Please verify your Aikdio API key.');
    }
    else if (axiosError.response?.status &&
        axiosError.response?.status === 500) {
        outputError('Something went wrong contacting the Aikido API.');
    }
    outputError('Something unexpected went wrong. Please contact devsupport@aikido.dev if this problem persists...');
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
