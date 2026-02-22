import path from 'node:path';
import fs from 'fs-extra';
import { runClaudeWithPrompt } from '../services/claude-runner.js';
import { generatePrompt, appendGapClosureInstructions, appendExecutionGapInstructions } from '../services/prompt-generator.js';
import { ensureCleanWorkingTree } from '../services/git-safety.js';
import { loadPhaseInfo, isPhaseComplete, getPhaseStatus, getRelativePhaseDir } from '../services/phase-loader.js';
import { queueCheckpoint } from '../services/checkpoint-handler.js';
/**
 * Execute a single phase
 */
export async function executePhase(phase, config, paths, logger) {
    const startTime = Date.now();
    let totalTokens = 0;
    let totalCost = 0;
    let attempt = 1;
    // Load phase info
    const phaseInfo = await loadPhaseInfo(paths, phase);
    logger.log('INFO', `Starting phase ${phase}: ${phaseInfo?.name || 'Unknown'}`);
    // Safety check before starting
    await ensureCleanWorkingTree(config.projectDir, `before phase ${phase}`, logger.log);
    // Check if already complete
    if (await isPhaseComplete(paths, phase)) {
        logger.log('INFO', `Phase ${phase} already complete, skipping`);
        return {
            phase,
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
        const phaseLog = path.join(paths.logDir, `phase-${phase}-attempt${attempt}-${timestamp}.log`);
        if (attempt > 1) {
            logger.log('INFO', `Retry ${attempt}/${config.maxRetries} for phase ${phase}`);
            logger.onActivity?.({
                type: 'retry',
                detail: `attempt ${attempt} of ${config.maxRetries}`,
                timestamp: new Date(),
            });
            // Wait before retry
            await sleep(5000);
        }
        // Check if phase needs planning
        const hasPlans = await checkPhasePlans(paths, phase);
        if (!hasPlans) {
            // Run planning
            logger.log('INFO', `Planning phase ${phase}`);
            logger.onStageChange?.('PLANNING', 'Creating execution plans');
            const planPromptFile = path.join(paths.logDir, `plan-phase-${phase}.prompt.md`);
            await generatePrompt('plan-phase-prompt.md', planPromptFile, {
                paths,
                projectDir: config.projectDir,
                phase,
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
                logger.log('ERROR', `Planning failed for phase ${phase}: ${planResult.error}`);
                attempt++;
                continue;
            }
            totalTokens += planResult.tokens;
            totalCost += planResult.cost;
        }
        // Execute phase
        logger.log('INFO', `Executing phase ${phase}`);
        logger.onStageChange?.('BUILDING', 'Implementing features');
        const execPromptFile = path.join(paths.logDir, `execute-phase-${phase}.prompt.md`);
        await generatePrompt('execute-phase-prompt.md', execPromptFile, {
            paths,
            projectDir: config.projectDir,
            phase,
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
            logger.log('ERROR', `Execution failed for phase ${phase}: ${execResult.error}`);
            attempt++;
            continue;
        }
        totalTokens += execResult.tokens;
        totalCost += execResult.cost;
        // Check phase status
        const status = await getPhaseStatus(paths, phase);
        logger.log('INFO', `Phase ${phase} status: ${status}`);
        switch (status) {
            case 'passed':
                // Success!
                await ensureCleanWorkingTree(config.projectDir, `after phase ${phase}`, logger.log);
                return {
                    phase,
                    status: 'passed',
                    attempts: attempt,
                    duration: Math.floor((Date.now() - startTime) / 1000),
                    tokens: totalTokens,
                    cost: totalCost,
                };
            case 'gaps_found':
                // Handle gaps
                logger.log('INFO', `Gaps found in phase ${phase}, running gap closure`);
                const gapResult = await runGapClosure(phase, config, paths, phaseLog, logger);
                totalTokens += gapResult.tokens;
                totalCost += gapResult.cost;
                if (gapResult.success) {
                    await ensureCleanWorkingTree(config.projectDir, `after phase ${phase} gap closure`, logger.log);
                    return {
                        phase,
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
                        phase,
                        type: 'human_verification',
                        data: { phase },
                    });
                }
                await ensureCleanWorkingTree(config.projectDir, `after phase ${phase} (human verification queued)`, logger.log);
                return {
                    phase,
                    status: 'human_needed',
                    attempts: attempt,
                    duration: Math.floor((Date.now() - startTime) / 1000),
                    tokens: totalTokens,
                    cost: totalCost,
                };
            case 'needs_verification':
                // Re-run to trigger verification
                logger.log('INFO', `Running verification for phase ${phase}`);
                attempt++;
                continue;
            default:
                // Incomplete - retry
                logger.log('WARN', `Phase ${phase} incomplete, will retry`);
                attempt++;
                continue;
        }
    }
    // All retries exhausted
    await ensureCleanWorkingTree(config.projectDir, `after phase ${phase} failure`, logger.log);
    return {
        phase,
        status: 'failed',
        attempts: attempt - 1,
        duration: Math.floor((Date.now() - startTime) / 1000),
        tokens: totalTokens,
        cost: totalCost,
        error: `Failed after ${config.maxRetries} attempts`,
    };
}
/**
 * Run gap closure for a phase
 */
async function runGapClosure(phase, config, paths, phaseLog, logger) {
    let totalTokens = 0;
    let totalCost = 0;
    // Get phase directory
    const phaseDir = await getRelativePhaseDir(paths, phase);
    // Generate gap planning prompt
    logger.onStageChange?.('PLANNING', 'Planning gap closure');
    const gapPlanPrompt = path.join(paths.logDir, `plan-phase-${phase}-gaps.prompt.md`);
    await generatePrompt('plan-phase-prompt.md', gapPlanPrompt, {
        paths,
        projectDir: config.projectDir,
        phase,
    });
    await appendGapClosureInstructions(gapPlanPrompt, phaseDir);
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
    const gapExecPrompt = path.join(paths.logDir, `execute-phase-${phase}-gaps.prompt.md`);
    await generatePrompt('execute-phase-prompt.md', gapExecPrompt, {
        paths,
        projectDir: config.projectDir,
        phase,
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
    const status = await getPhaseStatus(paths, phase);
    return {
        success: status === 'passed',
        tokens: totalTokens,
        cost: totalCost,
    };
}
/**
 * Check if phase has existing plans
 */
async function checkPhasePlans(paths, phase) {
    const paddedPhase = String(phase).padStart(2, '0');
    try {
        const phaseDirs = await fs.readdir(paths.phasesDir);
        const matchingDir = phaseDirs.find((d) => d.startsWith(`${paddedPhase}-`));
        if (!matchingDir) {
            return false;
        }
        const phaseDir = path.join(paths.phasesDir, matchingDir);
        const files = await fs.readdir(phaseDir);
        return files.some((f) => f.endsWith('-PLAN.md'));
    }
    catch {
        return false;
    }
}
/**
 * Sleep utility
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Handle rate limit by waiting until reset time + 2 minutes buffer
 * Returns when it's safe to retry
 */
async function handleRateLimitWait(resetTime, logger) {
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
//# sourceMappingURL=execute-phase.js.map