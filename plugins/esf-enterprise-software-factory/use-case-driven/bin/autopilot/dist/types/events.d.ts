/**
 * Stream event types from Claude CLI --output-format stream-json
 */
export interface BaseEvent {
    type: string;
}
export interface InitEvent extends BaseEvent {
    type: 'system';
    subtype: 'init';
    model: string;
    cwd: string;
    session_id: string;
}
export interface ToolUseContent {
    type: 'tool_use';
    id: string;
    name: string;
    input: Record<string, unknown>;
}
export interface TextContent {
    type: 'text';
    text: string;
}
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
export interface ErrorEvent extends BaseEvent {
    type: 'error';
    error?: {
        message: string;
        code?: string;
    };
    message?: string;
}
export type ClaudeStreamEvent = InitEvent | AssistantEvent | UserEvent | ResultEvent | ErrorEvent;
export type StreamEvent = {
    type: 'init';
    model: string;
    sessionId: string;
} | {
    type: 'tool_use';
    tool: ToolName;
    detail: string;
    toolId: string;
} | {
    type: 'tool_result';
    toolId: string;
    success: boolean;
} | {
    type: 'text';
    content: string;
} | {
    type: 'thinking';
    summary: string;
} | {
    type: 'result';
    turns: number;
    cost: number;
    tokens: number;
    isError: boolean;
} | {
    type: 'error';
    message: string;
} | {
    type: 'rate_limit';
    resetTime: Date;
    message: string;
};
export type ToolName = 'Read' | 'Write' | 'Edit' | 'Bash' | 'Glob' | 'Grep' | 'Task' | 'TaskCreate' | 'TaskUpdate' | 'TaskList' | 'WebFetch' | 'WebSearch' | 'AskUserQuestion' | string;
export type ActivityType = 'read' | 'write' | 'edit' | 'bash' | 'agent' | 'search' | 'text' | 'result' | 'error' | 'info' | 'commit' | 'test' | 'retry' | 'waiting';
export interface ActivityEntry {
    type: ActivityType;
    detail: string;
    timestamp: Date;
}
export type StageName = 'RESEARCH' | 'PLANNING' | 'CHECKING' | 'BUILDING' | 'VERIFYING' | 'WORKING' | 'WAITING';
export interface CompletedStage {
    name: StageName;
    duration: string;
}
//# sourceMappingURL=events.d.ts.map