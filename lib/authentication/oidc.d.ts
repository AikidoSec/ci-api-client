type OidcAuth = {
    baseUrl: string;
    headers: Record<string, string>;
};
export declare function buildOidcAuth(): Promise<OidcAuth>;
export {};
