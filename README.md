# Aikido Security CI client

<!-- [![NPM Version](http://img.shields.io/npm/v/aikido-api-client.svg?style=flat)](https://www.npmjs.org/package/aikido-api-client)
[![NPM Downloads](https://img.shields.io/npm/dm/aikido-api-client.svg?style=flat)](https://npmcharts.com/compare/aikido-api-client?minimal=true)
[![Install Size](https://packagephobia.now.sh/badge?p=aikido-api-client)](https://packagephobia.now.sh/result?p=aikido-api-client) -->

This CLI tool can help integrate Aikido Security scans into any custom CI pipeline such as Jenkins, CircleCI,... 
If you are looking to add checks to a Github, Azure Repos,.. pull request, you do not need this package and you can use our native plugins.

## Installation and setup

The quickest way to get started is to install the cli tool as a global package.

```sh
# npm users
$ npm install -g @aikidosec/ci-api-client

# yarn users
$ yarn global add @aikidosec/ci-api-client
```

After installation, you'll need to setup your Aikido API key. You can add your key by requesting a token on the [Continuous Integrations page](https://app.aikido.dev/settings/integrations/continuous-integration) in the [Integrations](https://app.aikido.dev/settings/integrations) section of the Aikido web platform. Click the "Start integrating" link and setup your key globally by executing

```sh
$ aikido-api-client apikey <your-api-key-here>
```

⚠️ Your Aikido API key is stored in `~/.config/configstore/aikido-api-client.json`. If you don't want this behaviour (e.g. for security related issues), you can also provide your API key to `aikido-api-client` by adding `--apikey <your-api-key-here>` to every command. However, for the examples below, we'll assume you've used `aikido-api-client apikey <your-api-key-here>` to save your API key. If `--apikey` is provided while a key is set in the configuration file on disk, the key that was provided with `--apikey` will be used.

## Use case: release gating

The example below shows how to use the `scan-release` command. The use case here is to block a new build or a new release as long as issues are still open.

```sh
$ aikido-api-client scan-release <repository_id or repository_name> <commit_id>
```
```
Usage: Aikido API Client scan-release [options] <repository_id> <commit_id>
Run a release scan of an Aikido repo.
Arguments:
  repository_id                     The internal GitHub/Gitlab/Bitbucket/.. repository id you want to scan.
  commit_id                         The commit you want to scan
Options:
  --no-fail-on-dependency-scan      Don't fail when scanning depedencies. Default is to fail on new CVE
  --fail-on-sast-scan               Let Aikido fail when new static code analysis issues have been detected
  --fail-on-iac-scan                Let Aikido fail when new infrastructure as code issues have been detected
  --fail-on-secrets-scan            Let Aikido fail when new exposed secrets have been detected
  --minimum-severity-level <level>  Set the minimum severity level. Accepted options are: LOW, MEDIUM, HIGH and CRITICAL. (choices: "LOW", "MEDIUM",
                                    "HIGH", "CRITICAL")
  --poll-interval [interval]        The poll interval when checking for an updated scan result (preset: 10)
  --sla-mode                        Let Aikido only fail only on open issues that have gone out of SLA.
  --json                            Output the scan result as JSON (gate_passed and issue_breakdown)
  -h, --help                        display help for command
```

## Use case: code coverage

The example below shows how to use the `upload-coverage` command. The use case here is to upload LCOV or Cobertura coverage reports from your CI pipeline so Aikido can track coverage per commit and branch.

```sh
$ aikido-api-client upload-coverage \
    --repo-name <owner/repo> \
    --commit-sha <commit_sha> \
    --branch-name <branch_name> \
    --repository-id <repository_id> \
    --file-paths coverage/lcov.info
```
```
Usage: Aikido API Client upload-coverage [options]
Upload LCOV or Cobertura coverage reports to Aikido (with repository_source_paths and EOF metadata).
Options:
  -r, --repo-name <reponame>           Repository name as owner/repo (e.g. org/my-repo)
  -c, --commit-sha <commitsha>         The commit SHA for this CI run
  -b, --branch-name <branchname>       The branch name for this CI run
  -f, --file-paths <paths...>          Path(s) to LCOV or Cobertura coverage report(s). Format is detected from each filename.
  -ri, --repository-id <repositoryid>  The scm repository id
  -h, --help                           display help for command
```

## How it works

The CLI will spawn a cloud-based scan and then report scan progress. It will exit with exitCode `0` if the scan was successfull (`gate_passed: true`). The process will exit with exitCode `10` if the scan was unsuccesfull (`gate_passed: false`). If anything else goes wrong (e.g. API unavailable, scanning unavailable, other unexpected issue) the process will exit with exitCode `1`.

If you want the scan to run quietly (without output), you can add the `--quiet` option to the command. If you want machine-readable output instead, add `--json` to `scan-release`. That prints a JSON object with `gate_passed` and `issue_breakdown` and skips spinners and other extra info.

Please note that the repository_id which you need to provide to the CLI is the unique ID of the Git provider you are using, not the ID of the repository in Aikido. You can also find this ID in Aikido, by going to the repository's detail page and clicking on the Git provider's icon in the header. Alternatively, you can pass the repository name as it is defined in Aikido.

```sh
# For more options and combinations, check the help output
$ aikido-api-client help scan
$ aikido-api-client help scan-release
```

Uploading custom test results (supported by the `scan` command only):

```sh
$ aikido-api-client upload --repository-id <repository_id> --type checkov --file <path_to_payload_file>

# For more options and combinations, check the help output
$ aikido-api-client help upload
```

For more information about these parameters, please refer to `aikido-api-client help`, `aikido-api-client help scan`, `aikido-api-client help scan-release` or `aikido-api-client help upload`, or [the public ci api page](https://aikido-dev.notion.site/aikido-dev/Aikido-CI-API-78d318b5f5f7477ab072e12f94b21374).

## Help & contributing

For more information about all available commands and options, execute:

```sh
$ aikido-api-client help
```

```sh
$ aikido-api-client help <command>
```

If you are missing functionality in this cli tool, please feel free to add it. If you've detected a bug, please submit a PR. Check out [CONTRIBUTING.md](CONTRIBUTING.md) for more information.


# Other resources

- [Aikido Official Website](https://aikido.dev)
- [Aikido Docs](https://help.aikido.dev/)
- [Aikido on Twitter](https://twitter.com/AikidoSecurity)


