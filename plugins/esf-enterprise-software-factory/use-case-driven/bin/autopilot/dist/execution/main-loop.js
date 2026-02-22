import { executePhase } from './execute-phase.js';
import { updateAutopilotState } from '../services/state-manager.js';
import { loadPhaseInfo } from '../services/phase-loader.js';
import { getApprovedCheckpoints, markCheckpointProcessed } from '../services/checkpoint-handler.js';
import { createCostTracker, trackPhase, isBudgetExceeded, isBudgetWarning, formatCost } from '../services/cost-tracker.js';
/**
 * Run the main autopilot execution loop
 */
export async function runMainLoop(config, paths, callbacks = {}) {
    const startTime = Date.now();
    const phases = config.phases;
    const totalPhases = phases.length;
    const results = [];
    const costTracker = createCostTracker();
    const log = callbacks.log || (() => { });
    // Initialize remaining phases
    let remainingPhases = [...phases];
    const completedPhases = [];
    const failedPhases = [];
    log('INFO', `Autopilot starting with ${totalPhases} phases: ${phases.join(', ')}`);
    // Update initial state
    await updateAutopilotState(paths, {
        mode: 'running',
        startedAt: new Date(),
        currentPhase: phases[0],
        phasesRemaining: remainingPhases,
        phasesCompleted: [],
        totalTokens: 0,
        totalCost: 0,
    });
    for (let i = 0; i < phases.length; i++) {
        const phase = phases[i];
        // Process any approved checkpoints first
        await processApprovedCheckpoints(config, paths, log);
        // Update state
        remainingPhases = phases.slice(i + 1);
        await updateAutopilotState(paths, {
            mode: 'running',
            currentPhase: phase,
            phasesRemaining: remainingPhases,
            phasesCompleted: completedPhases,
        });
        // Load phase info
        const phaseInfo = await loadPhaseInfo(paths, phase);
        // Notify phase start
        callbacks.onPhaseStart?.(phase, phaseInfo, i, totalPhases);
        // Create logger for this phase
        const logger = {
            log,
            onActivity: callbacks.onActivity,
            onStageChange: callbacks.onStageChange,
            onTokenUpdate: callbacks.onTokenUpdate,
        };
        // Execute the phase
        const result = await executePhase(phase, config, paths, logger);
        results.push(result);
        // Track costs
        trackPhase(costTracker, phase, result.tokens, Math.round(result.cost * 100));
        // Notify phase complete
        callbacks.onPhaseComplete?.(phase, result);
        // Handle result
        if (result.status === 'passed' || result.status === 'human_needed') {
            completedPhases.push(phase);
            log('SUCCESS', `Phase ${phase} completed: ${result.status}`);
        }
        else {
            failedPhases.push(phase);
            log('ERROR', `Phase ${phase} failed: ${result.error || result.status}`);
            // Update state with failure
            await updateAutopilotState(paths, {
                mode: 'failed',
                currentPhase: phase,
                phasesRemaining: remainingPhases,
                phasesCompleted: completedPhases,
                lastError: `phase_${phase}_failed`,
                totalTokens: costTracker.totalTokens,
                totalCost: costTracker.totalCostCents / 100,
            });
            callbacks.onError?.(`Phase ${phase} failed after ${result.attempts} attempts`);
            return {
                success: false,
                phasesCompleted: completedPhases,
                phasesFailed: failedPhases,
                totalTokens: costTracker.totalTokens,
                totalCost: costTracker.totalCostCents / 100,
                duration: Math.floor((Date.now() - startTime) / 1000),
                error: `Stopped at phase ${phase}`,
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
                    phasesCompleted: completedPhases,
                    phasesFailed: [],
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
        currentPhase: undefined,
        phasesRemaining: [],
        phasesCompleted: completedPhases,
        totalTokens: costTracker.totalTokens,
        totalCost: costTracker.totalCostCents / 100,
    });
    // Notify completion
    callbacks.onComplete?.(results);
    log('SUCCESS', `Autopilot completed: ${completedPhases.length} phases, ${formatCost(costTracker.totalCostCents)}`);
    return {
        success: true,
        phasesCompleted: completedPhases,
        phasesFailed: [],
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
    // phase completion is already tracked via VERIFICATION.md files
    return runMainLoop(config, paths, callbacks);
}
//# sourceMappingURL=main-loop.js.map