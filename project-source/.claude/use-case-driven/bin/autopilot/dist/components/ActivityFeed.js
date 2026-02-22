import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { getActivityIcon, getActivityColor } from '../utils/icons.js';
import { truncate } from '../utils/format.js';
/**
 * Activity feed showing recent actions
 */
export function ActivityFeed({ activities, maxLines = 10, showEmptyState = true, staleThreshold = 30, lastActivityTime, }) {
    // Check for staleness
    const isStale = lastActivityTime &&
        Date.now() - lastActivityTime.getTime() > staleThreshold * 1000;
    const staleSeconds = lastActivityTime
        ? Math.floor((Date.now() - lastActivityTime.getTime()) / 1000)
        : 0;
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { children: "## Activity:" }), _jsx(Text, { children: " " }), isStale && (_jsxs(Text, { color: "yellow", children: ['⏳', " waiting for response (", staleSeconds, "s)"] })), activities.length === 0 && showEmptyState && (_jsx(Text, { dimColor: true, children: "starting..." })), activities.map((activity, i) => (_jsx(ActivityLine, { activity: activity }, i))), Array.from({ length: Math.max(0, maxLines - activities.length - (isStale ? 1 : 0)) }).map((_, i) => (_jsx(Text, { children: " " }, `pad-${i}`)))] }));
}
/**
 * Single activity line
 */
function ActivityLine({ activity }) {
    const icon = getActivityIcon(activity.type);
    const color = getActivityColor(activity.type);
    const typeStr = activity.type.padEnd(6);
    const detail = truncate(activity.detail, 50);
    return (_jsxs(Text, { color: color, children: [icon, " ", typeStr, " ", detail] }));
}
export default ActivityFeed;
//# sourceMappingURL=ActivityFeed.js.map