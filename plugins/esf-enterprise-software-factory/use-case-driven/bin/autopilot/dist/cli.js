import { Command } from 'commander';
import path from 'node:path';
import fs from 'fs-extra';
import { AutopilotConfigSchema, getDerivedPaths } from './types/config.js';
import { checkClaudeCli } from './services/claude-runner.js';
/**
 * CLI color codes for terminal output
 */
export const colors = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
};
/**
 * Parse CLI arguments and return config
 */
export function parseArgs() {
    const program = new Command();
    program
        .name('autopilot')
        .description('UC Autopilot - Autonomous sprint execution with flicker-free UI')
        .version('1.0.0')
        .option('-d, --project-dir <path>', 'Project directory', process.cwd())
        .option('-n, --project-name <name>', 'Project display name', 'Project')
        .option('-p, --sprints <sprints>', 'Comma-separated sprint numbers (e.g., "1,2,3,4")', '1')
        .option('-c, --checkpoint-mode <mode>', 'Checkpoint handling: queue, pause, skip', 'queue')
        .option('-r, --max-retries <n>', 'Maximum retries per sprint', '3')
        .option('-b, --budget <amount>', 'Budget limit in USD (0 = unlimited)', '0')
        .option('-w, --webhook <url>', 'Webhook URL for notifications')
        .option('-m, --model-profile <profile>', 'Model profile: fast, balanced, thorough', 'balanced')
        .option('--dry-run', 'Run without executing Claude commands')
        .option('-v, --verbose', 'Enable verbose logging')
        .parse();
    const opts = program.opts();
    // Parse sprints from comma-separated string
    const sprints = opts.sprints
        .split(',')
        .map((p) => parseInt(p.trim(), 10))
        .filter((p) => !isNaN(p));
    // Build config object
    const rawConfig = {
        projectDir: path.resolve(opts.projectDir),
        projectName: opts.projectName,
        sprints,
        checkpointMode: opts.checkpointMode,
        maxRetries: parseInt(opts.maxRetries, 10),
        budgetLimit: parseFloat(opts.budget),
        webhookUrl: opts.webhook,
        modelProfile: opts.modelProfile,
        dryRun: opts.dryRun ?? false,
        verbose: opts.verbose ?? false,
    };
    // Validate with Zod
    const result = AutopilotConfigSchema.safeParse(rawConfig);
    if (!result.success) {
        console.error('Invalid configuration:');
        for (const error of result.error.errors) {
            console.error(`  - ${error.path.join('.')}: ${error.message}`);
        }
        process.exit(1);
    }
    return result.data;
}
/**
 * Validate environment and prerequisites
 */
export async function validateEnvironment(config) {
    // Check project directory exists
    if (!await fs.pathExists(config.projectDir)) {
        console.error(`Error: Project directory not found: ${config.projectDir}`);
        process.exit(1);
    }
    // Check Claude CLI is available
    if (!config.dryRun) {
        const claudeAvailable = await checkClaudeCli();
        if (!claudeAvailable) {
            console.error('Error: Claude CLI not found. Please install it first.');
            console.error('  npm install -g @anthropic-ai/claude-cli');
            process.exit(1);
        }
    }
    // Check for required directories
    const paths = getDerivedPaths(config.projectDir);
    // Ensure log directory exists
    await fs.ensureDir(paths.logDir);
    await fs.ensureDir(path.join(paths.checkpointDir, 'pending'));
    await fs.ensureDir(path.join(paths.checkpointDir, 'approved'));
    // Check for PROJECT-PLAN.md (optional but recommended)
    if (!await fs.pathExists(paths.projectPlanFile)) {
        console.warn(`${colors.yellow}Warning: PROJECT-PLAN.md not found at ${paths.projectPlanFile}${colors.reset}`);
        console.warn(`  Sprint information will be limited.`);
    }
    // Check for prompt templates
    if (!await fs.pathExists(paths.promptTemplatesDir)) {
        console.error(`Error: Prompt templates not found: ${paths.promptTemplatesDir}`);
        console.error('  Please ensure .claude/use-case-driven/templates/prompts/ exists.');
        process.exit(1);
    }
}
/**
 * Display startup banner
 */
export function showBanner(config) {
    const { bold, cyan, dim, yellow, reset } = colors;
    console.log('');
    console.log(`${bold}${cyan}  ██╗   ██╗ ██████╗${reset}`);
    console.log(`${bold}${cyan}  ██║   ██║██╔════╝${reset}`);
    console.log(`${bold}${cyan}  ██║   ██║██║     ${reset}`);
    console.log(`${bold}${cyan}  ██║   ██║██║     ${reset}`);
    console.log(`${bold}${cyan}  ╚██████╔╝╚██████╗${reset}`);
    console.log(`${bold}${cyan}   ╚═════╝  ╚═════╝${reset}`);
    console.log('');
    console.log(`${bold}  AUTOPILOT${reset}`);
    console.log(`${dim}  ${config.projectName}${reset}`);
    console.log('');
    console.log(`${dim}  Sprints:      ${config.sprints.join(', ')}${reset}`);
    console.log(`${dim}  Retries:     ${config.maxRetries} per sprint${reset}`);
    console.log(`${dim}  Budget:      $${config.budgetLimit}${reset}`);
    console.log(`${dim}  Checkpoints: ${config.checkpointMode}${reset}`);
    console.log(`${dim}  Profile:     ${config.modelProfile}${reset}`);
    if (config.dryRun) {
        console.log(`${yellow}  [DRY RUN MODE]${reset}`);
    }
    console.log('');
    console.log(`${dim}  Starting in 3 seconds...${reset}`);
}
/**
 * Display completion banner
 */
export function showCompletionBanner(sprintsCompleted, durationSeconds, totalTokens, totalCost) {
    const { bold, green, white, reset } = colors;
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    console.log('');
    console.log(`${bold}${green}  ╔═══════════════════════════════════════════════════╗${reset}`);
    console.log(`${bold}${green}  ║              MILESTONE COMPLETE                   ║${reset}`);
    console.log(`${bold}${green}  ╚═══════════════════════════════════════════════════╝${reset}`);
    console.log('');
    console.log(`${white}  Sprints:${reset}    ${sprintsCompleted} completed`);
    console.log(`${white}  Time:${reset}      ${minutes}m ${seconds}s`);
    console.log(`${white}  Tokens:${reset}    ${totalTokens.toLocaleString()}`);
    console.log(`${white}  Cost:${reset}      $${totalCost.toFixed(2)}`);
    console.log('');
}
/**
 * Display failure banner
 */
export function showFailureBanner(failedPhase, error) {
    const { bold, red, reset } = colors;
    console.log('');
    console.log(`${red}${bold}Autopilot stopped at sprint ${failedPhase}${reset}`);
    if (error) {
        console.log(`${red}Error: ${error}${reset}`);
    }
    console.log('');
}
/**
 * Wait for specified milliseconds
 */
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=cli.js.map