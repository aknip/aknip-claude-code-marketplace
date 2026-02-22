import type { ActivityEntry } from '../types/events.js';
export interface ActivityFeedProps {
    activities: ActivityEntry[];
    maxLines?: number;
    showEmptyState?: boolean;
    staleThreshold?: number;
    lastActivityTime?: Date | null;
}
/**
 * Activity feed showing recent actions
 */
export declare function ActivityFeed({ activities, maxLines, showEmptyState, staleThreshold, lastActivityTime, }: ActivityFeedProps): import("react/jsx-runtime").JSX.Element;
export default ActivityFeed;
//# sourceMappingURL=ActivityFeed.d.ts.map