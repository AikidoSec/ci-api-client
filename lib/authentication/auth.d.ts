type ResolvedAuth = {
    baseUrl: string;
    headers: Record<string, string>;
};
export declare function resolveAuth(): Promise<ResolvedAuth>;
export {};
