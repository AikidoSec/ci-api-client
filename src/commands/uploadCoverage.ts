import { Command } from 'commander';
import { Ora } from 'ora';
import { uploadCodeCoverage } from '../aikidoApi.js';
import { collectUploadPayload } from '../codeCoverage/collectUploadPayload.js';
import { getApiKey } from '../configuration.js';
import {
  outputError,
  outputHttpError,
  outputLog,
  startSpinner,
} from '../output.js';
import { resolveInputFilePatterns } from '../codeCoverage/resolveInputFilePattern.js';

type TUploadCoverageUserCliOptions = {
  commitSha: string;
  branchName: string;
  filePaths: string[];
  repositoryId: string | number;
};

async function cli(options: TUploadCoverageUserCliOptions) {
  const apiKey = getApiKey();

  if (!apiKey) {
    outputError('Please set an api key using: aikido-api-client apikey <key>');
    return;
  }

  let filePaths: string[];
  try {
    filePaths = await resolveInputFilePatterns(normalizeFilePaths(options.filePaths));
  } catch (error) {
    outputError(error instanceof Error ? error.message : String(error));
    return;
  }

  if (filePaths.length === 0) {
    outputError(
      'No code coverage file(s) provided. Specify at least one path with --file-paths.'
    );
  }

  let loader: Ora | null = startSpinner(
    'Collecting coverage files and repository metadata'
  );

  let payload;
  try {
    payload = await collectUploadPayload(filePaths);
  } catch (error) {
    loader?.fail();
    outputError(error instanceof Error ? error.message : String(error));
    return;
  }

  loader?.succeed(
    `Found ${payload.files.length} coverage file(s) (source paths=${payload.repository_source_paths.length}, eof=${Object.keys(payload.eof).length})`
  );

  for (const file of payload.files) {
    outputLog(`  ${file.filename} (${file.format})`);
  }

  loader = startSpinner('Uploading code coverage to Aikido');

  try {
    await uploadCodeCoverage({
      repository_id: options.repositoryId,
      commit_sha: options.commitSha,
      branch_name: options.branchName,
      repository_source_paths: payload.repository_source_paths,
      eof: payload.eof,
      files: payload.files,
    });

    
    loader?.succeed('Code coverage upload completed');
    process.exit(0);
  } catch (error: any) {
    loader?.fail();

    if (error.response?.data?.reason_phrase) {
      outputError(error.response.data.reason_phrase);
    } else {
      outputHttpError(error);
    }

    process.exit(1);
  }
}

const normalizeFilePaths = (filePaths: string[]): string[] =>
  filePaths
    .flatMap((entry) => entry.split(/\n|\s+|,/))
    .map((filePath) => filePath.trim())
    .filter(Boolean);

export const cliSetup = (program: Command) =>
  program
    .command('upload-coverage')
    .requiredOption(
      '-c, --commit-sha <commitsha>',
      'The commit SHA for this CI run'
    )
    .requiredOption(
      '-b, --branch-name <branchname>',
      'The branch name for this CI run'
    )
    .requiredOption(
      '-f, --file-paths <paths...>',
      'Path(s) or glob pattern(s) to LCOV or Cobertura coverage report(s). Format is detected from each filename.'
    )
    .requiredOption(
      '-ri, --repository-id <repositoryid>',
      'The scm repository id'
    )
    .description(
      'Upload LCOV or Cobertura coverage reports to Aikido (with repository_source_paths and EOF metadata).'
    )
    .action(cli);

export default { cli, cliSetup };
