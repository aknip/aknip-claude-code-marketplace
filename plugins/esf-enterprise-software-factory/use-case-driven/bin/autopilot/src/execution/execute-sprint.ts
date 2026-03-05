import path from 'node:path';
import fs from 'fs-extra';
import { runClaudeWithPrompt } from '../services/claude-runner.js';
import { generatePrompt, appendGapClosureInstructions, appendExecutionGapInstructions } from '../services/prompt-generator.js';
import { ensureCleanWorkingTree } from '../services/git-safety.js';
import { loadSprintInfo, isSprintComplete, getSprintStatus, getRelativeSprintDir } from '../services/sprint-loader.js';
import { queueCheckpoint } from '../services/checkpoint-handler.js';
import type { AutopilotConfig, DerivedPaths, SprintResult, SprintStatus, SprintInfo } from '../types/config.js';
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
 * Execute a single sprint
 */
export async function executeSprint(
  sprint: number,
  config: AutopilotConfig,
  paths: DerivedPaths,
  logger: ExecutionLogger
): Promise<SprintResult> {
  const startTime = Date.now();
  let totalTokens = 0;
  let totalCost = 0;
  let attempt = 1;

  // Load sprint info
  const sprintInfo = await loadSprintInfo(paths, sprint);
  logger.log('INFO', `Starting sprint ${sprint}: ${sprintInfo?.name || 'Unknown'}`);

  // Safety check before starting
  await ensureCleanWorkingTree(config.projectDir, `before sprint ${sprint}`, logger.log);

  // Check if already complete
  if (await isSprintComplete(paths, sprint)) {
    logger.log('INFO', `Sprint ${sprint} already complete, skipping`);
    return {
      sprint,
      status: 'passed',
      attempts: 0,
      duration: 0,
      tokens: 0,
      cost: 0,
    };
  }

  while (attempt <= config.maxRetries) {
    // Create log file for this attempt
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const phaseLog = path.join(
      paths.logDir,
      `sprint-${sprint}-attempt${attempt}-${timestamp}.log`
    );

    if (attempt > 1) {
      logger.log('INFO', `Retry ${attempt}/${config.maxRetries} for sprint ${sprint}`);
      logger.onActivity?.({
        type: 'retry',
        detail: `attempt ${attempt} of ${config.maxRetries}`,
        timestamp: new Date(),
      });

      // Wait before retry
      await sleep(5000);
    }

    // Check if sprint needs planning
    const hasPlans = await checkSprintPlans(paths, sprint);

    if (!hasPlans) {
      // Run planning
      logger.log('INFO', `Planning sprint ${sprint}`);
      logger.onStageChange?.('PLANNING', 'Creating execution plans');

      const planPromptFile = path.join(paths.logDir, `plan-sprint-${sprint}.prompt.md`);
      await generatePrompt('plan-sprint-prompt.md', planPromptFile, {
        paths,
        projectDir: config.projectDir,
        sprint,
      });

      let planResult = await runClaudeWithPrompt(planPromptFile, phaseLog, {
        config,
        paths,
        onEvent: undefined,
        onActivity: logger.onActivity,
        onStageChange: logger.onStageChange,
        onTokenUpdate: logger.onTokenUpdate,
      });

      // Handle rate limit without incrementing attempt
      if (planResult.rateLimitResetTime) {
        await handleRateLimitWait(planResult.rateLimitResetTime, logger);
        logger.onStageChange?.('PLANNING', 'Retrying after rate limit');
        planResult = await runClaudeWithPrompt(planPromptFile, phaseLog, {
          config,
          paths,
          onEvent: undefined,
          onActivity: logger.onActivity,
          onStageChange: logger.onStageChange,
          onTokenUpdate: logger.onTokenUpdate,
        });
      }

      if (!planResult.success) {
        logger.log('ERROR', `Planning failed for sprint ${sprint}: ${planResult.error}`);
        attempt++;
        continue;
      }

      totalTokens += planResult.tokens;
      totalCost += planResult.cost;
    }

    // Execute sprint
    logger.log('INFO', `Executing sprint ${sprint}`);
    logger.onStageChange?.('BUILDING', 'Implementing features');

    const execPromptFile = path.join(paths.logDir, `execute-sprint-${sprint}.prompt.md`);
    await generatePrompt('execute-sprint-prompt.md', execPromptFile, {
      paths,
      projectDir: config.projectDir,
      sprint,
    });

    let execResult = await runClaudeWithPrompt(execPromptFile, phaseLog, {
      config,
      paths,
      onEvent: undefined,
      onActivity: logger.onActivity,
      onStageChange: logger.onStageChange,
      onTokenUpdate: logger.onTokenUpdate,
    });

    // Handle rate limit without incrementing attempt
    if (execResult.rateLimitResetTime) {
      await handleRateLimitWait(execResult.rateLimitResetTime, logger);
      logger.onStageChange?.('BUILDING', 'Retrying after rate limit');
      execResult = await runClaudeWithPrompt(execPromptFile, phaseLog, {
        config,
        paths,
        onEvent: undefined,
        onActivity: logger.onActivity,
        onStageChange: logger.onStageChange,
        onTokenUpdate: logger.onTokenUpdate,
      });
    }

    if (!execResult.success) {
      logger.log('ERROR', `Execution failed for sprint ${sprint}: ${execResult.error}`);
      attempt++;
      continue;
    }

    totalTokens += execResult.tokens;
    totalCost += execResult.cost;

    // Check sprint status
    const status = await getSprintStatus(paths, sprint);
    logger.log('INFO', `Sprint ${sprint} status: ${status}`);

    switch (status) {
      case 'passed':
        // Success!
        await ensureCleanWorkingTree(config.projectDir, `after sprint ${sprint}`, logger.log);
        return {
          sprint,
          status: 'passed',
          attempts: attempt,
          duration: Math.floor((Date.now() - startTime) / 1000),
          tokens: totalTokens,
          cost: totalCost,
        };

      case 'gaps_found':
        // Handle gaps
        logger.log('INFO', `Gaps found in sprint ${sprint}, running gap closure`);
        const gapResult = await runGapClosure(
          sprint,
          config,
          paths,
          phaseLog,
          logger
        );

        totalTokens += gapResult.tokens;
        totalCost += gapResult.cost;

        if (gapResult.success) {
          await ensureCleanWorkingTree(
            config.projectDir,
            `after sprint ${sprint} gap closure`,
            logger.log
          );
          return {
            sprint,
            status: 'passed',
            attempts: attempt,
            duration: Math.floor((Date.now() - startTime) / 1000),
            tokens: totalTokens,
            cost: totalCost,
          };
        }

        attempt++;
        continue;

      case 'human_needed':
        // Queue checkpoint and return
        if (config.checkpointMode === 'queue') {
          await queueCheckpoint(paths, {
            sprint,
            type: 'human_verification',
            data: { sprint },
          });
        }

        await ensureCleanWorkingTree(
          config.projectDir,
          `after sprint ${sprint} (human verification queued)`,
          logger.log
        );

        return {
          sprint,
          status: 'human_needed',
          attempts: attempt,
          duration: Math.floor((Date.now() - startTime) / 1000),
          tokens: totalTokens,
          cost: totalCost,
        };

      case 'needs_verification':
        // Re-run to trigger verification
        logger.log('INFO', `Running verification for sprint ${sprint}`);
        attempt++;
        continue;

      default:
        // Incomplete - retry
        logger.log('WARN', `Sprint ${sprint} incomplete, will retry`);
        attempt++;
        continue;
    }
  }

  // All retries exhausted
  await ensureCleanWorkingTree(
    config.projectDir,
    `after sprint ${sprint} failure`,
    logger.log
  );

  return {
    sprint,
    status: 'failed',
    attempts: attempt - 1,
    duration: Math.floor((Date.now() - startTime) / 1000),
    tokens: totalTokens,
    cost: totalCost,
    error: `Failed after ${config.maxRetries} attempts`,
  };
}

/**
 * Run gap closure for a sprint
 */
async function runGapClosure(
  sprint: number,
  config: AutopilotConfig,
  paths: DerivedPaths,
  phaseLog: string,
  logger: ExecutionLogger
): Promise<{ success: boolean; tokens: number; cost: number }> {
  let totalTokens = 0;
  let totalCost = 0;

  // Get sprint directory
  const sprintDir = await getRelativeSprintDir(paths, sprint);

  // Generate gap planning prompt
  logger.onStageChange?.('PLANNING', 'Planning gap closure');

  const gapPlanPrompt = path.join(paths.logDir, `plan-sprint-${sprint}-gaps.prompt.md`);
  await generatePrompt('plan-sprint-prompt.md', gapPlanPrompt, {
    paths,
    projectDir: config.projectDir,
    sprint,
  });
  await appendGapClosureInstructions(gapPlanPrompt, sprintDir);

  let planResult = await runClaudeWithPrompt(gapPlanPrompt, phaseLog, {
    config,
    paths,
    onActivity: logger.onActivity,
    onStageChange: logger.onStageChange,
    onTokenUpdate: logger.onTokenUpdate,
  });

  // Handle rate limit
  if (planResult.rateLimitResetTime) {
    await handleRateLimitWait(planResult.rateLimitResetTime, logger);
    logger.onStageChange?.('PLANNING', 'Retrying gap closure after rate limit');
    planResult = await runClaudeWithPrompt(gapPlanPrompt, phaseLog, {
      config,
      paths,
      onActivity: logger.onActivity,
      onStageChange: logger.onStageChange,
      onTokenUpdate: logger.onTokenUpdate,
    });
  }

  if (!planResult.success) {
    return { success: false, tokens: 0, cost: 0 };
  }

  totalTokens += planResult.tokens;
  totalCost += planResult.cost;

  // Generate gap execution prompt
  logger.onStageChange?.('BUILDING', 'Executing gap closure');

  const gapExecPrompt = path.join(paths.logDir, `execute-sprint-${sprint}-gaps.prompt.md`);
  await generatePrompt('execute-sprint-prompt.md', gapExecPrompt, {
    paths,
    projectDir: config.projectDir,
    sprint,
  });
  await appendExecutionGapInstructions(gapExecPrompt);

  let execResult = await runClaudeWithPrompt(gapExecPrompt, phaseLog, {
    config,
    paths,
    onActivity: logger.onActivity,
    onStageChange: logger.onStageChange,
    onTokenUpdate: logger.onTokenUpdate,
  });

  // Handle rate limit
  if (execResult.rateLimitResetTime) {
    await handleRateLimitWait(execResult.rateLimitResetTime, logger);
    logger.onStageChange?.('BUILDING', 'Retrying gap execution after rate limit');
    execResult = await runClaudeWithPrompt(gapExecPrompt, phaseLog, {
      config,
      paths,
      onActivity: logger.onActivity,
      onStageChange: logger.onStageChange,
      onTokenUpdate: logger.onTokenUpdate,
    });
  }

  totalTokens += execResult.tokens;
  totalCost += execResult.cost;

  // Check final status
  const status = await getSprintStatus(paths, sprint);
  return {
    success: status === 'passed',
    tokens: totalTokens,
    cost: totalCost,
  };
}

/**
 * Check if sprint has existing plans
 */
async function checkSprintPlans(
  paths: DerivedPaths,
  sprint: number
): Promise<boolean> {
  const paddedSprint = String(sprint).padStart(2, '0');

  try {
    const sprintDirs = await fs.readdir(paths.sprintsDir);
    const matchingDir = sprintDirs.find((d) => d.startsWith(`${paddedSprint}-`));

    if (!matchingDir) {
      return false;
    }

    const sprintDir = path.join(paths.sprintsDir, matchingDir);
    const files = await fs.readdir(sprintDir);

    return files.some((f) => f.endsWith('-PLAN.md'));
  } catch {
    return false;
  }
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Handle rate limit by waiting until reset time + 2 minutes buffer
 * Returns when it's safe to retry
 */
async function handleRateLimitWait(
  resetTime: Date,
  logger: ExecutionLogger
): Promise<void> {
  const BUFFER_MINUTES = 2;
  const bufferMs = BUFFER_MINUTES * 60 * 1000;

  // Calculate target time with buffer
  const targetTime = new Date(resetTime.getTime() + bufferMs);
  const waitMs = targetTime.getTime() - Date.now();

  if (waitMs <= 0) {
    // Already past the reset time
    logger.log('INFO', 'Rate limit reset time already passed, continuing immediately');
    return;
  }

  const waitMinutes = Math.ceil(waitMs / 60000);
  const resumeTimeStr = targetTime.toLocaleTimeString();

  logger.log('WARN', `Rate limit hit. Waiting until ${resumeTimeStr} (${waitMinutes} min)`);
  logger.onStageChange?.('WAITING', `Rate limit - resuming at ${resumeTimeStr}`);
  logger.onActivity?.({
    type: 'waiting',
    detail: `Rate limit hit, waiting ${waitMinutes} min until ${resumeTimeStr}`,
    timestamp: new Date(),
  });

  // Wait until target time
  await sleep(waitMs);

  logger.log('INFO', 'Rate limit wait complete, resuming execution');
  logger.onActivity?.({
    type: 'info',
    detail: 'Rate limit wait complete, resuming',
    timestamp: new Date(),
  });
}
