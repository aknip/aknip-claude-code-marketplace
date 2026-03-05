import React from 'react';
import { Box, Text } from 'ink';
import type { SprintInfo as SprintInfoType } from '../types/config.js';

export interface SprintInfoProps {
  sprint: number;
  info: SprintInfoType | null;
  maxDeliverables?: number;
}

/**
 * Sprint information display showing name, goal, and key deliverables
 */
export function SprintInfo({ sprint, info, maxDeliverables = 3 }: SprintInfoProps) {
  if (!info) {
    return (
      <Box flexDirection="column">
        <Text bold>## SPRINT {sprint}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text bold>
        ## SPRINT {sprint}: {info.name}
      </Text>
      <Text> </Text>
      {info.goal && <Text dimColor>{info.goal}</Text>}
      {info.deliverables.slice(0, maxDeliverables).map((d, i) => (
        <Text key={i} dimColor>
          {'  '}{d}
        </Text>
      ))}
    </Box>
  );
}

export default SprintInfo;
