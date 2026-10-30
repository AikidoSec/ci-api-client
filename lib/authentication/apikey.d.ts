type ApiKeyAuth = {
    baseUrl: string;
    headers: Record<string, string>;
};
export declare const BASE_URLS: Record<string, string>;
export declare function buildApiKeyAuth(apiKey: string): ApiKeyAuth;
export {};
