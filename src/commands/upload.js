import { Argument, Option } from 'commander';
import { getApiKey } from '../configuration.js';
import { outputError, outputHttpError, startSpinner } from '../output.js';
import { pollScanStatus, startScan } from '../aikidoApi.js';
import { program } from '../index.js';

async function cli(
  payloadType,
  baseCommitId,
  headCommitId,
  branchName,
  options,
  command
) {
  const apiKey = getApiKey();

  if (!apiKey) {
    outputError('Please set an api key using: aikido-cli apikey <key>');
  }

  // Process command optiosn and group them into apiOptions hash
  const { apiOptions, cliOptions } = parseCliOptions(options);
}

export const upload = async ({
  repoId,
  baseCommitId,
  headCommitId,
  branchName,
  options = {},
  pollInterval = 5,
  onStart = startResult => null,
  onStartComplete = startResult => null,
  onStartFail = startResult => null,
  onScanStart = startResult => null,
  onScanComplete = pollResult => null,
  onScanFail = error => null,
}) => {
  //   onStart();
  //   let result = null;
  //   // Initialize a scan and call onStartComplete, onStartFail
  //   // handlers where needed
  //   try {
  //     result = await startScan({
  //       repo_id: repoId,
  //       base_commit_id: baseCommitId,
  //       head_commit_id: headCommitId,
  //       branch_name: branchName,
  //       ...options,
  //     });
  //     if (result.scan_id) {
  //       onStartComplete(result);
  //     } else {
  //       onStartFail(result);
  //       return;
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     onStartFail(error);
  //     return;
  //   }
  //   onScanStart(result);
  //   let pollResult;
  //   // Poll status with a setTimeout
  //   const pollStatus = async () => {
  //     try {
  //       pollResult = await pollScanStatus(result.scan_id);
  //       // If "all_scans_completed" returns true, call the onScanComplete
  //       // handler, if not, re poll with `pollInterval`
  //       // Note that onScanComplete can return a successfull or
  //       // unsuccessfull scan result
  //       if (pollResult.all_scans_completed === false) {
  //         setTimeout(pollStatus, pollInterval * 1000);
  //       } else {
  //         onScanComplete(pollResult);
  //       }
  //     } catch (error) {
  //       console.log('error);', error);
  //       onScanFail(error);
  //     }
  //   };
  //   // Start polling
  //   pollStatus();
};

const parseCliOptions = userCliOptions => {
  const apiOptions = {};

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
    apiOptions.minimum_severity_level = userCliOptions.minimumSeverityLevel;
  }

  return { apiOptions, cliOptions };
};

export const cliSetup = program =>
  program
    .command('upload')
    .addArgument(
      new Argument('<payload_type>', 'The payload type you want to upload')
        .choices(['checkov', 'json-sbomb'])
        .argRequired()
    )
    // .addOption(
    //   new Option(
    //     '--self-managed-scanners <scanners...>',
    //     'Set the minimum severity level. Accepted options are: LOW, MEDIUM, HIGH and CRITICAL.'
    //   )
    // )
    // .option(
    //   '--expected-amount-json-sbombs <amount>',
    //   'The expected amount of json sbombs'
    // )
    // .addOption(
    //   new Option(
    //     '--no-fail-on-dependency-scan',
    //     "Don't fail when scanning depedencies..."
    //   )
    // )
    // .option(
    //   '--fail-on-sast-scan',
    //   'Let Aikido fail when new static code analysis issues have been detected...'
    // )
    // .option(
    //   '--fail-on-iac-scan',
    //   'Let Aikido fail when new infrastructure as code issues have been detected...'
    // )
    // .addOption(
    //   new Option(
    //     '--minimum-severity-level <level>',
    //     'Set the minimum severity level. Accepted options are: LOW, MEDIUM, HIGH and CRITICAL.'
    //   ).choices(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    // )
    // .addOption(
    //   new Option(
    //     '--poll-interval [interval]',
    //     'The poll interval when checking for an updated scan result'
    //   )
    //     .preset(5)
    //     .argParser(parseFloat)
    // )
    .description('Upload a custom scan result to Aikido.')
    .action(cli);

export default { cli, cliSetup, upload };
