export type TProjectFiles = {
    root: string;
    files: string[];
};
export declare function loadProjectFiles(): Promise<TProjectFiles | null>;
export declare function pathStem(sourcePath: string): string;
export declare function createPathResolver(projectFiles: string[]): (coveragePath: string) => string | null;
