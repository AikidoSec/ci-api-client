import { getApiKey, getUseOidc } from '../configuration.js';
import { outputError, outputLog } from '../output.js';
import { buildApiKeyAuth } from './apikey.js';
import { buildOidcAuth } from './oidc.js';
import { Auth } from './types.js';

export async function resolveAuth(): Promise<Auth> {
  const staticApiKey = getApiKey();
  const useOidc = getUseOidc();

  if (!staticApiKey && !useOidc) {
    outputError(
      'No authentication available. Set an API key with `aikido-api-client apikey <key>` ' +
        '(or `--apikey`), or run in GitHub Actions with `permissions: id-token: write`.'
    );
    process.exit(1);
  }

  if (useOidc) {
    // If an API key is provided, ignore it and log a warning
    if (staticApiKey) {
      outputLog(
        'API key and OIDC cannot be used together. Please remove the API key option. The key will be ignored using OIDC.'
      );
    }

    try {
      const auth = await buildOidcAuth();

      return auth;
    } catch (error) {
      outputError(
        `OIDC unavailable (${
          error instanceof Error ? error.message : String(error)
        }).`
      );
      process.exit(1);
    }
  }

  if (staticApiKey) {
    const auth = buildApiKeyAuth(staticApiKey);
    return auth;
  }

  outputError(
    'No authentication available. Set an API key with `aikido-api-client apikey <key>` ' +
      '(or `--apikey`), or run in GitHub Actions with `permissions: id-token: write`.'
  );
  process.exit(1);
}
