import { TScanApiOptions } from './commands/scan.js';
export declare function startScan(options: TScanApiOptions): Promise<any>;
export declare function pollScanStatus(scanId: number): Promise<any>;
