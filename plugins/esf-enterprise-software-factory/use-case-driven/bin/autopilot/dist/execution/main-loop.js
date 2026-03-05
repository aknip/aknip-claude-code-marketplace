import { executeSprint } from './execute-sprint.js';
import { updateAutopilotState } from '../services/state-manager.js';
import { loadSprintInfo } from '../services/sprint-loader.js';
import { getApprovedCheckpoints, markCheckpointProcessed } from '../services/checkpoint-handler.js';
import { createCostTracker, trackPhase, isBudgetExceeded, isBudgetWarning, formatCost } from '../services/cost-tracker.js';
/**
 * Run the main autopilot execution loop
 */
export async function runMainLoop(config, paths, callbacks = {}) {
    const startTime = Date.now();
    const sprints = config.sprints;
    const totalSprints = sprints.length;
    const results = [];
    const costTracker = createCostTracker();
    const log = callbacks.log || (() => { });
    // Initialize remaining sprints
    let remainingSprints = [...sprints];
    const completedSprints = [];
    const failedSprints = [];
    log('INFO', `Autopilot starting with ${totalSprints} sprints: ${sprints.join(', ')}`);
    // Update initial state
    await updateAutopilotState(paths, {
        mode: 'running',
        startedAt: new Date(),
        currentSprint: sprints[0],
        sprintsRemaining: remainingSprints,
        sprintsCompleted: [],
        totalTokens: 0,
        totalCost: 0,
    });
    for (let i = 0; i < sprints.length; i++) {
        const sprint = sprints[i];
        // Process any approved checkpoints first
        await processApprovedCheckpoints(config, paths, log);
        // Update state
        remainingSprints = sprints.slice(i + 1);
        await updateAutopilotState(paths, {
            mode: 'running',
            currentSprint: sprint,
            sprintsRemaining: remainingSprints,
            sprintsCompleted: completedSprints,
        });
        // Load sprint info
        const sprintInfo = await loadSprintInfo(paths, sprint);
        // Notify sprint start
        callbacks.onSprintStart?.(sprint, sprintInfo, i, totalSprints);
        // Create logger for this sprint
        const logger = {
            log,
            onActivity: callbacks.onActivity,
            onStageChange: callbacks.onStageChange,
            onTokenUpdate: callbacks.onTokenUpdate,
        };
        // Execute the sprint
        const result = await executeSprint(sprint, config, paths, logger);
        results.push(result);
        // Track costs
        trackPhase(costTracker, sprint, result.tokens, Math.round(result.cost * 100));
        // Notify sprint complete
        callbacks.onSprintComplete?.(sprint, result);
        // Handle result
        if (result.status === 'passed' || result.status === 'human_needed') {
            completedSprints.push(sprint);
            log('SUCCESS', `Sprint ${sprint} completed: ${result.status}`);
        }
        else {
            failedSprints.push(sprint);
            log('ERROR', `Sprint ${sprint} failed: ${result.error || result.status}`);
            // Update state with failure
            await updateAutopilotState(paths, {
                mode: 'failed',
                currentSprint: sprint,
                sprintsRemaining: remainingSprints,
                sprintsCompleted: completedSprints,
                lastError: `phase_${sprint}_failed`,
                totalTokens: costTracker.totalTokens,
                totalCost: costTracker.totalCostCents / 100,
            });
            callbacks.onError?.(`Sprint ${sprint} failed after ${result.attempts} attempts`);
            return {
                success: false,
                sprintsCompleted: completedSprints,
                sprintsFailed: failedSprints,
                totalTokens: costTracker.totalTokens,
                totalCost: costTracker.totalCostCents / 100,
                duration: Math.floor((Date.now() - startTime) / 1000),
                error: `Stopped at sprint ${sprint}`,
            };
        }
        // Check budget
        if (config.budgetLimit > 0) {
            if (isBudgetExceeded(costTracker, config.budgetLimit)) {
                log('ERROR', `Budget exceeded: ${formatCost(costTracker.totalCostCents)} / $${config.budgetLimit}`);
                callbacks.onBudgetExceeded?.(costTracker.totalCostCents / 100, config.budgetLimit);
                await updateAutopilotState(paths, {
                    mode: 'paused',
                    lastError: 'budget_exceeded',
                    totalTokens: costTracker.totalTokens,
                    totalCost: costTracker.totalCostCents / 100,
                });
                return {
                    success: false,
                    sprintsCompleted: completedSprints,
                    sprintsFailed: [],
                    totalTokens: costTracker.totalTokens,
                    totalCost: costTracker.totalCostCents / 100,
                    duration: Math.floor((Date.now() - startTime) / 1000),
                    error: 'Budget exceeded',
                };
            }
            if (isBudgetWarning(costTracker, config.budgetLimit)) {
                callbacks.onBudgetWarning?.(costTracker.totalCostCents / 100, config.budgetLimit);
            }
        }
    }
    // Process final checkpoints
    await processApprovedCheckpoints(config, paths, log);
    // Update final state
    await updateAutopilotState(paths, {
        mode: 'completed',
        currentSprint: undefined,
        sprintsRemaining: [],
        sprintsCompleted: completedSprints,
        totalTokens: costTracker.totalTokens,
        totalCost: costTracker.totalCostCents / 100,
    });
    // Notify completion
    callbacks.onComplete?.(results);
    log('SUCCESS', `Autopilot completed: ${completedSprints.length} sprints, ${formatCost(costTracker.totalCostCents)}`);
    return {
        success: true,
        sprintsCompleted: completedSprints,
        sprintsFailed: [],
        totalTokens: costTracker.totalTokens,
        totalCost: costTracker.totalCostCents / 100,
        duration: Math.floor((Date.now() - startTime) / 1000),
    };
}
/**
 * Process approved checkpoints
 */
async function processApprovedCheckpoints(config, paths, log) {
    const approved = await getApprovedCheckpoints(paths);
    for (const checkpoint of approved) {
        log('INFO', `Processing approved checkpoint: ${checkpoint.id}`);
        // Mark as processed (actual handling depends on checkpoint type)
        await markCheckpointProcessed(paths, checkpoint.id);
    }
}
/**
 * Resume main loop from a paused state
 */
export async function resumeMainLoop(config, paths, callbacks = {}) {
    // This is essentially the same as runMainLoop since
    // sprint completion is already tracked via VERIFICATION.md files
    return runMainLoop(config, paths, callbacks);
}
//# sourceMappingURL=main-loop.js.map