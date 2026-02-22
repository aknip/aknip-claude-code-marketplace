import React from 'react';
import { Box, Text } from 'ink';
import type { ActivityEntry, ActivityType } from '../types/events.js';
import { getActivityIcon, getActivityColor } from '../utils/icons.js';
import { truncate } from '../utils/format.js';

export interface ActivityFeedProps {
  activities: ActivityEntry[];
  maxLines?: number;
  showEmptyState?: boolean;
  staleThreshold?: number; // seconds
  lastActivityTime?: Date | null;
}

/**
 * Activity feed showing recent actions
 */
export function ActivityFeed({
  activities,
  maxLines = 10,
  showEmptyState = true,
  staleThreshold = 30,
  lastActivityTime,
}: ActivityFeedProps) {
  // Check for staleness
  const isStale =
    lastActivityTime &&
    Date.now() - lastActivityTime.getTime() > staleThreshold * 1000;

  const staleSeconds = lastActivityTime
    ? Math.floor((Date.now() - lastActivityTime.getTime()) / 1000)
    : 0;

  return (
    <Box flexDirection="column">
      <Text>## Activity:</Text>
      <Text> </Text>

      {/* Stale warning */}
      {isStale && (
        <Text color="yellow">
          {'⏳'} waiting for response ({staleSeconds}s)
        </Text>
      )}

      {/* Empty state */}
      {activities.length === 0 && showEmptyState && (
        <Text dimColor>starting...</Text>
      )}

      {/* Activity entries */}
      {activities.map((activity, i) => (
        <ActivityLine key={i} activity={activity} />
      ))}

      {/* Padding for consistent height */}
      {Array.from({ length: Math.max(0, maxLines - activities.length - (isStale ? 1 : 0)) }).map(
        (_, i) => (
          <Text key={`pad-${i}`}> </Text>
        )
      )}
    </Box>
  );
}

interface ActivityLineProps {
  activity: ActivityEntry;
}

/**
 * Single activity line
 */
function ActivityLine({ activity }: ActivityLineProps) {
  const icon = getActivityIcon(activity.type);
  const color = getActivityColor(activity.type);
  const typeStr = activity.type.padEnd(6);
  const detail = truncate(activity.detail, 50);

  return (
    <Text color={color as any}>
      {icon} {typeStr} {detail}
    </Text>
  );
}

export default ActivityFeed;
