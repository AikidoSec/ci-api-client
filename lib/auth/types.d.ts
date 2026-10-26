export type Auth = {
    baseUrl: string;
    headers: Record<string, string>;
    withOidc: boolean;
};
export type OidcData = {
    requestUrl: string;
    requestToken: string;
};
