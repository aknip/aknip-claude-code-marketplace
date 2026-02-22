import { useState, useCallback } from 'react';
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

export function useActivityLog(
  options: UseActivityLogOptions = {}
): UseActivityLogReturn {
  const { maxEntries = 10 } = options;
  const [activities, setActivities] = useState<ActivityEntry[]>([]);

  const add = useCallback(
    (type: ActivityType, detail: string) => {
      const entry: ActivityEntry = {
        type,
        detail,
        timestamp: new Date(),
      };
      setActivities((prev) => {
        const next = [...prev, entry];
        // Keep only last N entries (ring buffer behavior)
        return next.slice(-maxEntries);
      });
    },
    [maxEntries]
  );

  const addEntry = useCallback(
    (entry: ActivityEntry) => {
      setActivities((prev) => {
        const next = [...prev, entry];
        return next.slice(-maxEntries);
      });
    },
    [maxEntries]
  );

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
export function createActivity(
  type: ActivityType,
  detail: string
): ActivityEntry {
  return {
    type,
    detail,
    timestamp: new Date(),
  };
}

/**
 * Format activity for display
 */
export function formatActivity(entry: ActivityEntry): string {
  const icon = getActivityIcon(entry.type);
  const type = entry.type.padEnd(6);
  return `${icon} ${type} ${entry.detail}`;
}

/**
 * Get icon for activity type
 */
function getActivityIcon(type: ActivityType): string {
  const icons: Record<ActivityType, string> = {
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
export function timeSinceLastActivity(
  activities: ActivityEntry[]
): number | null {
  if (activities.length === 0) return null;
  const last = activities[activities.length - 1];
  return Math.floor((Date.now() - last.timestamp.getTime()) / 1000);
}
