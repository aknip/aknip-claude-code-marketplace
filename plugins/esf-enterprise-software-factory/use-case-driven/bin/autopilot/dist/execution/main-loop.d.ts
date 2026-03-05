import type { AutopilotConfig, DerivedPaths, SprintResult, SprintInfo } from '../types/config.js';
import type { ActivityEntry, StageName } from '../types/events.js';
/**
 * Callback interface for main loop events
 */
export interface MainLoopCallbacks {
    onSprintStart?: (sprint: number, sprintInfo: SprintInfo | null, index: number, total: number) => void;
    onSprintComplete?: (sprint: number, result: SprintResult) => void;
    onActivity?: (activity: ActivityEntry) => void;
    onStageChange?: (stage: StageName, description: string) => void;
    onTokenUpdate?: (tokens: number) => void;
    onError?: (error: string) => void;
    onBudgetWarning?: (used: number, budget: number) => void;
    onBudgetExceeded?: (used: number, budget: number) => void;
    onComplete?: (results: SprintResult[]) => void;
    log?: (level: string, message: string) => void;
}
/**
 * Main loop result
 */
export interface MainLoopResult {
    success: boolean;
    sprintsCompleted: number[];
    sprintsFailed: number[];
    totalTokens: number;
    totalCost: number;
    duration: number;
    error?: string;
}
/**
 * Run the main autopilot execution loop
 */
export declare function runMainLoop(config: AutopilotConfig, paths: DerivedPaths, callbacks?: MainLoopCallbacks): Promise<MainLoopResult>;
/**
 * Resume main loop from a paused state
 */
export declare function resumeMainLoop(config: AutopilotConfig, paths: DerivedPaths, callbacks?: MainLoopCallbacks): Promise<MainLoopResult>;
//# sourceMappingURL=main-loop.d.ts.map