/**
 * Icon mappings for autopilot display
 */
import type { ActivityType, StageName } from '../types/events.js';
/**
 * Get emoji icon for activity type
 */
export declare function getActivityIcon(type: ActivityType): string;
/**
 * Get stage icon
 */
export declare function getStageIcon(stage: StageName): string;
/**
 * Get agent display info
 */
export declare function getAgentInfo(agent: string): {
    icon: string;
    name: string;
};
/**
 * Get status icon
 */
export declare function getStatusIcon(status: string): string;
/**
 * Get progress bar characters
 */
export declare const progressChars: {
    readonly filled: "━";
    readonly empty: "─";
    readonly leftBracket: "[";
    readonly rightBracket: "]";
};
/**
 * Get checkmark or X for boolean
 */
export declare function getBooleanIcon(value: boolean): string;
/**
 * Get spinner frames for animation
 */
export declare const spinnerFrames: readonly ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
/**
 * Get color name for activity type
 */
export declare function getActivityColor(type: ActivityType): string | undefined;
//# sourceMappingURL=icons.d.ts.map