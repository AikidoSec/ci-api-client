import chalk from 'chalk';
import { Argument, Command, InvalidArgumentError, Option } from 'commander';
import { Ora } from 'ora';
import {
  TPollIsScanningResult,
  TPollScanCompletedDefaultBranchResult,
  TPollScanFeatureBranchCompletedResult,
  TScanApiOptions,
  TStartScanResult,
  pollScanStatus,
  startScan,
} from '../aikidoApi.js';
import { getApiKey } from '../configuration.js';
import {
  outputError,
  outputHttpError,
  outputLog,
  startSpinner,
} from '../output.js';

type TScanArguments = {
  repoId: string | number;
  baseCommitId: string;
  headCommitId: string;
  branchName: string;
  options: TScanApiOptions;
  pollInterval?: number;
  timeout?: number;
  onStart?: () => void | null;
  onStartComplete?: (startResult: any) => void | null;
  onStartFail?: (error: any) => void | null;
  onScanStart?: (
    startResult:
      | TPollIsScanningResult
      | TPollScanFeatureBranchCompletedResult
      | TPollScanCompletedDefaultBranchResult
  ) => void | null;
  onNextPoll?: (
    pollResult:
      | TPollIsScanningResult
      | TPollScanFeatureBranchCompletedResult
      | TPollScanCompletedDefaultBranchResult
  ) => void | null;
  onScanComplete?: (
    pollResult:
      | TPollIsScanningResult
      | TPollScanFeatureBranchCompletedResult
      | TPollScanCompletedDefaultBranchResult
  ) => void | null;
  onScanTimeout?: () => void | null;
  onScanFail?: (error: any) => void | null;
};

type TScanCliOptions = {
  pollInterval: number;
  timeout: number;
};

type TScanUserCliOptions = {
  pullRequestTitle?: string;
  pullRequestUrl?: string;
  selfManagedScanners?: string[];
  failOnDependencyScan?: boolean;
  failOnSastScan?: boolean;
  failOnIacScan?: boolean;
  minimumSeverityLevel?: string;
  pollInterval?: number;
  timeout?: number;
};

async function cli(
  repoId: string,
  baseCommitId: string,
  headCommitId: string,
  branchName: string,
  options: TScanUserCliOptions,
  command: string
) {
  const apiKey = getApiKey();

  if (!apiKey) {
    outputError('Please set an api key using: aikido-cli apikey <key>');
  }

  // Process command options and group them into apiOptions hash
  const { apiOptions, cliOptions } = parseCliOptions(options);

  let loader: Ora | null;
  let pollCount: number = 1;

  // Setup different scan() event handlers
  const onStart = () => {
    loader = startSpinner('Starting Aikido Security scan');
  };

  const onStartComplete = (startResult: TStartScanResult) => {
    // Get the scan start as unix timestamp
    loader?.succeed(
      `Aikido Security scan started (id: ${startResult.scan_id})`
    );
  };

  const onNextPoll = () => {
    if (loader) {
      loader.text = `Polling for Aikido Security scan to complete (${pollCount})`;
    }

    pollCount += 1;
  };

  const onScanStart = () => {
    loader = startSpinner('Waiting for scan to complete');
  };

  const onScanComplete = (pollResult: any) => {
    if (pollResult.gate_passed === true) {
      loader?.succeed('Scan completed, no new issues found');
    } else {
      loader?.fail('Scan completed with issues');

      if (pollResult.open_issues_found) {
        outputLog(
          chalk.gray(
            chalk.bold('Open issues found: ') + pollResult.open_issues_found
          )
        );
      }

      if (pollResult.issue_links) {
        outputLog(
          chalk.gray(
            pollResult.issue_links
              .map((issueLink: string) => '- ' + issueLink)
              .join('\n')
          )
        );
      }

      if (pollResult.diff_url) {
        outputLog(chalk.gray(`* Diff url: ${pollResult.diff_url}`));
      }

      process.exit(10);
    }
  };

  const onScanTimeout = () => {
    // Output timeout message and exit with error code 5
    loader?.fail(`Sorry, your scan timed out (${cliOptions.timeout}s)...`);
    process.exit(5);
  };

  const onFail = (error: any) => {
    loader?.fail();

    if (error.response?.status && error.response?.status === 404) {
      outputError(
        'Please verify your repoId, baseCommitId, headCommitId and branchName. Did you add your repo to Aikido?'
      );
    } else {
      outputHttpError(error);
    }

    process.exit(1);
  };

  await scan({
    repoId,
    baseCommitId,
    headCommitId,
    branchName,
    options: apiOptions,
    pollInterval: cliOptions.pollInterval,
    timeout: cliOptions.timeout,
    onStart,
    onStartComplete,
    onStartFail: onFail,
    onNextPoll,
    onScanStart,
    onScanComplete,
    onScanTimeout,
    onScanFail: onFail,
  });
}

export const scan = async ({
  repoId,
  baseCommitId,
  headCommitId,
  branchName,
  options,
  pollInterval = 5,
  timeout = 180,
  onStart,
  onStartComplete,
  onStartFail,
  onScanStart,
  onNextPoll,
  onScanComplete,
  onScanTimeout,
  onScanFail,
}: TScanArguments): Promise<void> => {
  onStart?.();

  let result: any | null = null;

  // Initialize a scan and call onStartComplete, onStartFail
  // handlers where needed
  try {
    result = await startScan({
      repository_id: repoId,
      base_commit_id: baseCommitId,
      head_commit_id: headCommitId,
      branch_name: branchName,
      ...options,
    });

    if (result.scan_id) {
      onStartComplete?.(result);
    } else {
      onStartFail?.(result);
      return;
    }
  } catch (error) {
    onStartFail?.(error);
    return;
  }

  onScanStart?.(result);
  let pollResult;

  // Save scan start unix timestamp
  const scanStartTimestamp = Date.now() / 1000;

  // Poll status with a setTimeout
  const pollStatus = async () => {
    try {
      pollResult = await pollScanStatus(result.scan_id);

      // If "all_scans_completed" returns true, call the onScanComplete
      // handler, if not, re poll with `pollInterval`
      // Note that onScanComplete can return a successfull or
      // unsuccessfull scan result
      if (pollResult.all_scans_completed === false) {
        const totalScanTime = Date.now() / 1000 - scanStartTimestamp;

        if (totalScanTime > timeout) {
          onScanTimeout?.();
        } else {
          onNextPoll?.(pollResult);
          setTimeout(pollStatus, pollInterval * 1000);
        }
      } else {
        onScanComplete?.(pollResult);
      }
    } catch (error) {
      console.log(error);
      onScanFail?.(error);
    }
  };

  // Start polling
  pollStatus();
};

const parseCliOptions = (userCliOptions: TScanUserCliOptions) => {
  // Version provided to the API corresponds with the version in package.json
  // of the cli client
  const apiOptions: TScanApiOptions = { version: '1.0.5' };
  const cliOptions: TScanCliOptions = { pollInterval: 5, timeout: 300 };

  if (userCliOptions.pullRequestTitle) {
    apiOptions.pull_request_metadata = {
      ...(apiOptions.pull_request_metadata ?? {}),
      title: userCliOptions.pullRequestTitle,
    };
  }
  if (userCliOptions.pullRequestUrl) {
    apiOptions.pull_request_metadata = {
      ...(apiOptions.pull_request_metadata ?? {}),
      url: userCliOptions.pullRequestUrl,
    };
  }
  if (userCliOptions.selfManagedScanners) {
    apiOptions.self_managed_scanners = userCliOptions.selfManagedScanners;
  }
  if (userCliOptions.failOnDependencyScan != undefined) {
    apiOptions.fail_on_dependency_scan = userCliOptions.failOnDependencyScan;
  }
  if (userCliOptions.failOnSastScan != undefined) {
    apiOptions.fail_on_sast_scan = userCliOptions.failOnSastScan;
  }
  if (userCliOptions.failOnIacScan != undefined) {
    apiOptions.fail_on_iac_scan = userCliOptions.failOnIacScan;
  }
  if (userCliOptions.minimumSeverityLevel) {
    apiOptions.minimum_severity = userCliOptions.minimumSeverityLevel;
  }
  if (
    userCliOptions.pollInterval &&
    (isNaN(userCliOptions.pollInterval) || userCliOptions.pollInterval <= 0)
  ) {
    outputError('Please provide a valid poll interval');
  } else if (userCliOptions.pollInterval) {
    cliOptions.pollInterval = userCliOptions.pollInterval;
  }
  if (
    userCliOptions.timeout &&
    (isNaN(userCliOptions.timeout) || userCliOptions.timeout <= 0)
  ) {
    outputError('Please provide a valid timeout');
  } else if (userCliOptions.timeout) {
    cliOptions.timeout = userCliOptions.timeout;
  }

  return { apiOptions, cliOptions };
};

const validateCommitId = (value: string) => {
  const testCommitId = (commitId: string): boolean =>
    commitId.length === 40 && /^[0-9a-f]{40}$/.test(commitId);

  if (testCommitId(value) === false) {
    throw new InvalidArgumentError('Please provide a valid commit ID');
  }

  return value;
};

export const cliSetup = (program: Command) =>
  program
    .command('scan')
    .addArgument(
      new Argument(
        '<repository_id>',
        'The internal GitHub/Gitlab/Bitbucket/.. repository id you want to scan.'
      ).argRequired()
    )
    .addArgument(
      new Argument(
        '<base_commit_id>',
        'The base commit of the code you want to scan (e.g. the commit where you branched from for your PR or the initial commit of your repo)'
      )
        .argRequired()
        .argParser(validateCommitId)
    )
    .addArgument(
      new Argument(
        '<head_commit_id>',
        'The latest commit you want to include in your scan (e.g. the latest commit id of your pull request)'
      )
        .argRequired()
        .argParser(validateCommitId)
    )
    .addArgument(
      new Argument('<branch_name>', 'The branch name')
        .argOptional()
        .default('main')
    )
    .option('--pull-request-title <title>', 'Your pull request title')
    .option('--pull-request-url <url>', 'Your pull request URL')
    .addOption(
      new Option(
        '--self-managed-scanners <scanners...>',
        'Set the minimum severity level. Accepted options are: LOW, MEDIUM, HIGH and CRITICAL.'
      ).choices(['checkov', 'json-sbom'])
    )
    .option(
      '--expected-amount-json-sboms <amount>',
      'The expected amount of json sbombs'
    )
    .addOption(
      new Option(
        '--no-fail-on-dependency-scan',
        "Don't fail when scanning depedencies..."
      )
    )
    .option(
      '--fail-on-sast-scan',
      'Let Aikido fail when new static code analysis issues have been detected...'
    )
    .option(
      '--fail-on-iac-scan',
      'Let Aikido fail when new infrastructure as code issues have been detected...'
    )
    .addOption(
      new Option(
        '--minimum-severity-level <level>',
        'Set the minimum severity level. Accepted options are: LOW, MEDIUM, HIGH and CRITICAL.'
      ).choices(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    )
    .addOption(
      new Option(
        '--poll-interval [interval]',
        'The poll interval when checking for an updated scan result'
      )
        .preset(5)
        .argParser(parseFloat)
    )
    .addOption(
      new Option(
        '--timeout [interval]',
        'Define the timeout after which the client should stop polling if no result was returned.'
      )
        .preset(300)
        .argParser(parseFloat)
    )
    .description('Run a scan of an Aikido repo.')
    .action(cli);

export default { cli, cliSetup, scan };
