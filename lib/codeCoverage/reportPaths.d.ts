export type TCoverageFormat = 'lcov' | 'cobertura';
export declare function detectFormatFromFilename(filename: string): TCoverageFormat;
export declare function extractCoveredSourcePaths(content: string, format: TCoverageFormat, repositoryRoot: string): string[];
