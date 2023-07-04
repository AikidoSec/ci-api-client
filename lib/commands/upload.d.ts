import { Command } from 'commander';
import { TUploadApiOptions, TUploadPayloadType, TUploadResult } from '../aikidoApi.js';
type TUploadArguments = {
    data: TUploadApiOptions;
    onUploadComplete?: (startResult: TUploadResult) => void | null;
    onUploadFail?: (error: any) => void | null;
};
type TUploadUserCliOptions = {
    scanId?: string | number;
    repositoryId: string | number;
    containerImage?: string;
    type: TUploadPayloadType;
    file?: string;
    payload?: string;
};
declare function cli(options: TUploadUserCliOptions, command: string): Promise<void>;
export declare const upload: ({ data, onUploadComplete, onUploadFail, }: TUploadArguments) => Promise<void>;
export declare const cliSetup: (program: Command) => Command;
declare const _default: {
    cli: typeof cli;
    cliSetup: (program: Command) => Command;
};
export default _default;
