import { z } from 'zod';
/**
 * Autopilot configuration schema and types
 */
export const AutopilotConfigSchema = z.object({
    // Project settings
    projectDir: z.string().describe('Root directory of the project'),
    projectName: z.string().default('Project').describe('Display name for the project'),
    // Sprints to execute
    sprints: z.array(z.number()).min(1).describe('Sprint numbers to execute'),
    // Execution settings
    checkpointMode: z.enum(['queue', 'pause', 'skip']).default('queue')
        .describe('How to handle checkpoints: queue for later, pause execution, or skip'),
    maxRetries: z.number().min(1).max(10).default(3)
        .describe('Maximum retry attempts per sprint'),
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
/**
 * Get derived paths from project directory
 */
export function getDerivedPaths(projectDir) {
    return {
        logDir: `${projectDir}/.planning/logs`,
        promptTemplatesDir: `${projectDir}/.claude/use-case-driven/templates/prompts`,
        checkpointDir: `${projectDir}/.planning/checkpoints`,
        projectStatusFile: `${projectDir}/.planning/PROJECT-STATUS.md`,
        sprintsDir: `${projectDir}/.planning/sprints`,
        projectPlanFile: `${projectDir}/.planning/PROJECT-PLAN.md`,
        displayStateDir: `${projectDir}/.planning/logs/.display`,
    };
}
//# sourceMappingURL=config.js.map