#!/usr/bin/env node
import { Command } from 'commander';
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            [key: string]: any;
            QUIET?: boolean;
        }
    }
}
export declare const program: Command;
