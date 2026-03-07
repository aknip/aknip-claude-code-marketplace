import { spawn, ChildProcess } from 'node:child_process';
import { createWriteStream, WriteStream } from 'node:fs';
import fs from 'fs-extra';
import path from 'node:path';
import { parseStream, toolToActivityType, agentToStageName } from './stream-parser.js';
import { FileActivityWatcher } from './file-watcher.js';
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
export async function runClaudeWithPrompt(
  promptFile: string,
  logFile: string,
  options: ClaudeRunnerOptions
): Promise<ClaudeRunResult> {
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
  let error: string | undefined;
  let rateLimitResetTime: Date | undefined;

  // Start file watcher for activity during quiet periods (subagent execution)
  let fileWatcher: FileActivityWatcher | null = null;
  if (onActivity) {
    fileWatcher = new FileActivityWatcher({
      projectDir: config.projectDir,
      onActivity,
      debounceMs: 3000,
    });
    await fileWatcher.start();
  }

  // Write prompt to stdin
  claude.stdin.write(promptContent);
  claude.stdin.end();

  // Track active subagents for better status display
  const activeAgents = new Map<string, { agent: string; detail: string; startTime: Date }>();

  // Process stdout stream
  const processOutput = async () => {
    if (!claude.stdout) return;

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

        case 'subagent_start': {
          // Track the active subagent
          activeAgents.set(event.toolId, {
            agent: event.agent,
            detail: event.detail,
            startTime: new Date(),
          });

          onActivity?.({
            type: 'agent',
            detail: event.detail,
            timestamp: new Date(),
          });

          // Update stage based on agent type
          const stage = agentToStageName(event.agent);
          onStageChange?.(stage, event.detail);
          break;
        }

        case 'tool_use':
          onActivity?.({
            type: toolToActivityType(event.tool),
            detail: event.detail,
            timestamp: new Date(),
          });

          // Check for agent stage changes (for non-Task tools)
          if (event.tool === 'Task' || event.tool === 'Agent') {
            // Already handled by subagent_start
          }
          break;

        case 'thinking':
          onActivity?.({
            type: 'text',
            detail: event.summary,
            timestamp: new Date(),
          });
          break;

        case 'text':
          // Tool results - a subagent may have completed
          // Clear active agents on tool results (heuristic: the latest one finished)
          if (event.content === 'Tool completed' && activeAgents.size > 0) {
            const [lastId] = [...activeAgents.keys()].slice(-1);
            const completed = activeAgents.get(lastId);
            activeAgents.delete(lastId);
            if (completed) {
              const elapsed = Math.floor((Date.now() - completed.startTime.getTime()) / 1000);
              const min = Math.floor(elapsed / 60);
              const sec = elapsed % 60;
              onActivity?.({
                type: 'result',
                detail: `${completed.detail} done (${min}:${sec.toString().padStart(2, '0')})`,
                timestamp: new Date(),
              });
            }
          }
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
    new Promise<number>((resolve) => {
      claude.on('close', (code) => resolve(code ?? 1));
    }),
    processOutput(),
  ]);

  // Stop file watcher
  fileWatcher?.stop();

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
export async function generatePrompt(
  templateName: string,
  outputFile: string,
  options: {
    paths: DerivedPaths;
    sprint?: number;
    version?: string;
    projectDir: string;
  }
): Promise<void> {
  const { paths, sprint, version, projectDir } = options;
  const templateFile = path.join(paths.promptTemplatesDir, templateName);

  if (!await fs.pathExists(templateFile)) {
    throw new Error(`Prompt template not found: ${templateFile}`);
  }

  let template = await fs.readFile(templateFile, 'utf-8');

  // Compute sprint-specific values
  let paddedSprint = '';
  let sprintDir = '';
  let sprintName = '';

  if (sprint !== undefined) {
    paddedSprint = String(sprint).padStart(2, '0');

    // Find sprint directory
    const sprintDirs = await fs.readdir(paths.sprintsDir).catch(() => []);
    const matchingDir = sprintDirs.find((d) => d.startsWith(`${paddedSprint}-`));
    if (matchingDir) {
      sprintDir = `.planning/sprints/${matchingDir}`;
      sprintName = matchingDir.replace(`${paddedSprint}-`, '');
    } else {
      sprintDir = `.planning/sprints/${paddedSprint}-unknown`;
    }
  }

  // Substitute placeholders
  template = template
    .replace(/\{\{SPRINT\}\}/g, sprint?.toString() ?? '')
    .replace(/\{\{PROJECT_DIR\}\}/g, projectDir)
    .replace(/\{\{PADDED_SPRINT\}\}/g, paddedSprint)
    .replace(/\{\{SPRINT_DIR\}\}/g, sprintDir)
    .replace(/\{\{SPRINT_NAME\}\}/g, sprintName)
    .replace(/\{\{VERSION\}\}/g, version ?? '');

  // Write output file
  await fs.ensureDir(path.dirname(outputFile));
  await fs.writeFile(outputFile, template, 'utf-8');
}

/**
 * Check if Claude CLI is available
 */
export async function checkClaudeCli(): Promise<boolean> {
  return new Promise((resolve) => {
    const check = spawn('claude', ['--version'], { stdio: 'pipe' });
    check.on('close', (code) => resolve(code === 0));
    check.on('error', () => resolve(false));
  });
}
