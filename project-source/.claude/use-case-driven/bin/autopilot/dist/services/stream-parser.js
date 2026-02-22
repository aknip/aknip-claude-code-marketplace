import { createInterface } from 'node:readline';
/**
 * Parse Claude CLI stream-json output into normalized events
 *
 * The Claude CLI with --output-format stream-json outputs newline-delimited JSON (NDJSON).
 * Each line is a complete JSON object representing a streaming event.
 */
export async function* parseStream(stdout) {
    const rl = createInterface({
        input: stdout,
        crlfDelay: Infinity,
    });
    for await (const line of rl) {
        // Skip empty lines
        if (!line.trim())
            continue;
        // Try to parse as JSON
        let event;
        try {
            event = JSON.parse(line);
        }
        catch {
            // Non-JSON line (stderr or other output) - skip
            continue;
        }
        // Process and yield normalized events
        for (const normalized of normalizeEvent(event)) {
            yield normalized;
        }
    }
}
/**
 * Normalize raw Claude events into simplified UI events
 */
function* normalizeEvent(event) {
    switch (event.type) {
        case 'system':
            if (event.subtype === 'init') {
                yield {
                    type: 'init',
                    model: event.model,
                    sessionId: event.session_id,
                };
            }
            break;
        case 'assistant':
            // Process each content block
            for (const content of event.message.content) {
                if (content.type === 'text') {
                    const textContent = content;
                    const summary = extractTextSummary(textContent.text);
                    if (summary) {
                        yield {
                            type: 'thinking',
                            summary,
                        };
                    }
                }
                else if (content.type === 'tool_use') {
                    const toolContent = content;
                    yield {
                        type: 'tool_use',
                        tool: toolContent.name,
                        detail: extractToolDetail(toolContent.name, toolContent.input),
                        toolId: toolContent.id,
                    };
                }
            }
            break;
        case 'user':
            // Tool result event
            if (event.tool_use_result) {
                // We don't have the tool ID in user events, so emit a generic result
                yield {
                    type: 'text',
                    content: 'Tool completed',
                };
            }
            break;
        case 'result':
            const tokens = event.usage.input_tokens +
                event.usage.output_tokens +
                (event.usage.cache_read_input_tokens || 0);
            yield {
                type: 'result',
                turns: event.num_turns,
                cost: event.total_cost_usd,
                tokens,
                isError: event.is_error,
            };
            break;
        case 'error':
            const errorMsg = event.error?.message || event.message || 'Unknown error';
            // Check for rate limit errors
            const rateLimitInfo = parseRateLimitMessage(errorMsg);
            if (rateLimitInfo) {
                yield {
                    type: 'rate_limit',
                    resetTime: rateLimitInfo.resetTime,
                    message: errorMsg,
                };
            }
            else {
                yield {
                    type: 'error',
                    message: errorMsg,
                };
            }
            break;
    }
}
/**
 * Extract a short summary from Claude's thinking text
 */
function extractTextSummary(text, maxLen = 60) {
    // Remove leading/trailing whitespace and newlines
    const cleaned = text.replace(/\n/g, ' ').trim();
    // Skip very short fragments
    if (cleaned.length < 10)
        return null;
    // Skip tool call announcements (these are redundant)
    if (/^(Let me|I'll|I will|Now I)/i.test(cleaned))
        return null;
    // Truncate if needed
    if (cleaned.length > maxLen) {
        return cleaned.slice(0, maxLen - 3) + '...';
    }
    return cleaned;
}
/**
 * Extract a human-readable detail string from tool input
 */
function extractToolDetail(toolName, input) {
    switch (toolName) {
        case 'Read': {
            const filePath = input.file_path;
            if (filePath) {
                const parts = filePath.split('/');
                const filename = parts.pop() || '';
                const parent = parts.pop() || '';
                return parent ? `${parent}/${filename}` : filename;
            }
            return '(file)';
        }
        case 'Write': {
            const filePath = input.file_path;
            if (filePath) {
                return filePath.split('/').pop() || '(new file)';
            }
            return '(new file)';
        }
        case 'Edit': {
            const filePath = input.file_path;
            if (filePath) {
                return filePath.split('/').pop() || '(file)';
            }
            return '(file)';
        }
        case 'Bash': {
            const desc = input.description;
            const cmd = input.command;
            if (desc)
                return truncate(desc, 45);
            if (cmd)
                return truncate(cmd.split('\n')[0], 45);
            return '(command)';
        }
        case 'Task': {
            const agentType = input.subagent_type;
            const desc = input.description;
            if (agentType) {
                const friendly = getAgentDisplayName(agentType);
                if (desc)
                    return `${friendly}: ${truncate(desc, 35)}`;
                return friendly;
            }
            return '(spawning agent)';
        }
        case 'Grep': {
            const pattern = input.pattern;
            if (pattern)
                return `grep: ${truncate(pattern, 35)}`;
            return 'grep';
        }
        case 'Glob': {
            const pattern = input.pattern;
            if (pattern)
                return `glob: ${truncate(pattern, 35)}`;
            return 'glob';
        }
        case 'TaskCreate':
        case 'TaskUpdate':
        case 'TaskList':
            return 'Managing tasks...';
        case 'WebFetch': {
            const url = input.url;
            if (url)
                return `fetch: ${truncate(url, 35)}`;
            return 'web request';
        }
        case 'WebSearch': {
            const query = input.query;
            if (query)
                return `search: ${truncate(query, 35)}`;
            return 'web search';
        }
        default:
            return toolName;
    }
}
/**
 * Get friendly display name for agent types
 */
function getAgentDisplayName(agentType) {
    const names = {
        'uc-phase-researcher': 'Researching',
        'uc-planner': 'Planning',
        'uc-checker': 'Checking',
        'uc-executor': 'Executing',
        'uc-verifier': 'Verifying',
        'Explore': 'Exploring',
        'Plan': 'Planning',
        'Bash': 'Shell',
    };
    return names[agentType] || agentType;
}
/**
 * Truncate string to max length with ellipsis
 */
function truncate(str, maxLen) {
    if (str.length <= maxLen)
        return str;
    return str.slice(0, maxLen - 3) + '...';
}
/**
 * Parse rate limit reset time from error message
 * Examples:
 * - "rate limit exceeded, resets 10pm"
 * - "rate limit exceeded, resets at 10:30pm"
 * - "rate limit exceeded, resets in 5 minutes"
 * - "Rate limited. Try again at 2024-02-15T15:30:00Z"
 */
export function parseRateLimitMessage(message) {
    // Check if this is a rate limit message
    if (!/rate.?limit/i.test(message)) {
        return null;
    }
    const now = new Date();
    // Try to parse "resets Xpm/am" or "resets at Xpm/am" format
    const timeMatch = message.match(/resets\s+(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        const period = timeMatch[3].toLowerCase();
        // Convert to 24-hour format
        if (period === 'pm' && hours !== 12) {
            hours += 12;
        }
        else if (period === 'am' && hours === 12) {
            hours = 0;
        }
        const resetTime = new Date(now);
        resetTime.setHours(hours, minutes, 0, 0);
        // If the time is in the past, assume it's tomorrow
        if (resetTime <= now) {
            resetTime.setDate(resetTime.getDate() + 1);
        }
        return { resetTime };
    }
    // Try to parse "resets in X minutes/hours" format
    const durationMatch = message.match(/resets\s+in\s+(\d+)\s*(minute|hour|second)s?/i);
    if (durationMatch) {
        const amount = parseInt(durationMatch[1], 10);
        const unit = durationMatch[2].toLowerCase();
        const resetTime = new Date(now);
        switch (unit) {
            case 'second':
                resetTime.setSeconds(resetTime.getSeconds() + amount);
                break;
            case 'minute':
                resetTime.setMinutes(resetTime.getMinutes() + amount);
                break;
            case 'hour':
                resetTime.setHours(resetTime.getHours() + amount);
                break;
        }
        return { resetTime };
    }
    // Try to parse ISO timestamp format
    const isoMatch = message.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?)/);
    if (isoMatch) {
        const resetTime = new Date(isoMatch[1]);
        if (!isNaN(resetTime.getTime())) {
            return { resetTime };
        }
    }
    // Rate limit detected but couldn't parse time - default to 5 minutes
    const defaultResetTime = new Date(now);
    defaultResetTime.setMinutes(defaultResetTime.getMinutes() + 5);
    return { resetTime: defaultResetTime };
}
/**
 * Map tool name to activity type for display
 */
export function toolToActivityType(tool) {
    switch (tool) {
        case 'Read':
            return 'read';
        case 'Write':
            return 'write';
        case 'Edit':
            return 'edit';
        case 'Bash':
            return 'bash';
        case 'Task':
            return 'agent';
        case 'Grep':
        case 'Glob':
        case 'WebFetch':
        case 'WebSearch':
            return 'search';
        default:
            return 'info';
    }
}
/**
 * Map agent subtype to stage name
 */
export function agentToStageName(agentType) {
    switch (agentType) {
        case 'uc-phase-researcher':
            return 'RESEARCH';
        case 'uc-planner':
            return 'PLANNING';
        case 'uc-checker':
            return 'CHECKING';
        case 'uc-executor':
            return 'BUILDING';
        case 'uc-verifier':
            return 'VERIFYING';
        default:
            return 'WORKING';
    }
}
//# sourceMappingURL=stream-parser.js.map