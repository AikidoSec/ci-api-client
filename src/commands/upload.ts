import { Argument, Command, InvalidArgumentError, Option } from 'commander';
import {
  TScanApiOptions,
  TUploadApiOptions,
  TUploadPayloadType,
  TUploadResult,
  pollScanStatus,
  startScan,
  uploadCustomScanResult,
} from '../aikidoApi.js';
import { getApiKey } from '../configuration.js';
import {
  outputError,
  outputHttpError,
  outputLog,
  startSpinner,
} from '../output.js';
import chalk from 'chalk';
import { Ora } from 'ora';
import { readFile } from 'fs';
import { promisify } from 'util';

type TUploadArguments = {
  data: TUploadApiOptions;
  onUploadComplete?: (startResult: TUploadResult) => void | null;
  onUploadFail?: (error: any) => void | null;
};

type TUploadCliOptions = {
  payloadFile?: string;
  payload?: string;
};

type TUploadUserCliOptions = {
  scanId?: string | number;
  repositoryId: string | number;
  containerImage?: string;
  type: TUploadPayloadType;
  file?: string;
  payload?: string;
  region?: string;
};

async function cli(options: TUploadUserCliOptions, command: string) {
  const apiKey = getApiKey();

  if (!apiKey) {
    outputError('Please set an api key using: aikido-cli-client apikey <key>');
  }

  // Process command options and group them into apiOptions hash
  const { apiOptions, cliOptions } = await parseCliOptions(options);

  let loader: Ora | null = startSpinner('Uploading custom scan');

  const onUploadComplete = (result: TUploadResult) => {
    if (result.success === 1) {
      loader?.succeed('Upload completed');
    } else {
      loader?.fail(
        'Upload failed, please verify your payload data and try again'
      );
      process.exit(10);
    }
  };

  const onUploadFail = (error: any) => {
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

export const upload = async ({
  data,
  onUploadComplete,
  onUploadFail,
}: TUploadArguments): Promise<void> => {
  try {
    const result = await uploadCustomScanResult(data);
    onUploadComplete?.(result);
  } catch (error) {
    onUploadFail?.(error);
    return;
  }
};

type TParseCliResult = {
  apiOptions: TUploadApiOptions;
  cliOptions: TUploadCliOptions;
};

const parseCliOptions = async (
  userCliOptions: TUploadUserCliOptions
): Promise<TParseCliResult> => {
  const apiOptions: TUploadApiOptions = {
    repository_id: userCliOptions.repositoryId,
    container_image_name: userCliOptions.containerImage ?? undefined,
    payload_type: userCliOptions.type,
    payload: '',
    region: userCliOptions.region ?? undefined,
  };

  const cliOptions: TUploadCliOptions = {
    payloadFile: userCliOptions.file,
    payload: userCliOptions.payload,
  };

  // Additional validation
  if (userCliOptions.type == TUploadPayloadType.JsonSbom) {
    if (
      userCliOptions.containerImage === undefined ||
      userCliOptions.containerImage.trim() === ''
    ) {
      outputError(
        'Please provide a valid container image name with --container-image'
      );
    }
  }

  if (userCliOptions.file) {
    // Read '--payloadFile' if available...
    try {
      const data: string = await promisify(readFile)(
        userCliOptions.file,
        'utf8'
      );
      apiOptions.payload = data;
    } catch (error) {
      outputError('Cannot read file provided with --payloadFile, aborting');
      process.exit(1);
    }
  } else if (cliOptions.payload?.trim() != '') {
    // ... no payloadFile provided, use the --payload information
    apiOptions.payload = cliOptions.payload!;
  } else {
    // No payload available? Abort
    outputError('No payload provided, aborting');
    process.exit(1);
  }

  return { apiOptions, cliOptions };
};

// Make an option required
const requiredOption = (option: Option): Option => {
  option.required = true;
  return option;
};

export const cliSetup = (program: Command) =>
  program
    .command('upload')
    .option('-s, --scan-id <scanid>', 'Set the scan id')
    .requiredOption(
      '-r, --repository-id <repositoryid>',
      'Set the repository id'
    )
    .option(
      '-i, --container-image <container-image-name>',
      'Set the container image name. '
    )
    .addOption(
      requiredOption(
        new Option(
          '-t, --type <type>',
          'Set the provided payload type. Available options are: checkov, json-sbom'
        ).choices(['checkov', 'json-sbom'])
      )
    )
    .option(
      '-f, --file <payloadFile>',
      'Specify the payload file. The cli command wil read the file and use the contents as payload data.'
    )
    .addOption(
      new Option(
        '--region <region>',
        'Specify the region where your Aikido workspace is located. Accepted options are: eu, us and me.'
      ).choices(['eu', 'us', 'me'])
    )
    .option('-p, --payload <payload>', 'Set the payload')
    .description('Upload a custom scan result.')
    .action(cli);

export default { cli, cliSetup };
