import React from 'react';
import { Box, Text } from 'ink';
import type { PhaseInfo as PhaseInfoType } from '../types/config.js';

export interface PhaseInfoProps {
  phase: number;
  info: PhaseInfoType | null;
  maxDeliverables?: number;
}

/**
 * Phase information display showing name, goal, and key deliverables
 */
export function PhaseInfo({ phase, info, maxDeliverables = 3 }: PhaseInfoProps) {
  if (!info) {
    return (
      <Box flexDirection="column">
        <Text bold>## PHASE {phase}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text bold>
        ## PHASE {phase}: {info.name}
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

export default PhaseInfo;
