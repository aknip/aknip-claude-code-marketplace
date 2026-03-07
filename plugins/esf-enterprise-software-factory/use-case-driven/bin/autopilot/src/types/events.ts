/**
 * Stream event types from Claude CLI --output-format stream-json
 */

// Base event structure
export interface BaseEvent {
  type: string;
}

// System init event
export interface InitEvent extends BaseEvent {
  type: 'system';
  subtype: 'init';
  model: string;
  cwd: string;
  session_id: string;
}

// Tool use event within assistant message
export interface ToolUseContent {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

// Text content within assistant message
export interface TextContent {
  type: 'text';
  text: string;
}

// Assistant message event
export interface AssistantEvent extends BaseEvent {
  type: 'assistant';
  message: {
    id: string;
    role: 'assistant';
    content: (ToolUseContent | TextContent)[];
    model: string;
    stop_reason: string | null;
    usage?: {
      input_tokens: number;
      output_tokens: number;
      cache_read_input_tokens?: number;
    };
  };
}

// User/tool result event
export interface UserEvent extends BaseEvent {
  type: 'user';
  tool_use_result?: {
    type: string;
    file?: {
      filePath: string;
      numLines: number;
    };
  };
}

// Final result event
export interface ResultEvent extends BaseEvent {
  type: 'result';
  subtype?: string;
  is_error: boolean;
  num_turns: number;
  total_cost_usd: number;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_read_input_tokens: number;
  };
}

// Error event
export interface ErrorEvent extends BaseEvent {
  type: 'error';
  error?: {
    message: string;
    code?: string;
  };
  message?: string;
}

// Union type for all raw events from Claude CLI
export type ClaudeStreamEvent =
  | InitEvent
  | AssistantEvent
  | UserEvent
  | ResultEvent
  | ErrorEvent;

// Simplified/normalized events for UI consumption
export type StreamEvent =
  | { type: 'init'; model: string; sessionId: string }
  | { type: 'tool_use'; tool: ToolName; detail: string; toolId: string }
  | { type: 'tool_result'; toolId: string; success: boolean }
  | { type: 'text'; content: string }
  | { type: 'thinking'; summary: string }
  | { type: 'subagent_start'; agent: string; detail: string; toolId: string }
  | { type: 'result'; turns: number; cost: number; tokens: number; isError: boolean }
  | { type: 'error'; message: string }
  | { type: 'rate_limit'; resetTime: Date; message: string };

// Known tool names
export type ToolName =
  | 'Read'
  | 'Write'
  | 'Edit'
  | 'Bash'
  | 'Glob'
  | 'Grep'
  | 'Task'
  | 'Agent'
  | 'TaskCreate'
  | 'TaskUpdate'
  | 'TaskList'
  | 'ToolSearch'
  | 'Skill'
  | 'WebFetch'
  | 'WebSearch'
  | 'AskUserQuestion'
  | string;

// Activity type for display
export type ActivityType =
  | 'read'
  | 'write'
  | 'edit'
  | 'bash'
  | 'agent'
  | 'search'
  | 'text'
  | 'result'
  | 'error'
  | 'info'
  | 'commit'
  | 'test'
  | 'retry'
  | 'waiting';

// Activity entry for feed
export interface ActivityEntry {
  type: ActivityType;
  detail: string;
  timestamp: Date;
}

// Stage names for progress tracking
export type StageName =
  | 'RESEARCH'
  | 'PLANNING'
  | 'CHECKING'
  | 'BUILDING'
  | 'VERIFYING'
  | 'WORKING'
  | 'WAITING';

// Completed stage info
export interface CompletedStage {
  name: StageName;
  duration: string; // "M:SS" format
}
