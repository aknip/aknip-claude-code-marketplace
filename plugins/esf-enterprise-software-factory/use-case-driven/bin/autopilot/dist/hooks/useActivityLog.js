import { useState, useCallback } from 'react';
export function useActivityLog(options = {}) {
    const { maxEntries = 10 } = options;
    const [activities, setActivities] = useState([]);
    const add = useCallback((type, detail) => {
        const entry = {
            type,
            detail,
            timestamp: new Date(),
        };
        setActivities((prev) => {
            const next = [...prev, entry];
            // Keep only last N entries (ring buffer behavior)
            return next.slice(-maxEntries);
        });
    }, [maxEntries]);
    const addEntry = useCallback((entry) => {
        setActivities((prev) => {
            const next = [...prev, entry];
            return next.slice(-maxEntries);
        });
    }, [maxEntries]);
    const clear = useCallback(() => {
        setActivities([]);
    }, []);
    const lastActivity = activities.length > 0 ? activities[activities.length - 1] : null;
    return {
        activities,
        add,
        addEntry,
        clear,
        lastActivity,
    };
}
/**
 * Create activity entry helper
 */
export function createActivity(type, detail) {
    return {
        type,
        detail,
        timestamp: new Date(),
    };
}
/**
 * Format activity for display
 */
export function formatActivity(entry) {
    const icon = getActivityIcon(entry.type);
    const type = entry.type.padEnd(6);
    return `${icon} ${type} ${entry.detail}`;
}
/**
 * Get icon for activity type
 */
function getActivityIcon(type) {
    const icons = {
        read: '📖',
        write: '📝',
        edit: '✏️ ',
        bash: '⚡',
        agent: '🤖',
        search: '🔍',
        text: '💭',
        result: '✅',
        error: '❌',
        info: 'ℹ️ ',
        commit: '💾',
        test: '🧪',
        retry: '🔄',
        waiting: '⏳',
    };
    return icons[type] || '   ';
}
/**
 * Calculate time since last activity
 */
export function timeSinceLastActivity(activities) {
    if (activities.length === 0)
        return null;
    const last = activities[activities.length - 1];
    return Math.floor((Date.now() - last.timestamp.getTime()) / 1000);
}
//# sourceMappingURL=useActivityLog.js.map