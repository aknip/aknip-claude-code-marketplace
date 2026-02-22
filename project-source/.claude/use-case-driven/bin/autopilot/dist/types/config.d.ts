import { z } from 'zod';
/**
 * Autopilot configuration schema and types
 */
export declare const AutopilotConfigSchema: z.ZodObject<{
    projectDir: z.ZodString;
    projectName: z.ZodDefault<z.ZodString>;
    phases: z.ZodArray<z.ZodNumber, "many">;
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
    phases: number[];
    checkpointMode: "queue" | "pause" | "skip";
    maxRetries: number;
    budgetLimit: number;
    modelProfile: "fast" | "balanced" | "thorough";
    dryRun: boolean;
    verbose: boolean;
    webhookUrl?: string | undefined;
}, {
    projectDir: string;
    phases: number[];
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
 * Phase information extracted from ROADMAP.md
 */
export interface PhaseInfo {
    number: number;
    name: string;
    goal?: string;
    deliverables: string[];
    useCases: string[];
}
/**
 * Phase execution status
 */
export type PhaseStatus = 'pending' | 'running' | 'passed' | 'gaps_found' | 'needs_verification' | 'incomplete' | 'human_needed' | 'failed';
/**
 * Phase execution result
 */
export interface PhaseResult {
    phase: number;
    status: PhaseStatus;
    attempts: number;
    duration: number;
    tokens: number;
    cost: number;
    error?: string;
}
/**
 * Autopilot state persisted in STATE.md
 */
export interface AutopilotState {
    mode: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
    startedAt?: Date;
    currentPhase?: number;
    phasesRemaining: number[];
    phasesCompleted: number[];
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
    phase: number;
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
    stateFile: string;
    phasesDir: string;
    roadmapFile: string;
    displayStateDir: string;
}
/**
 * Get derived paths from project directory
 */
export declare function getDerivedPaths(projectDir: string): DerivedPaths;
//# sourceMappingURL=config.d.ts.map