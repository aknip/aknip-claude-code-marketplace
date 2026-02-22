import React from 'react';
import { Box, Text } from 'ink';

export interface HeaderProps {
  projectName?: string;
  currentPhase: number;
  totalPhases: number;
}

/**
 * Header component showing "UC AUTOPILOT" and phase counter
 */
export function Header({ projectName, currentPhase, totalPhases }: HeaderProps) {
  return (
    <Box flexDirection="column">
      <Box>
        <Text bold color="cyan">
          # UC AUTOPILOT
        </Text>
        <Box flexGrow={1} />
        <Text>
          Phase {currentPhase}/{totalPhases}
        </Text>
      </Box>
      {projectName && (
        <Text dimColor>{projectName}</Text>
      )}
    </Box>
  );
}

export default Header;
