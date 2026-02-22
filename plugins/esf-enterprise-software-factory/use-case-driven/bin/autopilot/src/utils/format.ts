/**
 * Formatting utilities for autopilot display
 */

/**
 * Format elapsed time as M:SS
 */
export function formatElapsed(start: Date, end: Date = new Date()): string {
  const elapsed = Math.floor((end.getTime() - start.getTime()) / 1000);
  const min = Math.floor(elapsed / 60);
  const sec = elapsed % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

/**
 * Format elapsed time from seconds as M:SS
 */
export function formatSeconds(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

/**
 * Format elapsed time as Xm Ys
 */
export function formatDuration(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  if (min === 0) return `${sec}s`;
  return `${min}m ${sec}s`;
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

/**
 * Format token count with K suffix
 */
export function formatTokens(tokens: number): string {
  if (tokens >= 1000) {
    return `~${Math.floor(tokens / 1000)}K`;
  }
  return tokens.toString();
}

/**
 * Format cost as USD
 */
export function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`;
}

/**
 * Pad string to width
 */
export function padRight(str: string, width: number): string {
  return str.padEnd(width);
}

export function padLeft(str: string, width: number): string {
  return str.padStart(width);
}

/**
 * Format timestamp as ISO
 */
export function isoTimestamp(date: Date = new Date()): string {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Format timestamp as HH:MM:SS
 */
export function timeOnly(date: Date = new Date()): string {
  return date.toTimeString().substring(0, 8);
}

/**
 * Calculate percentage
 */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}
