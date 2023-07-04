#!/usr/bin/env node
import { Command } from 'commander';
export declare const program: Command;
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            [key: string]: any;
            QUIET?: boolean;
        }
    }
}
