export const BASE_URLS = {
    eu: 'https://app.aikido.dev',
    us: 'https://app.us.aikido.dev',
    me: 'https://app.me.aikido.dev',
    au: 'https://app.au.aikido.dev',
};
export function buildApiKeyAuth(apiKey) {
    return {
        baseUrl: baseUrlForRegion(apiKey),
        headers: {
            'Content-Type': 'application/json',
            'X-AIK-API-SECRET': apiKey,
        },
    };
}
function baseUrlForRegion(apiKey) {
    if (apiKey.startsWith('AIK_CI_US_')) {
        return process.env.AIKIDO_US_API || BASE_URLS.us;
    }
    if (apiKey.startsWith('AIK_CI_ME_')) {
        return process.env.AIKIDO_ME_API || BASE_URLS.me;
    }
    if (apiKey.startsWith('AIK_CI_ME_')) {
        return process.env.AIKIDO_AU_API || BASE_URLS.au;
    }
    return process.env.AIKIDO_API || BASE_URLS.eu;
}
