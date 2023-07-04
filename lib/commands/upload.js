import { Option } from 'commander';
import { TUploadPayloadType, uploadCustomScanResult, } from '../aikidoApi.js';
import { getApiKey } from '../configuration.js';
import { outputError, outputHttpError, startSpinner, } from '../output.js';
import { readFile } from 'fs';
import { promisify } from 'util';
async function cli(options, command) {
    const apiKey = getApiKey();
    if (!apiKey) {
        outputError('Please set an api key using: aikido-cli apikey <key>');
    }
    const { apiOptions, cliOptions } = await parseCliOptions(options);
    console.log('options', options);
    console.log('apiOptions', apiOptions);
    console.log('cliOptions', cliOptions);
    let loader = startSpinner('Uploading custom scan');
    const onUploadComplete = (result) => {
        if (result.success === 1) {
            loader?.succeed('Upload completed');
        }
        else {
            loader?.fail('Upload failed, please verify your payload data and try again');
            process.exit(10);
        }
    };
    const onUploadFail = (error) => {
        loader?.fail();
        outputHttpError(error);
        process.exit(1);
    };
    await upload({
        data: apiOptions,
        onUploadComplete,
        onUploadFail,
    });
}
export const upload = async ({ data, onUploadComplete, onUploadFail, }) => {
    try {
        const result = await uploadCustomScanResult(data);
        onUploadComplete?.(result);
    }
    catch (error) {
        onUploadFail?.(error);
        return;
    }
};
const parseCliOptions = async (userCliOptions) => {
    const apiOptions = {
        repository_id: userCliOptions.repositoryId,
        container_image_name: userCliOptions.containerImage ?? undefined,
        payload_type: userCliOptions.type,
        payload: '',
    };
    const cliOptions = {
        payloadFile: userCliOptions.file,
        payload: userCliOptions.payload,
    };
    if (userCliOptions.type == TUploadPayloadType.JsonSbom) {
        if (userCliOptions.containerImage === undefined ||
            userCliOptions.containerImage.trim() === '') {
            outputError('Please provide a valid container image name with --container-image');
        }
    }
    if (userCliOptions.file) {
        try {
            const data = await promisify(readFile)(userCliOptions.file, 'utf8');
            apiOptions.payload = data;
        }
        catch (error) {
            outputError('Cannot read file provided with --payloadFile, aborting');
            process.exit(1);
        }
    }
    else if (cliOptions.payload?.trim() != '') {
        apiOptions.payload = cliOptions.payload;
    }
    else {
        outputError('No payload provided, aborting');
        process.exit(1);
    }
    return { apiOptions, cliOptions };
};
const requiredOption = (option) => {
    option.required = true;
    return option;
};
export const cliSetup = (program) => program
    .command('upload')
    .option('-s, --scan-id <scanid>', 'Set the scan id')
    .requiredOption('-r, --repository-id <repositoryid>', 'Set the repository id')
    .option('-i, --container-image <container-image-name>', 'Set the container image name. ')
    .addOption(requiredOption(new Option('-t, --type <type>', 'Set the provided payload type. Available options are: checkov, json-sbom').choices(['checkov', 'json-sbom'])))
    .option('-f, --file <payloadFile>', 'Specify the payload file. The cli command wil read the file and use the contents as payload data.')
    .option('-p, --payload <payload>', 'Set the payload')
    .description('Upload a custom scan result.')
    .action(cli);
export default { cli, cliSetup };
