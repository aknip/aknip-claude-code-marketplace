import type { AutopilotConfig, DerivedPaths, PhaseResult } from '../types/config.js';
import type { ActivityEntry, StageName } from '../types/events.js';
/**
 * Logger interface for execution
 */
export interface ExecutionLogger {
    log: (level: string, message: string) => void;
    onActivity?: (activity: ActivityEntry) => void;
    onStageChange?: (stage: StageName, description: string) => void;
    onTokenUpdate?: (tokens: number) => void;
}
/**
 * Execute a single phase
 */
export declare function executePhase(phase: number, config: AutopilotConfig, paths: DerivedPaths, logger: ExecutionLogger): Promise<PhaseResult>;
//# sourceMappingURL=execute-phase.d.ts.map