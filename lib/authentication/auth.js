import { getApiKey } from '../configuration.js';
import { outputDebug, outputError } from '../output.js';
import { buildApiKeyAuth } from './apikey.js';
import { buildOidcAuth } from './oidc.js';
export async function resolveAuth() {
    const staticApiKey = getApiKey();
    if (staticApiKey) {
        const auth = buildApiKeyAuth(staticApiKey);
        outputDebug(`Auth mode: apikey (explicit), baseUrl=${auth.baseUrl}`);
        return auth;
    }
    try {
        const auth = await buildOidcAuth();
        outputDebug(`Auth mode: OIDC, baseUrl=${auth.baseUrl}`);
        return auth;
    }
    catch (error) {
        outputError(`${error instanceof Error ? error.message : 'OIDC auth failed'}\n\n`);
    }
    outputError('No authentication available. Set an API key with `aikido-api-client apikey <key>` ' +
        '(or `--apikey`), or run in GitHub Actions with `permissions: id-token: write`.');
    process.exit(1);
}
