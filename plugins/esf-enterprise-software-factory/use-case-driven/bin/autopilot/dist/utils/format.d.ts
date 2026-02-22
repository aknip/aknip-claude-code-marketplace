/**
 * Formatting utilities for autopilot display
 */
/**
 * Format elapsed time as M:SS
 */
export declare function formatElapsed(start: Date, end?: Date): string;
/**
 * Format elapsed time from seconds as M:SS
 */
export declare function formatSeconds(seconds: number): string;
/**
 * Format elapsed time as Xm Ys
 */
export declare function formatDuration(seconds: number): string;
/**
 * Truncate string with ellipsis
 */
export declare function truncate(str: string, maxLen: number): string;
/**
 * Format token count with K suffix
 */
export declare function formatTokens(tokens: number): string;
/**
 * Format cost as USD
 */
export declare function formatCost(cost: number): string;
/**
 * Pad string to width
 */
export declare function padRight(str: string, width: number): string;
export declare function padLeft(str: string, width: number): string;
/**
 * Format timestamp as ISO
 */
export declare function isoTimestamp(date?: Date): string;
/**
 * Format timestamp as HH:MM:SS
 */
export declare function timeOnly(date?: Date): string;
/**
 * Calculate percentage
 */
export declare function percentage(value: number, total: number): number;
//# sourceMappingURL=format.d.ts.map