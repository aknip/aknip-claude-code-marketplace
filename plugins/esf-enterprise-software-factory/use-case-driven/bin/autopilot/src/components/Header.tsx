import React from 'react';
import { Box, Text } from 'ink';

export interface HeaderProps {
  projectName?: string;
  currentSprint: number;
  totalSprints: number;
}

/**
 * Header component showing "UC AUTOPILOT" and sprint counter
 */
export function Header({ projectName, currentSprint, totalSprints }: HeaderProps) {
  return (
    <Box flexDirection="column">
      <Box>
        <Text bold color="cyan">
          # UC AUTOPILOT
        </Text>
        <Box flexGrow={1} />
        <Text>
          Sprint {currentSprint}/{totalSprints}
        </Text>
      </Box>
      {projectName && (
        <Text dimColor>{projectName}</Text>
      )}
    </Box>
  );
}

export default Header;
