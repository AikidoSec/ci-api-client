import { Argument, Command } from 'commander';
import { setApiKey } from '../configuration.js';
import { outputError, outputLog } from '../output.js';

const API_KEY_REGEX = /^AIK_CI_[a-zA-Z0-9]{64}$/g;

function cli(apiKey: string): void {
  const isValidApiKey =
    API_KEY_REGEX.test(apiKey) || apiKey.trim().length === 128;
  if (apiKey && !isValidApiKey) {
    outputError('That does not seem right, please verify your api key');
  }

  setApiKey(apiKey);
  outputLog(
    apiKey
      ? 'Your new Aikido API key has been set'
      : 'Your Aikido API key has been removed'
  );
}

export const cliSetup = (program: Command): Command =>
  program
    .command('apikey')
    .addArgument(
      new Argument(
        '<key>',
        'Your Aikido public CI API key. See also: https://app.aikido.dev/settings/integrations/continuous-integration. To remove your apikey, leave the <key> argument value empty.'
      ).argOptional()
    )
    .description('Set (or remove) your Aikido public CI API key.')
    .action(cli);

export default { cli, cliSetup };
