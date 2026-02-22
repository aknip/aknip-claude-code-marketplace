import { z } from 'zod';

/**
 * Autopilot configuration schema and types
 */

export const AutopilotConfigSchema = z.object({
  // Project settings
  projectDir: z.string().describe('Root directory of the project'),
  projectName: z.string().default('Project').describe('Display name for the project'),

  // Phases to execute
  phases: z.array(z.number()).min(1).describe('Phase numbers to execute'),

  // Execution settings
  checkpointMode: z.enum(['queue', 'pause', 'skip']).default('queue')
    .describe('How to handle checkpoints: queue for later, pause execution, or skip'),
  maxRetries: z.number().min(1).max(10).default(3)
    .describe('Maximum retry attempts per phase'),
  budgetLimit: z.number().min(0).default(0)
    .describe('Maximum budget in USD (0 = unlimited)'),

  // Optional settings
  webhookUrl: z.string().url().optional()
    .describe('Webhook URL for notifications'),
  modelProfile: z.enum(['fast', 'balanced', 'thorough']).default('balanced')
    .describe('Model profile affecting tool selection'),

  // Runtime flags
  dryRun: z.boolean().default(false)
    .describe('Run without executing Claude commands'),
  verbose: z.boolean().default(false)
    .describe('Enable verbose logging'),
});

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
export type PhaseStatus =
  | 'pending'
  | 'running'
  | 'passed'
  | 'gaps_found'
  | 'needs_verification'
  | 'incomplete'
  | 'human_needed'
  | 'failed';

/**
 * Phase execution result
 */
export interface PhaseResult {
  phase: number;
  status: PhaseStatus;
  attempts: number;
  duration: number; // seconds
  tokens: number;
  cost: number; // USD
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
export function getDerivedPaths(projectDir: string): DerivedPaths {
  return {
    logDir: `${projectDir}/.planning/logs`,
    promptTemplatesDir: `${projectDir}/.claude/use-case-driven/templates/prompts`,
    checkpointDir: `${projectDir}/.planning/checkpoints`,
    stateFile: `${projectDir}/.planning/STATE.md`,
    phasesDir: `${projectDir}/.planning/phases`,
    roadmapFile: `${projectDir}/.planning/ROADMAP.md`,
    displayStateDir: `${projectDir}/.planning/logs/.display`,
  };
}
