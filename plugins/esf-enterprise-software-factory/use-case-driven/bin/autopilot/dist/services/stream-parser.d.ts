import { Readable } from 'node:stream';
import type { StreamEvent, ToolName } from '../types/events.js';
/**
 * Parse Claude CLI stream-json output into normalized events
 *
 * The Claude CLI with --output-format stream-json outputs newline-delimited JSON (NDJSON).
 * Each line is a complete JSON object representing a streaming event.
 */
export declare function parseStream(stdout: Readable): AsyncGenerator<StreamEvent, void, unknown>;
/**
 * Parse rate limit reset time from error message
 * Examples:
 * - "rate limit exceeded, resets 10pm"
 * - "rate limit exceeded, resets at 10:30pm"
 * - "rate limit exceeded, resets in 5 minutes"
 * - "Rate limited. Try again at 2024-02-15T15:30:00Z"
 */
export declare function parseRateLimitMessage(message: string): {
    resetTime: Date;
} | null;
/**
 * Map tool name to activity type for display
 */
export declare function toolToActivityType(tool: ToolName): 'read' | 'write' | 'edit' | 'bash' | 'agent' | 'search' | 'info';
/**
 * Map agent subtype to stage name
 */
export declare function agentToStageName(agentType: string): 'RESEARCH' | 'PLANNING' | 'CHECKING' | 'BUILDING' | 'VERIFYING' | 'WORKING';
//# sourceMappingURL=stream-parser.d.ts.map