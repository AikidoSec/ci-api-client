import { Command } from 'commander';
type TUploadCoverageUserCliOptions = {
    repoName: string;
    commitSha: string;
    branchName: string;
    filePaths: string[];
    repositoryId: string | number;
};
declare function cli(options: TUploadCoverageUserCliOptions): Promise<void>;
export declare const cliSetup: (program: Command) => Command;
declare const _default: {
    cli: typeof cli;
    cliSetup: (program: Command) => Command;
};
export default _default;
