import { z } from 'zod';
/**
 * Autopilot configuration schema and types
 */
export declare const AutopilotConfigSchema: z.ZodObject<{
    projectDir: z.ZodString;
    projectName: z.ZodDefault<z.ZodString>;
    sprints: z.ZodArray<z.ZodNumber, "many">;
    checkpointMode: z.ZodDefault<z.ZodEnum<["queue", "pause", "skip"]>>;
    maxRetries: z.ZodDefault<z.ZodNumber>;
    budgetLimit: z.ZodDefault<z.ZodNumber>;
    webhookUrl: z.ZodOptional<z.ZodString>;
    modelProfile: z.ZodDefault<z.ZodEnum<["fast", "balanced", "thorough"]>>;
    dryRun: z.ZodDefault<z.ZodBoolean>;
    verbose: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    projectDir: string;
    projectName: string;
    sprints: number[];
    checkpointMode: "queue" | "pause" | "skip";
    maxRetries: number;
    budgetLimit: number;
    modelProfile: "fast" | "balanced" | "thorough";
    dryRun: boolean;
    verbose: boolean;
    webhookUrl?: string | undefined;
}, {
    projectDir: string;
    sprints: number[];
    projectName?: string | undefined;
    checkpointMode?: "queue" | "pause" | "skip" | undefined;
    maxRetries?: number | undefined;
    budgetLimit?: number | undefined;
    webhookUrl?: string | undefined;
    modelProfile?: "fast" | "balanced" | "thorough" | undefined;
    dryRun?: boolean | undefined;
    verbose?: boolean | undefined;
}>;
export type AutopilotConfig = z.infer<typeof AutopilotConfigSchema>;
/**
 * Sprint information extracted from PROJECT-PLAN.md
 */
export interface SprintInfo {
    number: number;
    name: string;
    goal?: string;
    deliverables: string[];
    useCases: string[];
}
/**
 * Sprint execution status
 */
export type SprintStatus = 'pending' | 'running' | 'passed' | 'gaps_found' | 'needs_verification' | 'incomplete' | 'human_needed' | 'failed';
/**
 * Sprint execution result
 */
export interface SprintResult {
    sprint: number;
    status: SprintStatus;
    attempts: number;
    duration: number;
    tokens: number;
    cost: number;
    error?: string;
}
/**
 * Autopilot state persisted in PROJECT-STATUS.md
 */
export interface AutopilotState {
    mode: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
    startedAt?: Date;
    currentSprint?: number;
    sprintsRemaining: number[];
    sprintsCompleted: number[];
    checkpointsPending: number;
    lastError?: string;
    updatedAt: Date;
    totalTokens: number;
    totalCost: number;
}
/**
 * Checkpoint data for human review
 */
export interface Checkpoint {
    id: string;
    sprint: number;
    plan?: number;
    type: 'human_verification' | 'approval_needed' | 'question';
    data: Record<string, unknown>;
    createdAt: Date;
    status: 'pending' | 'approved' | 'rejected';
    response?: string;
}
/**
 * Log entry structure
 */
export interface LogEntry {
    timestamp: Date;
    level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
    category: string;
    message: string;
}
/**
 * Derived paths from config
 */
export interface DerivedPaths {
    logDir: string;
    promptTemplatesDir: string;
    checkpointDir: string;
    projectStatusFile: string;
    sprintsDir: string;
    projectPlanFile: string;
    displayStateDir: string;
}
/**
 * Get derived paths from project directory
 */
export declare function getDerivedPaths(projectDir: string): DerivedPaths;
//# sourceMappingURL=config.d.ts.map