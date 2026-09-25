export declare function loadSourceLineFixes(repositoryRoot: string, sourcePath: string): Promise<{
    eof: number;
} | null>;
type TCoverageRecord = {
    lines: Map<number, unknown>;
    functions: Map<string, {
        line: number;
    }>;
    branches: Map<string, unknown>;
};
export declare function applySourceLineFixes(record: TCoverageRecord, lineFixes: {
    eof: number;
} | null): TCoverageRecord;
export {};
