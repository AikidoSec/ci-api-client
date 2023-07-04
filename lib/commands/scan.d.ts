import { Command } from 'commander';
export type TScanApiOptions = {
    repo_id?: string | number;
    base_commit_id?: string;
    head_commit_id?: string;
    branch_name?: string;
    pull_request_metadata?: {
        title?: string;
        url?: string;
    };
    self_managed_scanners?: string[];
    fail_on_dependency_scan?: boolean;
    fail_on_sast_scan?: boolean;
    fail_on_iac_scan?: boolean;
    minimum_severity_level?: string;
};
type TScanArguments = {
    repoId: string | number;
    baseCommitId: string;
    headCommitId: string;
    branchName: string;
    options: TScanApiOptions;
    pollInterval: number;
    onStart?: () => void | null;
    onStartComplete?: (startResult: any) => void | null;
    onStartFail?: (error: any) => void | null;
    onScanStart?: (startResult: any) => void | null;
    onScanComplete?: (startResult: any) => void | null;
    onScanFail?: (error: any) => void | null;
};
type TScanUserCliOptions = {
    pullRequestTitle?: string;
    pullRequestUrl?: string;
    selfManagedScanners?: string[];
    failOnDependencyScan?: boolean;
    failOnSastScan?: boolean;
    failOnIacScan?: boolean;
    minimumSeverityLevel?: string;
    pollInterval?: number;
};
declare function cli(repoId: string, baseCommitId: string, headCommitId: string, branchName: string, options: TScanUserCliOptions, command: string): Promise<void>;
export declare const scan: ({ repoId, baseCommitId, headCommitId, branchName, options, pollInterval, onStart, onStartComplete, onStartFail, onScanStart, onScanComplete, onScanFail, }: TScanArguments) => Promise<void>;
export declare const cliSetup: (program: Command) => Command;
declare const _default: {
    cli: typeof cli;
    cliSetup: (program: Command) => Command;
    scan: ({ repoId, baseCommitId, headCommitId, branchName, options, pollInterval, onStart, onStartComplete, onStartFail, onScanStart, onScanComplete, onScanFail, }: TScanArguments) => Promise<void>;
};
export default _default;
