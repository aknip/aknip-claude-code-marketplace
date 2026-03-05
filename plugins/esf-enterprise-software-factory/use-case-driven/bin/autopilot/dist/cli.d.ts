import type { AutopilotConfig } from './types/config.js';
/**
 * CLI color codes for terminal output
 */
export declare const colors: {
    readonly reset: "\u001B[0m";
    readonly bold: "\u001B[1m";
    readonly dim: "\u001B[2m";
    readonly red: "\u001B[31m";
    readonly green: "\u001B[32m";
    readonly yellow: "\u001B[33m";
    readonly blue: "\u001B[34m";
    readonly cyan: "\u001B[36m";
    readonly white: "\u001B[37m";
};
/**
 * Parse CLI arguments and return config
 */
export declare function parseArgs(): AutopilotConfig;
/**
 * Validate environment and prerequisites
 */
export declare function validateEnvironment(config: AutopilotConfig): Promise<void>;
/**
 * Display startup banner
 */
export declare function showBanner(config: AutopilotConfig): void;
/**
 * Display completion banner
 */
export declare function showCompletionBanner(sprintsCompleted: number, durationSeconds: number, totalTokens: number, totalCost: number): void;
/**
 * Display failure banner
 */
export declare function showFailureBanner(failedPhase: number, error: string): void;
/**
 * Wait for specified milliseconds
 */
export declare function sleep(ms: number): Promise<void>;
//# sourceMappingURL=cli.d.ts.map