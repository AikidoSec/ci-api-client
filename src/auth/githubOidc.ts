import { outputDebug } from '../output.js';
import { OidcData } from './types.js';

export function getGithubOidcData( audience: string): OidcData | null {
  // These env vars are set by GitHub Actions when the `permissions: id-token: write` permission is granted.
  const requestUrl = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
  const requestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;

  if (!requestUrl || !requestToken) {
    return null;
  }

  const url = assertSafeGithubOidcRequestUrl(requestUrl);
  url.searchParams.set('audience', audience);
  
  outputDebug(
    `Requesting GitHub Actions OIDC token for audience: ${audience}`
  );

  return { requestUrl: url.toString(), requestToken };
}

function assertSafeGithubOidcRequestUrl(requestUrl: string): URL {
  let parsed: URL;

  try {
    parsed = new URL(requestUrl);
  } catch {
    throw new Error('Invalid GitHub Actions OIDC request URL');
  }

  if (parsed.protocol !== 'https:') {
    throw new Error('GitHub Actions OIDC request URL must use HTTPS');
  }

  const host = parsed.hostname.toLowerCase();
  const isGitHubHosted = host === 'vstoken.actions.githubusercontent.com' || host.endsWith('.actions.githubusercontent.com');

  let isEnterpriseHost = false;
  if (process.env.GITHUB_SERVER_URL) {
    try {
      const serverHost = new URL(
        process.env.GITHUB_SERVER_URL
      ).hostname.toLowerCase();
      isEnterpriseHost = host === serverHost || host.endsWith(`.${serverHost}`);
    } catch {
      // ignore invalid GITHUB_SERVER_URL
    }
  }

  if (!isGitHubHosted && !isEnterpriseHost) {
    throw new Error(
      `Refusing to request GitHub Actions OIDC token from unexpected host "${host}"`
    );
  }

  return parsed;
}

export function isGithubOidcProvider(): boolean {
  return Boolean(
    process.env.ACTIONS_ID_TOKEN_REQUEST_URL &&
      process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN
  );
}
