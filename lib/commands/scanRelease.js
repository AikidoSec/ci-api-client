import chalk from 'chalk';
import { Argument, InvalidArgumentError, Option } from 'commander';
import { pollScanStatus, startScan, } from '../aikidoApi.js';
import { getApiKey } from '../configuration.js';
import { outputError, outputHttpError, outputLog, startSpinner, } from '../output.js';
async function cli(repoId, commitId, options, command) {
    const apiKey = getApiKey();
    if (!apiKey) {
        outputError('Please set an api key using: aikido-cli apikey <key>');
    }
    const { apiOptions, cliOptions } = parseCliOptions(options);
    let loader;
    let pollCount = 1;
    const onStart = () => {
        loader = startSpinner('Starting Aikido Security release scan');
    };
    const onStartComplete = (startResult) => {
        loader?.succeed(`Aikido Security scan started (id: ${startResult.scan_id})`);
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
    const onScanComplete = (pollResult) => {
        if (pollResult.gate_passed === true) {
            loader?.succeed('Scan completed, no open issues found');
            if (pollResult.diff_url) {
                outputLog(chalk.gray(`* Diff url: ${pollResult.diff_url}`));
            }
        }
        else {
            loader?.fail('Scan completed with issues');
            if (pollResult.new_issues_found) {
                outputLog(chalk.gray(chalk.bold('Open issues found: ') + pollResult.new_issues_found));
            }
            if (pollResult.issue_links) {
                outputLog(chalk.gray(pollResult.issue_links
                    .map((issueLink) => '- ' + issueLink)
                    .join('\n')));
            }
            if (pollResult.diff_url) {
                outputLog(chalk.gray(`* Diff url: ${pollResult.diff_url}`));
            }
            process.exit(10);
        }
    };
    const onFail = (error) => {
        loader?.fail();
        if (error.response?.status && error.response?.status === 404) {
            if (error.response?.data?.reason_phrase) {
                outputError(error.response?.data?.reason_phrase);
            }
            else {
                outputError('Please verify your repository id or commit SHA');
            }
        }
        else {
            outputHttpError(error);
        }
        process.exit(1);
    };
    await scan({
        repoId,
        commitId,
        options: apiOptions,
        pollInterval: cliOptions.pollInterval,
        onStart,
        onStartComplete,
        onStartFail: onFail,
        onNextPoll,
        onScanStart,
        onScanComplete,
        onScanFail: onFail,
    });
}
export const scan = async ({ repoId, commitId, options, pollInterval = 10, onStart, onStartComplete, onStartFail, onScanStart, onNextPoll, onScanComplete, onScanFail, }) => {
    onStart?.();
    let result = null;
    try {
        result = await startScan({
            is_release_gating: true,
            head_commit_id: commitId,
            repository_id: repoId,
            ...options,
        });
        if (result.scan_id) {
            onStartComplete?.(result);
        }
        else {
            onStartFail?.(result);
            return;
        }
    }
    catch (error) {
        onStartFail?.(error);
        return;
    }
    onScanStart?.(result);
    let pollResult;
    const pollStatus = async () => {
        try {
            pollResult = await pollScanStatus(result.scan_id);
            if (pollResult.all_scans_completed === false) {
                onNextPoll?.(pollResult);
                setTimeout(pollStatus, pollInterval * 1000);
            }
            else {
                onScanComplete?.(pollResult);
            }
        }
        catch (error) {
            onScanFail?.(error);
        }
    };
    pollStatus();
};
const parseCliOptions = (userCliOptions) => {
    const apiOptions = { version: '1.0.9' };
    const cliOptions = { pollInterval: 10 };
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
    if (userCliOptions.failOnSecretsScan != undefined) {
        apiOptions.fail_on_secrets_scan = userCliOptions.failOnSecretsScan;
    }
    if (userCliOptions.minimumSeverityLevel) {
        apiOptions.minimum_severity = userCliOptions.minimumSeverityLevel;
    }
    if (userCliOptions.baseBranch) {
        apiOptions.base_branch = userCliOptions.baseBranch;
    }
    if (userCliOptions.pollInterval &&
        (isNaN(userCliOptions.pollInterval) || userCliOptions.pollInterval <= 0)) {
        outputError('Please provide a valid poll interval');
    }
    else if (userCliOptions.pollInterval) {
        cliOptions.pollInterval = userCliOptions.pollInterval;
    }
    return { apiOptions, cliOptions };
};
const validateCommitId = (value) => {
    const testCommitId = (commitId) => commitId.length === 40 && /^[0-9a-f]{40}$/.test(commitId);
    if (testCommitId(value) === false) {
        throw new InvalidArgumentError('Please provide a valid commit ID');
    }
    return value;
};
export const cliSetup = (program) => program
    .command('scan-release')
    .addArgument(new Argument('<repository_id>', 'The internal GitHub/Gitlab/Bitbucket/.. repository id you want to scan.').argRequired())
    .addArgument(new Argument('<commit_id>', 'The commit you want to scan')
    .argRequired()
    .argParser(validateCommitId))
    .addOption(new Option('--no-fail-on-dependency-scan', "Don't fail when scanning depedencies..."))
    .option('--fail-on-sast-scan', 'Let Aikido fail when new static code analysis issues have been detected...')
    .option('--fail-on-iac-scan', 'Let Aikido fail when new infrastructure as code issues have been detected...')
    .option('--fail-on-secrets-scan', 'Let Aikido fail when new exposed secrets have been detected...')
    .addOption(new Option('--minimum-severity-level <level>', 'Set the minimum severity level. Accepted options are: LOW, MEDIUM, HIGH and CRITICAL.').choices(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']))
    .addOption(new Option('--poll-interval [interval]', 'The poll interval when checking for an updated scan result')
    .preset(10)
    .argParser(parseFloat))
    .addOption(new Option('--base-branch <branchname>', 'Base branch for the release gated scan.'))
    .description('Run a release scan of an Aikido repo.')
    .action(cli);
export default { cli, cliSetup, scan };
