import type { StreamEvent, StageName, ActivityEntry } from '../types/events.js';
import type { AutopilotConfig, DerivedPaths } from '../types/config.js';
/**
 * Claude CLI runner with streaming output processing
 */
export interface ClaudeRunnerOptions {
    config: AutopilotConfig;
    paths: DerivedPaths;
    onEvent?: (event: StreamEvent) => void;
    onActivity?: (activity: ActivityEntry) => void;
    onStageChange?: (stage: StageName, description: string) => void;
    onTokenUpdate?: (tokens: number) => void;
}
export interface ClaudeRunResult {
    success: boolean;
    exitCode: number;
    tokens: number;
    cost: number;
    turns: number;
    error?: string;
    rateLimitResetTime?: Date;
}
/**
 * Run Claude CLI with a prompt file and stream output
 */
export declare function runClaudeWithPrompt(promptFile: string, logFile: string, options: ClaudeRunnerOptions): Promise<ClaudeRunResult>;
/**
 * Generate a prompt file from template
 */
export declare function generatePrompt(templateName: string, outputFile: string, options: {
    paths: DerivedPaths;
    sprint?: number;
    version?: string;
    projectDir: string;
}): Promise<void>;
/**
 * Check if Claude CLI is available
 */
export declare function checkClaudeCli(): Promise<boolean>;
//# sourceMappingURL=claude-runner.d.ts.map