#!/usr/bin/env node
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useCallback, useRef } from 'react';
import { render, useApp } from 'ink';
import fs from 'fs-extra';
import path from 'node:path';
import { App } from './App.js';
import { getDerivedPaths } from './types/config.js';
import { AutopilotProvider, useAutopilot } from './context/autopilot-context.js';
import { runMainLoop } from './execution/main-loop.js';
import { parseArgs, validateEnvironment, showCompletionBanner, showFailureBanner, sleep, } from './cli.js';
/**
 * Active autopilot runner with UI integration
 */
function AutopilotRunner({ config }) {
    const { exit } = useApp();
    const { init, startSprint, completeSprint, setStage, addActivity, setAgent, updateTokens, setError, setMode, resetStages, } = useAutopilot();
    const paths = getDerivedPaths(config.projectDir);
    const hasStarted = useRef(false);
    // Run the main loop
    const runAutopilot = useCallback(async () => {
        if (hasStarted.current)
            return;
        hasStarted.current = true;
        // Initialize UI state
        init(config, config.sprints.length);
        // Create log file
        const logFile = path.join(paths.logDir, `autopilot-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.log`);
        const log = (level, message) => {
            const timestamp = new Date().toISOString();
            const line = `[${timestamp}] [${level}] ${message}\n`;
            fs.appendFileSync(logFile, line);
            if (config.verbose) {
                console.log(line.trim());
            }
        };
        // Run main loop with UI callbacks
        const result = await runMainLoop(config, paths, {
            log,
            onSprintStart: (sprint, sprintInfo, index, total) => {
                resetStages();
                startSprint(sprint, sprintInfo || {
                    number: sprint,
                    name: `Sprint ${sprint}`,
                    deliverables: [],
                    useCases: [],
                });
                setStage('WORKING', `Starting sprint ${sprint}`);
            },
            onSprintComplete: (sprint, phaseResult) => {
                completeSprint(sprint, phaseResult);
                addActivity({
                    type: phaseResult.status === 'passed' ? 'result' : 'error',
                    detail: `Sprint ${sprint}: ${phaseResult.status}`,
                    timestamp: new Date(),
                });
            },
            onActivity: (activity) => {
                addActivity(activity);
                // Track agent from activity
                if (activity.type === 'agent') {
                    const agentMatch = activity.detail.match(/^([\w-]+)/);
                    if (agentMatch) {
                        setAgent(agentMatch[1]);
                    }
                }
            },
            onStageChange: (stage, description) => {
                setStage(stage, description);
            },
            onTokenUpdate: (tokens) => {
                updateTokens(tokens);
            },
            onError: (error) => {
                setError(error);
            },
            onBudgetWarning: (used, budget) => {
                addActivity({
                    type: 'info',
                    detail: `Budget warning: $${used.toFixed(2)} / $${budget}`,
                    timestamp: new Date(),
                });
            },
            onBudgetExceeded: (used, budget) => {
                setError(`Budget exceeded: $${used.toFixed(2)} / $${budget}`);
                setMode('paused');
            },
            onComplete: (results) => {
                setMode('completed');
            },
        });
        // Handle completion
        if (result.success) {
            setMode('completed');
            // Give time for final UI update
            await sleep(1000);
            // Show completion banner
            console.clear();
            showCompletionBanner(result.sprintsCompleted.length, result.duration, result.totalTokens, result.totalCost);
            // Show log path
            console.log(`\x1b[2m  Logs: ${paths.logDir}/\x1b[0m`);
            console.log('');
        }
        else {
            setMode('failed');
            // Give time for final UI update
            await sleep(1000);
            // Show failure banner
            console.clear();
            showFailureBanner(result.sprintsFailed[0] || 0, result.error || 'Unknown error');
        }
        // Exit the app
        exit();
    }, [config, paths, init, startSprint, completeSprint, setStage, addActivity, setAgent, updateTokens, setError, setMode, resetStages, exit]);
    // Start on mount
    useEffect(() => {
        if (!config.dryRun) {
            runAutopilot();
        }
    }, [runAutopilot, config.dryRun]);
    return _jsx(App, { config: config });
}
/**
 * Wrapped runner with provider
 */
function AutopilotApp({ config }) {
    return (_jsx(AutopilotProvider, { children: _jsx(AutopilotRunner, { config: config }) }));
}
/**
 * Main entry point
 */
async function main() {
    // Parse CLI arguments
    const config = parseArgs();
    // Validate environment
    await validateEnvironment(config);
    // Clear screen and render Ink app (header is shown by Ink component)
    console.clear();
    const { waitUntilExit } = render(_jsx(AutopilotApp, { config: config }));
    // Wait for app to exit
    await waitUntilExit();
}
// Run main
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map