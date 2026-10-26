import ora from 'ora';
import { program } from './index.js';
import chalk from 'chalk';
export const outputLog = (message) => {
    if (!process.env.QUIET) {
        console.log(message);
    }
};
export const outputJson = (data) => {
    console.log(JSON.stringify(data, null, 2));
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
                    return outputError(`${statusStr}: Authentication failed. Check your API key, or for OIDC that the repo is connected to Aikido and the job has \`permissions: id-token: write\`. Generate a new API key at https://app.aikido.dev/settings/integrations/continuous-integration`);
                case 403:
                    return outputError(`${statusStr}: Could not authenticate with the Aikido API. Verify your API key or OIDC setup (\`--region\` must match your workspace).`);
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
