#!/usr/bin/env node
import React, { useEffect, useCallback, useRef } from 'react';
import { render, useApp } from 'ink';
import fs from 'fs-extra';
import path from 'node:path';
import { App } from './App.js';
import { getDerivedPaths } from './types/config.js';
import { AutopilotProvider, useAutopilot } from './context/autopilot-context.js';
import { runMainLoop } from './execution/main-loop.js';
import { loadSprintInfo } from './services/sprint-loader.js';
import {
  parseArgs,
  validateEnvironment,
  showCompletionBanner,
  showFailureBanner,
  sleep,
} from './cli.js';
import type { AutopilotConfig } from './types/config.js';
import type { SprintInfo, SprintResult } from './types/config.js';
import type { ActivityEntry, StageName } from './types/events.js';

/**
 * Active autopilot runner with UI integration
 */
function AutopilotRunner({ config }: { config: AutopilotConfig }) {
  const { exit } = useApp();
  const {
    init,
    startSprint,
    completeSprint,
    setSubSprint,
    completeSubSprint,
    setStage,
    addActivity,
    setAgent,
    updateTokens,
    setError,
    setMode,
    resetStages,
  } = useAutopilot();

  const paths = getDerivedPaths(config.projectDir);
  const hasStarted = useRef(false);

  // Run the main loop
  const runAutopilot = useCallback(async () => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    // Initialize UI state
    init(config, config.sprints.length);

    // Create log file
    const logFile = path.join(
      paths.logDir,
      `autopilot-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.log`
    );

    const log = (level: string, message: string) => {
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

      onSprintStart: (sprint: number, sprintInfo: SprintInfo | null, index: number, total: number) => {
        resetStages();
        startSprint(sprint, sprintInfo || {
          number: sprint,
          name: `Sprint ${sprint}`,
          deliverables: [],
          useCases: [],
        });
        setStage('WORKING', `Starting sprint ${sprint}`);
      },

      onSprintComplete: (sprint: number, phaseResult: SprintResult) => {
        completeSprint(sprint, phaseResult);
        addActivity({
          type: phaseResult.status === 'passed' ? 'result' : 'error',
          detail: `Sprint ${sprint}: ${phaseResult.status}`,
          timestamp: new Date(),
        });
      },

      onActivity: (activity: ActivityEntry) => {
        addActivity(activity);

        // Track agent from activity
        if (activity.type === 'agent') {
          const agentMatch = activity.detail.match(/^([\w-]+)/);
          if (agentMatch) {
            setAgent(agentMatch[1]);
          }
        }

        // Detect sub-sprint progress from text events
        if (activity.type === 'text') {
          const subSprintMatch = activity.detail.match(/(?:Sub-Sprint|sub-sprint|WAVE)\s+(\d+)\s+(?:of|von)\s+(\d+)/i);
          if (subSprintMatch) {
            const current = parseInt(subSprintMatch[1], 10);
            const total = parseInt(subSprintMatch[2], 10);
            setSubSprint(current, total);
          }

          // Detect sub-sprint completion
          if (/(?:sub-sprint|wave)\s+\d+\s+(?:complete|done|finished)/i.test(activity.detail)) {
            completeSubSprint();
          }
        }

        // Clear agent when subagent completes (result activity with "done" from subagent)
        if (activity.type === 'result' && activity.detail.includes(' done (')) {
          setAgent(null);
        }
      },

      onStageChange: (stage: StageName, description: string) => {
        setStage(stage, description);
      },

      onTokenUpdate: (tokens: number) => {
        updateTokens(tokens);
      },

      onError: (error: string) => {
        setError(error);
      },

      onBudgetWarning: (used: number, budget: number) => {
        addActivity({
          type: 'info',
          detail: `Budget warning: $${used.toFixed(2)} / $${budget}`,
          timestamp: new Date(),
        });
      },

      onBudgetExceeded: (used: number, budget: number) => {
        setError(`Budget exceeded: $${used.toFixed(2)} / $${budget}`);
        setMode('paused');
      },

      onComplete: (results: SprintResult[]) => {
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
      showCompletionBanner(
        result.sprintsCompleted.length,
        result.duration,
        result.totalTokens,
        result.totalCost
      );

      // Show log path
      console.log(`\x1b[2m  Logs: ${paths.logDir}/\x1b[0m`);
      console.log('');
    } else {
      setMode('failed');

      // Give time for final UI update
      await sleep(1000);

      // Show failure banner
      console.clear();
      showFailureBanner(
        result.sprintsFailed[0] || 0,
        result.error || 'Unknown error'
      );
    }

    // Exit the app
    exit();
  }, [config, paths, init, startSprint, completeSprint, setSubSprint, completeSubSprint, setStage, addActivity, setAgent, updateTokens, setError, setMode, resetStages, exit]);

  // Start on mount
  useEffect(() => {
    if (!config.dryRun) {
      runAutopilot();
    }
  }, [runAutopilot, config.dryRun]);

  return <App config={config} />;
}

/**
 * Wrapped runner with provider
 */
function AutopilotApp({ config }: { config: AutopilotConfig }) {
  return (
    <AutopilotProvider>
      <AutopilotRunner config={config} />
    </AutopilotProvider>
  );
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  // Parse CLI arguments
  const config = parseArgs();

  // Validate environment
  await validateEnvironment(config);

  // Clear screen and render Ink app (header is shown by Ink component)
  console.clear();

  const { waitUntilExit } = render(<AutopilotApp config={config} />);

  // Wait for app to exit
  await waitUntilExit();
}

// Run main
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
