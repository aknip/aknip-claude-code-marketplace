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
export declare function createCostTracker(): CostTrackerState;
/**
 * Estimate cost from token count
 * Uses approximate rates: ~$9/1M tokens (average of input/output)
 */
export declare function estimateCostCents(tokens: number): number;
/**
 * Track tokens and cost for a sprint
 */
export declare function trackPhase(tracker: CostTrackerState, sprint: number, tokens: number, costCents?: number): void;
/**
 * Get total cost in dollars
 */
export declare function getTotalCostDollars(tracker: CostTrackerState): number;
/**
 * Format cost for display
 */
export declare function formatCost(costCents: number): string;
/**
 * Check if budget is exceeded
 */
export declare function isBudgetExceeded(tracker: CostTrackerState, budgetDollars: number): boolean;
/**
 * Get budget warning threshold (80%)
 */
export declare function isBudgetWarning(tracker: CostTrackerState, budgetDollars: number): boolean;
/**
 * Get budget usage percentage
 */
export declare function getBudgetUsagePercent(tracker: CostTrackerState, budgetDollars: number): number;
/**
 * Extract tokens from Claude log file
 */
export declare function extractTokensFromLog(logFile: string): Promise<number>;
/**
 * Get cost summary as string
 */
export declare function getCostSummary(tracker: CostTrackerState): string;
//# sourceMappingURL=cost-tracker.d.ts.map