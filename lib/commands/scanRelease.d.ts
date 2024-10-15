import { Command } from 'commander';
import { TPollIsScanningResult, TPollScanCompletedDefaultBranchResult, TPollScanFeatureBranchCompletedResult, TScanApiOptions } from '../aikidoApi.js';
type TScanArguments = {
    repoId: string | number;
    commitId: string;
    options: TScanApiOptions;
    pollInterval: number;
    onStart?: () => void | null;
    onStartComplete?: (startResult: any) => void | null;
    onStartFail?: (error: any) => void | null;
    onScanStart?: (startResult: TPollIsScanningResult | TPollScanFeatureBranchCompletedResult | TPollScanCompletedDefaultBranchResult) => void | null;
    onNextPoll?: (pollResult: TPollIsScanningResult | TPollScanFeatureBranchCompletedResult | TPollScanCompletedDefaultBranchResult) => void | null;
    onScanComplete?: (pollResult: TPollIsScanningResult | TPollScanFeatureBranchCompletedResult | TPollScanCompletedDefaultBranchResult) => void | null;
    onScanFail?: (error: any) => void | null;
};
type TScanUserCliOptions = {
    pullRequestTitle?: string;
    pullRequestUrl?: string;
    selfManagedScanners?: string[];
    failOnDependencyScan?: boolean;
    failOnSastScan?: boolean;
    failOnSecretsScan?: boolean;
    failOnIacScan?: boolean;
    minimumSeverityLevel?: string;
    pollInterval?: number;
};
declare function cli(repoId: string, commitId: string, options: TScanUserCliOptions, command: string): Promise<void>;
export declare const scan: ({ repoId, commitId, options, pollInterval, onStart, onStartComplete, onStartFail, onScanStart, onNextPoll, onScanComplete, onScanFail, }: TScanArguments) => Promise<void>;
export declare const cliSetup: (program: Command) => Command;
declare const _default: {
    cli: typeof cli;
    cliSetup: (program: Command) => Command;
    scan: ({ repoId, commitId, options, pollInterval, onStart, onStartComplete, onStartFail, onScanStart, onNextPoll, onScanComplete, onScanFail, }: TScanArguments) => Promise<void>;
};
export default _default;
