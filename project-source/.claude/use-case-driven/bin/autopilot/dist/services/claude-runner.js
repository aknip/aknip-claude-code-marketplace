import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import fs from 'fs-extra';
import path from 'node:path';
import { parseStream, toolToActivityType, agentToStageName } from './stream-parser.js';
/**
 * Run Claude CLI with a prompt file and stream output
 */
export async function runClaudeWithPrompt(promptFile, logFile, options) {
    const { config, onEvent, onActivity, onStageChange, onTokenUpdate } = options;
    // Ensure prompt file exists
    if (!await fs.pathExists(promptFile)) {
        throw new Error(`Prompt file not found: ${promptFile}`);
    }
    // Create log directory if needed
    await fs.ensureDir(path.dirname(logFile));
    // Open log file for writing
    const logStream = createWriteStream(logFile, { flags: 'a' });
    // Build Claude CLI arguments
    const args = [
        '--dangerously-skip-permissions',
        '--print',
        '--verbose',
        '--output-format', 'stream-json',
        '--include-partial-messages',
        '--allowedTools', 'Read,Write,Edit,Glob,Grep,Bash,Task,TaskCreate,TaskUpdate,TaskList,AskUserQuestion',
    ];
    // For dry run, just log what would happen
    if (config.dryRun) {
        console.log('[DRY RUN] Would execute:');
        console.log(`  claude ${args.join(' ')} < ${promptFile}`);
        return {
            success: true,
            exitCode: 0,
            tokens: 0,
            cost: 0,
            turns: 0,
        };
    }
    // Read prompt content
    const promptContent = await fs.readFile(promptFile, 'utf-8');
    // Spawn Claude CLI process
    const claude = spawn('claude', args, {
        cwd: config.projectDir,
        env: {
            ...process.env,
            UC_AUTOPILOT: '1',
            UC_PROJECT_DIR: config.projectDir,
        },
        stdio: ['pipe', 'pipe', 'pipe'],
    });
    // Track result
    let tokens = 0;
    let cost = 0;
    let turns = 0;
    let error;
    let rateLimitResetTime;
    // Write prompt to stdin
    claude.stdin.write(promptContent);
    claude.stdin.end();
    // Process stdout stream
    const processOutput = async () => {
        if (!claude.stdout)
            return;
        for await (const event of parseStream(claude.stdout)) {
            // Log raw event
            logStream.write(JSON.stringify(event) + '\n');
            // Notify listeners
            onEvent?.(event);
            // Process event for UI updates
            switch (event.type) {
                case 'init':
                    onActivity?.({
                        type: 'info',
                        detail: `Session started (${event.model})`,
                        timestamp: new Date(),
                    });
                    break;
                case 'tool_use':
                    onActivity?.({
                        type: toolToActivityType(event.tool),
                        detail: event.detail,
                        timestamp: new Date(),
                    });
                    // Check for agent stage changes
                    if (event.tool === 'Task') {
                        const agentMatch = event.detail.match(/^(\w+[-\w]*)/);
                        if (agentMatch) {
                            const stage = agentToStageName(agentMatch[1]);
                            onStageChange?.(stage, event.detail);
                        }
                    }
                    break;
                case 'thinking':
                    onActivity?.({
                        type: 'text',
                        detail: event.summary,
                        timestamp: new Date(),
                    });
                    break;
                case 'result':
                    tokens = event.tokens;
                    cost = event.cost;
                    turns = event.turns;
                    onTokenUpdate?.(tokens);
                    onActivity?.({
                        type: event.isError ? 'error' : 'result',
                        detail: `Done: ${turns} turns, $${cost.toFixed(2)}`,
                        timestamp: new Date(),
                    });
                    break;
                case 'error':
                    error = event.message;
                    onActivity?.({
                        type: 'error',
                        detail: event.message.slice(0, 45),
                        timestamp: new Date(),
                    });
                    break;
                case 'rate_limit':
                    rateLimitResetTime = event.resetTime;
                    onActivity?.({
                        type: 'waiting',
                        detail: `Rate limit hit, resets at ${event.resetTime.toLocaleTimeString()}`,
                        timestamp: new Date(),
                    });
                    break;
            }
        }
    };
    // Capture stderr
    let stderr = '';
    claude.stderr?.on('data', (data) => {
        stderr += data.toString();
        logStream.write(`[stderr] ${data.toString()}`);
    });
    // Wait for process and stream processing to complete
    const [exitCode] = await Promise.all([
        new Promise((resolve) => {
            claude.on('close', (code) => resolve(code ?? 1));
        }),
        processOutput(),
    ]);
    // Close log stream
    logStream.end();
    return {
        success: exitCode === 0 && !error && !rateLimitResetTime,
        exitCode,
        tokens,
        cost,
        turns,
        error: error || (exitCode !== 0 ? `Process exited with code ${exitCode}` : undefined),
        rateLimitResetTime,
    };
}
/**
 * Generate a prompt file from template
 */
export async function generatePrompt(templateName, outputFile, options) {
    const { paths, phase, version, projectDir } = options;
    const templateFile = path.join(paths.promptTemplatesDir, templateName);
    if (!await fs.pathExists(templateFile)) {
        throw new Error(`Prompt template not found: ${templateFile}`);
    }
    let template = await fs.readFile(templateFile, 'utf-8');
    // Compute phase-specific values
    let paddedPhase = '';
    let phaseDir = '';
    let phaseName = '';
    if (phase !== undefined) {
        paddedPhase = String(phase).padStart(2, '0');
        // Find phase directory
        const phaseDirs = await fs.readdir(paths.phasesDir).catch(() => []);
        const matchingDir = phaseDirs.find((d) => d.startsWith(`${paddedPhase}-`));
        if (matchingDir) {
            phaseDir = `.planning/phases/${matchingDir}`;
            phaseName = matchingDir.replace(`${paddedPhase}-`, '');
        }
        else {
            phaseDir = `.planning/phases/${paddedPhase}-unknown`;
        }
    }
    // Substitute placeholders
    template = template
        .replace(/\{\{PHASE\}\}/g, phase?.toString() ?? '')
        .replace(/\{\{PROJECT_DIR\}\}/g, projectDir)
        .replace(/\{\{PADDED_PHASE\}\}/g, paddedPhase)
        .replace(/\{\{PHASE_DIR\}\}/g, phaseDir)
        .replace(/\{\{PHASE_NAME\}\}/g, phaseName)
        .replace(/\{\{VERSION\}\}/g, version ?? '');
    // Write output file
    await fs.ensureDir(path.dirname(outputFile));
    await fs.writeFile(outputFile, template, 'utf-8');
}
/**
 * Check if Claude CLI is available
 */
export async function checkClaudeCli() {
    return new Promise((resolve) => {
        const check = spawn('claude', ['--version'], { stdio: 'pipe' });
        check.on('close', (code) => resolve(code === 0));
        check.on('error', () => resolve(false));
    });
}
//# sourceMappingURL=claude-runner.js.map