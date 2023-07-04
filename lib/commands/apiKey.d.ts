import { Command } from 'commander';
declare function cli(apiKey: string): void;
export declare const cliSetup: (program: Command) => Command;
declare const _default: {
    cli: typeof cli;
    cliSetup: (program: Command) => Command;
};
export default _default;
