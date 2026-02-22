import type { ActivityEntry, ActivityType } from '../types/events.js';
/**
 * Ring buffer hook for activity log
 */
export interface UseActivityLogOptions {
    maxEntries?: number;
}
export interface UseActivityLogReturn {
    activities: ActivityEntry[];
    add: (type: ActivityType, detail: string) => void;
    addEntry: (entry: ActivityEntry) => void;
    clear: () => void;
    lastActivity: ActivityEntry | null;
}
export declare function useActivityLog(options?: UseActivityLogOptions): UseActivityLogReturn;
/**
 * Create activity entry helper
 */
export declare function createActivity(type: ActivityType, detail: string): ActivityEntry;
/**
 * Format activity for display
 */
export declare function formatActivity(entry: ActivityEntry): string;
/**
 * Calculate time since last activity
 */
export declare function timeSinceLastActivity(activities: ActivityEntry[]): number | null;
//# sourceMappingURL=useActivityLog.d.ts.map