import axios from 'axios';
import { getGithubOidcData, isGithubOidcProvider } from './githubOidc.js';
import { program } from '../index.js';
const REFRESH_BEFORE_EXPIRING_TIME = 60000;
let cache = null;
const OIDC_BASE_URLS = {
    eu: 'https://bg.aikido.dev',
    us: 'https://bg.us.aikido.dev',
    me: 'https://bg.me.aikido.dev',
    au: 'https://bg.au.aikido.dev',
    'us-gov': 'https://bg.aikidogov.us',
};
export async function buildOidcAuth() {
    const baseUrl = baseUrlForRegion();
    const token = await fetchOidcToken(baseUrl);
    return {
        baseUrl,
        headers: {
            'Content-Type': 'application/json',
            'X-AIK-OIDC-SECRET': token,
        },
        withOidc: true,
    };
}
function baseUrlForRegion() {
    const fromOption = program.getOptionValue('region');
    let region = process.env.AIKIDO_REGION?.toLowerCase().trim() ?? 'eu';
    if (fromOption) {
        region = String(fromOption).toLowerCase().trim();
    }
    if (process.env.DEVELOPMENT === 'true' || process.env.DEVELOPMENT === '1') {
        return process.env.AIKIDO_API || 'https://app.test.aikido.dev';
    }
    const baseUrl = OIDC_BASE_URLS[region];
    if (!baseUrl) {
        throw new Error(`Unknown region "${region}". Supported OIDC regions: ${Object.keys(OIDC_BASE_URLS).join(', ')}`);
    }
    if (region === 'us') {
        return process.env.AIKIDO_US_API || baseUrl;
    }
    if (region === 'au') {
        return process.env.AIKIDO_AU_API || baseUrl;
    }
    if (region === 'eu') {
        return process.env.AIKIDO_API || baseUrl;
    }
    if (region === 'us-gov') {
        return process.env.AIKIDO_US_GOV_API || baseUrl;
    }
    return baseUrl;
}
async function fetchOidcToken(audience) {
    if (cache && cache.audience === audience && Date.now() < cache.expiresAtMs - REFRESH_BEFORE_EXPIRING_TIME) {
        return cache.token;
    }
    const oidcData = getOidcData(audience);
    if (!oidcData) {
        throw new Error('OIDC is not available.\n\n');
    }
    const response = await axios.get(oidcData.requestUrl, {
        headers: { Authorization: `Bearer ${oidcData.requestToken}` },
        maxRedirects: 0,
        timeout: 15000,
    });
    const token = response.data?.value;
    if (!token || typeof token !== 'string') {
        throw new Error('OIDC response did not include an ID token');
    }
    const expiresAtMs = jwtExpiresAtMs(token);
    cache = expiresAtMs ? { token, audience, expiresAtMs } : null;
    return token;
}
function getOidcData(audience) {
    if (isGithubOidcProvider()) {
        return getGithubOidcData(audience);
    }
    return null;
}
function jwtExpiresAtMs(token) {
    try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
        return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
    }
    catch {
        return null;
    }
}
