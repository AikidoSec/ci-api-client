# Security Policy

`@aikidosec/ci-api-client` is the command line client that integrates the Aikido public CI API into custom CI pipelines. It handles Aikido API keys and runs inside build environments, so we take its security seriously.

## Supported versions

Only the latest published release of `@aikidosec/ci-api-client` on [npm](https://www.npmjs.com/package/@aikidosec/ci-api-client) receives security fixes. Please upgrade before reporting an issue, to confirm it still reproduces.

| Version | Supported |
| ------- | --------- |
| Latest release | ✅ |
| Older releases | ❌ |

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues, pull requests or discussions.**

Report them privately using one of these channels:

- **GitHub private vulnerability reporting:** use the ["Report a vulnerability"](https://github.com/AikidoSec/ci-api-client/security/advisories/new) button on the Security tab of this repository.
- **Email:** [security@aikido.dev](mailto:security@aikido.dev)

Please include as much of the following as you can:

- The affected version (`aikido-api-client --version` or the version in `package.json`) and your Node.js version and operating system.
- A description of the issue and its potential impact.
- Steps to reproduce, or a proof of concept.
- Any suggested fix or mitigation.

Do not include real Aikido API keys, tokens or customer data in your report. Redact them or use test values.

## What to expect

- We aim to acknowledge your report within **3 business days**.
- We will investigate, keep you informed of progress, and tell you whether we consider the report a valid vulnerability.
- Confirmed vulnerabilities are fixed in a new release, and where appropriate published as a [GitHub security advisory](https://github.com/AikidoSec/ci-api-client/security/advisories) with a CVE.
- We are happy to credit reporters in the advisory unless you prefer to stay anonymous.

We ask that you give us a reasonable amount of time to release a fix before any public disclosure, and that you make a good-faith effort to avoid privacy violations, data destruction and disruption of services while researching.

## Scope

In scope:

- Vulnerabilities in the code of this repository, for example insecure handling or leaking of API keys, path traversal in file handling (such as the `--file-paths` option of `upload-coverage`), command or request injection, or insecure network communication.
- Vulnerabilities in the way this package is built and published to npm.

Out of scope:

- Vulnerabilities in the Aikido platform, web app or API itself. Report those to [security@aikido.dev](mailto:security@aikido.dev) and mention that they are not related to this client.
- Vulnerabilities in third-party dependencies that do not affect this package. Please report those to the maintainers of the dependency. If a dependency vulnerability is exploitable through this client, we do want to hear about it.
- Issues that require an attacker to already have control over the machine, CI environment or API key of the user running the client.
- Findings from automated scanners without a demonstrated impact.

## Handling your API key

Some guidance for users of this client:

- The `aikido-api-client apikey` command stores your key in plain text in `~/.config/configstore/aikido-api-client.json`. On shared or ephemeral CI runners, prefer passing `--apikey` from your CI system's secret store instead.
- Never commit API keys to source control or print them in build logs. If you suspect a key has been exposed, revoke it on the [Continuous Integrations page](https://app.aikido.dev/settings/integrations/continuous-integration) in Aikido and create a new one.
