import React from 'react';
import { Box, Text } from 'ink';
import { formatTokens, formatCost } from '../utils/format.js';

export interface TokenCounterProps {
  tokens: number;
  cost?: number;
  showCost?: boolean;
}

/**
 * Token and cost counter display
 */
export function TokenCounter({ tokens, cost, showCost = false }: TokenCounterProps) {
  if (tokens === 0) {
    return null;
  }

  return (
    <Box>
      <Text dimColor>Tokens: {formatTokens(tokens)}</Text>
      {showCost && cost !== undefined && cost > 0 && (
        <Text dimColor> | Cost: {formatCost(cost)}</Text>
      )}
    </Box>
  );
}

export default TokenCounter;
