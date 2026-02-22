import React from 'react';
import { Box, Text } from 'ink';
import type { CompletedStage } from '../types/events.js';

export interface StageProgressProps {
  completedStages: CompletedStage[];
}

/**
 * Display completed stages with their durations
 */
export function StageProgress({ completedStages }: StageProgressProps) {
  if (completedStages.length === 0) {
    return null;
  }

  return (
    <Box flexDirection="column">
      {completedStages.map((stage, i) => (
        <Box key={i}>
          <Text dimColor>✓ {stage.name.padEnd(10)}</Text>
          <Box flexGrow={1} />
          <Text dimColor>{stage.duration}</Text>
        </Box>
      ))}
    </Box>
  );
}

export default StageProgress;
