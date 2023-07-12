import { Ora } from 'ora';
import { AxiosError } from 'axios';
export declare const outputLog: (message: string) => void;
export declare const outputDebug: (variable: any) => void;
export declare const outputError: (message: string, exitCode?: number) => void;
export declare const outputHttpError: (axiosError: AxiosError) => void;
export declare const startSpinner: (message: string) => Ora | null;
