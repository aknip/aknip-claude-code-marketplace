import fs from 'fs-extra';

/**
 * Cost tracking service for autopilot execution
 */
export interface CostTrackerState {
  totalTokens: number;
  totalCostCents: number;
  phaseTokens: Map<number, number>;
  phaseCosts: Map<number, number>;
}

/**
 * Create a new cost tracker
 */
export function createCostTracker(): CostTrackerState {
  return {
    totalTokens: 0,
    totalCostCents: 0,
    phaseTokens: new Map(),
    phaseCosts: new Map(),
  };
}

/**
 * Estimate cost from token count
 * Uses approximate rates: ~$9/1M tokens (average of input/output)
 */
export function estimateCostCents(tokens: number): number {
  return Math.ceil((tokens * 9) / 10000);
}

/**
 * Track tokens and cost for a sprint
 */
export function trackPhase(
  tracker: CostTrackerState,
  sprint: number,
  tokens: number,
  costCents?: number
): void {
  const cost = costCents ?? estimateCostCents(tokens);

  // Update sprint-specific tracking
  const prevTokens = tracker.phaseTokens.get(sprint) ?? 0;
  const prevCost = tracker.phaseCosts.get(sprint) ?? 0;

  tracker.phaseTokens.set(sprint, prevTokens + tokens);
  tracker.phaseCosts.set(sprint, prevCost + cost);

  // Update totals
  tracker.totalTokens += tokens;
  tracker.totalCostCents += cost;
}

/**
 * Get total cost in dollars
 */
export function getTotalCostDollars(tracker: CostTrackerState): number {
  return tracker.totalCostCents / 100;
}

/**
 * Format cost for display
 */
export function formatCost(costCents: number): string {
  const dollars = Math.floor(costCents / 100);
  const cents = costCents % 100;
  return `$${dollars}.${cents.toString().padStart(2, '0')}`;
}

/**
 * Check if budget is exceeded
 */
export function isBudgetExceeded(
  tracker: CostTrackerState,
  budgetDollars: number
): boolean {
  if (budgetDollars <= 0) return false; // 0 = unlimited
  return tracker.totalCostCents > budgetDollars * 100;
}

/**
 * Get budget warning threshold (80%)
 */
export function isBudgetWarning(
  tracker: CostTrackerState,
  budgetDollars: number
): boolean {
  if (budgetDollars <= 0) return false;
  const thresholdCents = budgetDollars * 80; // 80%
  return tracker.totalCostCents > thresholdCents;
}

/**
 * Get budget usage percentage
 */
export function getBudgetUsagePercent(
  tracker: CostTrackerState,
  budgetDollars: number
): number {
  if (budgetDollars <= 0) return 0;
  return Math.round((tracker.totalCostCents / (budgetDollars * 100)) * 100);
}

/**
 * Extract tokens from Claude log file
 */
export async function extractTokensFromLog(logFile: string): Promise<number> {
  try {
    const content = await fs.readFile(logFile, 'utf-8');

    // Try to extract from JSON result events
    const inputMatch = content.match(/"input_tokens":(\d+)/g);
    const outputMatch = content.match(/"output_tokens":(\d+)/g);

    let input = 0;
    let output = 0;

    if (inputMatch) {
      input = inputMatch.reduce((sum, m) => {
        const num = m.match(/\d+/)?.[0];
        return sum + (num ? parseInt(num, 10) : 0);
      }, 0);
    }

    if (outputMatch) {
      output = outputMatch.reduce((sum, m) => {
        const num = m.match(/\d+/)?.[0];
        return sum + (num ? parseInt(num, 10) : 0);
      }, 0);
    }

    // Also check for cache_read_input_tokens
    const cacheMatch = content.match(/"cache_read_input_tokens":(\d+)/g);
    let cache = 0;
    if (cacheMatch) {
      cache = cacheMatch.reduce((sum, m) => {
        const num = m.match(/\d+/)?.[0];
        return sum + (num ? parseInt(num, 10) : 0);
      }, 0);
    }

    return input + output + cache;
  } catch {
    return 0;
  }
}

/**
 * Get cost summary as string
 */
export function getCostSummary(tracker: CostTrackerState): string {
  const lines: string[] = [];

  lines.push(`Total Tokens: ${tracker.totalTokens.toLocaleString()}`);
  lines.push(`Total Cost: ${formatCost(tracker.totalCostCents)}`);

  if (tracker.phaseTokens.size > 0) {
    lines.push('');
    lines.push('By Sprint:');
    for (const [sprint, tokens] of tracker.phaseTokens) {
      const cost = tracker.phaseCosts.get(sprint) ?? 0;
      lines.push(`  Sprint ${sprint}: ${tokens.toLocaleString()} tokens (${formatCost(cost)})`);
    }
  }

  return lines.join('\n');
}
