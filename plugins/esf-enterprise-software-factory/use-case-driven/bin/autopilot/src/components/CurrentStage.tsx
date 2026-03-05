import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import type { StageName } from '../types/events.js';
import type { AutopilotState } from '../types/config.js';

export interface CurrentStageProps {
  mode: AutopilotState['mode'];
  stage: StageName | null;
  description?: string;
  elapsed?: string;
  agent?: string | null;
}

/**
 * Get agent display info
 */
function getAgentDisplay(agent: string): { icon: string; name: string } {
  const agents: Record<string, { icon: string; name: string }> = {
    'uc-sprint-researcher': { icon: '🔬', name: 'Sprint Researcher' },
    'uc-planner': { icon: '📋', name: 'Planner' },
    'uc-checker': { icon: '✅', name: 'Checker' },
    'uc-executor': { icon: '🔨', name: 'Executor' },
    'uc-verifier': { icon: '🔍', name: 'Verifier' },
    'Explore': { icon: '🧭', name: 'Explorer' },
    'Plan': { icon: '🗺️', name: 'Planner' },
    'Bash': { icon: '⚡', name: 'Shell' },
  };
  return agents[agent] || { icon: '🤖', name: agent };
}

/**
 * Current stage display with spinner and status
 */
export function CurrentStage({
  mode,
  stage,
  description,
  elapsed,
  agent,
}: CurrentStageProps) {
  return (
    <Box flexDirection="column">
      {/* Stage header with spinner */}
      <Box>
        <Text bold>## </Text>
        {mode === 'running' && (
          <>
            <Text color="green">
              <Spinner type="dots" />
            </Text>
            <Text bold> {stage || 'WORKING'}</Text>
            {elapsed && <Text> {elapsed}</Text>}
          </>
        )}
        {mode === 'idle' && <Text bold>READY</Text>}
        {mode === 'paused' && (
          <Text bold color="yellow">
            PAUSED
          </Text>
        )}
        {mode === 'completed' && (
          <Text bold color="green">
            COMPLETED
          </Text>
        )}
        {mode === 'failed' && (
          <Text bold color="red">
            FAILED
          </Text>
        )}
      </Box>

      {/* Current agent */}
      {agent && mode === 'running' && (
        <Box marginTop={1}>
          <Text color="cyan">
            Agent:{' '}
            <Text color="white">
              {getAgentDisplay(agent).icon} {getAgentDisplay(agent).name}
            </Text>
          </Text>
        </Box>
      )}

      {/* Stage description */}
      {description && (
        <Text dimColor>
          {description.length > 58 ? description.slice(0, 55) + '...' : description}
        </Text>
      )}
    </Box>
  );
}

export default CurrentStage;
