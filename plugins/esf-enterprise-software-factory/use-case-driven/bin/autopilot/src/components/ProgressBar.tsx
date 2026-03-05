import React from 'react';
import { Box, Text } from 'ink';
import { progressChars } from '../utils/icons.js';

export interface ProgressBarProps {
  completed: number;
  total: number;
  width?: number;
  label?: string;
  showCount?: boolean;
}

/**
 * Progress bar component
 */
export function ProgressBar({
  completed,
  total,
  width = 40,
  label = 'Progress',
  showCount = true,
}: ProgressBarProps) {
  // Calculate filled portion
  const filled = total > 0 ? Math.floor((completed / total) * width) : 0;
  const empty = width - filled;

  return (
    <Box>
      <Text>## {label} </Text>
      <Text dimColor>{progressChars.leftBracket}</Text>
      <Text color="cyan">{progressChars.filled.repeat(filled)}</Text>
      <Text dimColor>{progressChars.empty.repeat(empty)}</Text>
      <Text dimColor>{progressChars.rightBracket}</Text>
      {showCount && (
        <Text>
          {' '}
          {completed}/{total} sprints
        </Text>
      )}
    </Box>
  );
}

/**
 * Compact inline progress bar
 */
export function InlineProgressBar({
  completed,
  total,
  width = 20,
}: Omit<ProgressBarProps, 'label' | 'showCount'>) {
  const filled = total > 0 ? Math.floor((completed / total) * width) : 0;
  const empty = width - filled;

  return (
    <Text>
      <Text dimColor>[</Text>
      <Text color="cyan">{progressChars.filled.repeat(filled)}</Text>
      <Text dimColor>{progressChars.empty.repeat(empty)}</Text>
      <Text dimColor>]</Text>
    </Text>
  );
}

export default ProgressBar;
