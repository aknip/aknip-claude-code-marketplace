import React from 'react';
import { Box, Text } from 'ink';
import { useAutopilot } from './context/autopilot-context.js';
import { Header } from './components/Header.js';
import { PhaseInfo } from './components/PhaseInfo.js';
import { StageProgress } from './components/StageProgress.js';
import { CurrentStage } from './components/CurrentStage.js';
import { ActivityFeed } from './components/ActivityFeed.js';
import { ProgressBar } from './components/ProgressBar.js';
import { TokenCounter } from './components/TokenCounter.js';
import { useTimer } from './hooks/useTimer.js';
import type { AutopilotConfig } from './types/config.js';

/**
 * Main autopilot display component
 */
function AutopilotDisplay({ config }: { config: AutopilotConfig }) {
  const { state } = useAutopilot();

  const {
    mode,
    currentPhase,
    phaseInfo,
    totalPhases,
    phasesCompleted,
    currentStage,
    stageDescription,
    stageStartTime,
    completedStages,
    activities,
    tokens,
    cost,
    currentAgent,
    lastError,
  } = state;

  // Note: init is called in index.tsx by AutopilotRunner, not here

  // Stage timer
  const stageTimer = useTimer({
    startTime: stageStartTime || undefined,
    autoStart: !!stageStartTime,
  });

  // Calculate progress
  const completed = phasesCompleted.length;
  const displayPhase = currentPhase ? completed + 1 : 0;

  // Get last activity time for stale detection
  const lastActivityTime =
    activities.length > 0 ? activities[activities.length - 1].timestamp : null;

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Header
        projectName={config.projectName}
        currentPhase={displayPhase}
        totalPhases={totalPhases}
      />
      <Text> </Text>

      {/* Phase Info */}
      {currentPhase && (
        <>
          <PhaseInfo phase={currentPhase} info={phaseInfo} />
          <Text> </Text>
        </>
      )}

      {/* Completed Stages */}
      {completedStages.length > 0 && (
        <>
          <StageProgress completedStages={completedStages} />
          <Text> </Text>
        </>
      )}

      {/* Current Stage */}
      <CurrentStage
        mode={mode}
        stage={currentStage}
        description={stageDescription}
        elapsed={stageTimer.formatted}
        agent={currentAgent}
      />
      <Text> </Text>

      {/* Activity Feed */}
      <ActivityFeed
        activities={activities}
        maxLines={10}
        showEmptyState={mode === 'running'}
        lastActivityTime={lastActivityTime}
      />

      {/* Progress Bar */}
      <Text> </Text>
      <ProgressBar completed={completed} total={totalPhases} width={40} />

      {/* Token Counter */}
      <TokenCounter tokens={tokens} cost={cost} showCost={cost > 0} />

      {/* Error Display */}
      {lastError && (
        <>
          <Text> </Text>
          <Text color="red">Error: {lastError}</Text>
        </>
      )}
    </Box>
  );
}

/**
 * Props for App component
 */
export interface AppProps {
  config: AutopilotConfig;
}

/**
 * Main App component - uses existing AutopilotProvider from parent
 * Note: AutopilotProvider is created in index.tsx, not here
 */
export function App({ config }: AppProps) {
  return <AutopilotDisplay config={config} />;
}

export default App;
