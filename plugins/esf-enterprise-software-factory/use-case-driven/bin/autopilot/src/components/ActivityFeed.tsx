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
  activeAgent?: string | null;
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
  activeAgent,
}: ActivityFeedProps) {
  // Check for staleness
  const isStale =
    lastActivityTime &&
    Date.now() - lastActivityTime.getTime() > staleThreshold * 1000;

  const staleSeconds = lastActivityTime
    ? Math.floor((Date.now() - lastActivityTime.getTime()) / 1000)
    : 0;

  // Format stale duration as M:SS when > 60s
  const staleDuration = staleSeconds >= 60
    ? `${Math.floor(staleSeconds / 60)}:${(staleSeconds % 60).toString().padStart(2, '0')}`
    : `${staleSeconds}s`;

  // Build stale message based on context
  let staleMessage = `waiting for response (${staleDuration})`;
  if (activeAgent) {
    const agentName = getAgentFriendlyName(activeAgent);
    staleMessage = `${agentName} running (${staleDuration})`;
  }

  return (
    <Box flexDirection="column">
      <Text>## Activity:</Text>
      <Text> </Text>

      {/* Stale indicator with agent context */}
      {isStale && (
        <Text color={activeAgent ? 'cyan' : 'yellow'}>
          {activeAgent ? '🤖' : '⏳'} {staleMessage}
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

/**
 * Get a user-friendly name for an agent type
 */
function getAgentFriendlyName(agent: string): string {
  const names: Record<string, string> = {
    'uc-executor': 'Executor',
    'uc-verifier': 'Verifier',
    'uc-planner': 'Planner',
    'uc-checker': 'Checker',
    'uc-sprint-researcher': 'Researcher',
    'Explore': 'Explorer',
  };
  return names[agent] || agent;
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
