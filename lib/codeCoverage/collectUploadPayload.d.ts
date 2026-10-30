import { TCoverageFormat } from './reportPaths.js';
export type TCoverageFilePayload = {
    filename: string;
    format: TCoverageFormat;
    content: string;
};
export type TCollectUploadPayloadResult = {
    repository_source_paths: string[];
    eof: Record<string, number>;
    files: TCoverageFilePayload[];
};
export declare function collectUploadPayload(filePaths: string[]): Promise<TCollectUploadPayloadResult>;
