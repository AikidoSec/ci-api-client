# Aikido Security CI API client

<!-- [![NPM Version](http://img.shields.io/npm/v/aikido-api-client.svg?style=flat)](https://www.npmjs.org/package/aikido-api-client)
[![NPM Downloads](https://img.shields.io/npm/dm/aikido-api-client.svg?style=flat)](https://npmcharts.com/compare/aikido-api-client?minimal=true)
[![Install Size](https://packagephobia.now.sh/badge?p=aikido-api-client)](https://packagephobia.now.sh/result?p=aikido-api-client) -->

CLI helper for the public [Aikido CI API](https://aikido-dev.notion.site/aikido-dev/Aikido-CI-API-78d318b5f5f7477ab072e12f94b21374). This cli tool can help integrate Aikido into a custom CI pipeline without having to implement the Aikido CI API yourself.

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

## Usage

Using the `aikido-api-client` to start new scans is very straightforward.

```sh
$ aikido-api-client scan <repository_id> <base_commit_id> <head_commit_id>
```

The process will report scan progress and will exit with exitCode `0` if the scan was successfull (`gate_passed: true`). The process will exit with exitCode `10` if the scan was unsuccesfull (`gate_passed: false`). If anything else goes wrong (e.g. API unavailable, scanning unavailable, other unexpected issue) the process will exit with exitCode `1`.

If you want the scan to run quietly (without output), you can add the `--quiet` option to the command.

Please note that the repository_id which you need to provide to the CLI is the unique ID of the Git provider you are using, not the ID of the repository in Aikido. You can also find this ID in Aikido, by going to the repository's detail page and clicking on the Git provider's icon in the header.

```sh
# For more options and combinations, check the help output
$ aikido-api-client help scan
```

Uploading custom test results:

```sh
$ aikido-api-client upload --repository-id <repository_id> --type checkov --file <path_to_payload_file>

# For more options and combinations, check the help output
$ aikido-api-client help upload
```

For more information about these parameters, please refer to `aikido-api-client help`, `aikido-api-client help scan` or `aikido-api-client help upload`, or [the public ci api page](https://aikido-dev.notion.site/aikido-dev/Aikido-CI-API-78d318b5f5f7477ab072e12f94b21374).

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
- [Aikido Github Actions Workflow](https://github.com/AikidoSec/github-actions-workflow)
- [Aikido on Twitter](https://twitter.com/AikidoSecurity)


