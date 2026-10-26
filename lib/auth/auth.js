import { getApiKey } from '../configuration.js';
import { outputDebug, outputError } from '../output.js';
import { buildApiKeyAuth } from './apikey.js';
import { buildOidcAuth } from './oidc.js';
export async function resolveAuth() {
    try {
        const auth = await buildOidcAuth();
        outputDebug(`Auth mode: OIDC, baseUrl=${auth.baseUrl}`);
        return auth;
    }
    catch (error) {
        outputDebug(`OIDC unavailable (${error instanceof Error ? error.message : String(error)}); trying API key`);
    }
    const staticApiKey = getApiKey();
    if (staticApiKey) {
        const auth = buildApiKeyAuth(staticApiKey);
        outputDebug(`Auth mode: apikey, baseUrl=${auth.baseUrl}`);
        return auth;
    }
    outputError('No authentication available. Set an API key with `aikido-api-client apikey <key>` ' +
        '(or `--apikey`), or run in GitHub Actions with `permissions: id-token: write`.');
    process.exit(1);
}
