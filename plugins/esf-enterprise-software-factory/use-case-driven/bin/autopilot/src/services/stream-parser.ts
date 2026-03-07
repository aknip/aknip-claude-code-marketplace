import { Readable } from 'node:stream';
import { createInterface } from 'node:readline';
import type {
  ClaudeStreamEvent,
  StreamEvent,
  ToolName,
  ToolUseContent,
  TextContent,
} from '../types/events.js';

/**
 * Parse Claude CLI stream-json output into normalized events
 *
 * The Claude CLI with --output-format stream-json outputs newline-delimited JSON (NDJSON).
 * Each line is a complete JSON object representing a streaming event.
 */
export async function* parseStream(
  stdout: Readable
): AsyncGenerator<StreamEvent, void, unknown> {
  const rl = createInterface({
    input: stdout,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    // Skip empty lines
    if (!line.trim()) continue;

    // Try to parse as JSON
    let event: ClaudeStreamEvent;
    try {
      event = JSON.parse(line);
    } catch {
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
function* normalizeEvent(event: ClaudeStreamEvent): Generator<StreamEvent> {
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
          const textContent = content as TextContent;

          // Check for rate limit messages in assistant text
          const rateLimitInfo = parseRateLimitMessage(textContent.text);
          if (rateLimitInfo) {
            yield {
              type: 'rate_limit',
              resetTime: rateLimitInfo.resetTime,
              message: textContent.text,
            };
            // Don't process this text further
            continue;
          }

          const summary = extractTextSummary(textContent.text);
          if (summary) {
            yield {
              type: 'thinking',
              summary,
            };
          }
        } else if (content.type === 'tool_use') {
          const toolContent = content as ToolUseContent;
          const detail = extractToolDetail(toolContent.name, toolContent.input);

          // Emit special event for subagent spawns (Task/Agent tool)
          if (toolContent.name === 'Task' || toolContent.name === 'Agent') {
            const agentType = (toolContent.input.subagent_type as string) || 'unknown';
            yield {
              type: 'subagent_start',
              agent: agentType,
              detail,
              toolId: toolContent.id,
            };
          }

          yield {
            type: 'tool_use',
            tool: toolContent.name as ToolName,
            detail,
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
      const tokens =
        event.usage.input_tokens +
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
      } else {
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
function extractTextSummary(text: string, maxLen = 60): string | null {
  // Remove leading/trailing whitespace and newlines
  const cleaned = text.replace(/\n/g, ' ').trim();

  // Skip very short fragments
  if (cleaned.length < 10) return null;

  // Always keep important structural messages (UC markers, sub-sprint info)
  if (/^(UC\s*[>►]|━|Sub-Sprint|Sprint\s+\d|EXECUTING|PLANNING|VERIFYING)/i.test(cleaned)) {
    if (cleaned.length > maxLen) {
      return cleaned.slice(0, maxLen - 3) + '...';
    }
    return cleaned;
  }

  // Always keep messages about spawning executors/agents
  if (/spawn|executor|verifier|sub-sprint\s+\d/i.test(cleaned)) {
    if (cleaned.length > maxLen) {
      return cleaned.slice(0, maxLen - 3) + '...';
    }
    return cleaned;
  }

  // Skip generic tool call announcements (these are redundant)
  if (/^(Let me|I'll|I will|Now I|I need to|First,|Next,)/i.test(cleaned)) return null;

  // Truncate if needed
  if (cleaned.length > maxLen) {
    return cleaned.slice(0, maxLen - 3) + '...';
  }

  return cleaned;
}

/**
 * Extract a human-readable detail string from tool input
 */
function extractToolDetail(
  toolName: string,
  input: Record<string, unknown>
): string {
  switch (toolName) {
    case 'Read': {
      const filePath = input.file_path as string | undefined;
      if (filePath) {
        const parts = filePath.split('/');
        const filename = parts.pop() || '';
        const parent = parts.pop() || '';
        return parent ? `${parent}/${filename}` : filename;
      }
      return '(file)';
    }

    case 'Write': {
      const filePath = input.file_path as string | undefined;
      if (filePath) {
        return filePath.split('/').pop() || '(new file)';
      }
      return '(new file)';
    }

    case 'Edit': {
      const filePath = input.file_path as string | undefined;
      if (filePath) {
        return filePath.split('/').pop() || '(file)';
      }
      return '(file)';
    }

    case 'Bash': {
      const desc = input.description as string | undefined;
      const cmd = input.command as string | undefined;
      if (desc) return truncate(desc, 45);
      if (cmd) return truncate(cmd.split('\n')[0], 45);
      return '(command)';
    }

    case 'Task':
    case 'Agent': {
      const agentType = input.subagent_type as string | undefined;
      const desc = input.description as string | undefined;
      const prompt = input.prompt as string | undefined;
      if (agentType) {
        const friendly = getAgentDisplayName(agentType);
        // Try to extract plan/sub-sprint info from description or prompt
        const planMatch = (desc || prompt || '').match(/(?:plan|sub-sprint)\s*(\d{2}-\d{2})/i);
        const subSprintMatch = (desc || prompt || '').match(/sub-sprint\s*(\d+)/i);
        let suffix = '';
        if (planMatch) suffix = ` [${planMatch[1]}]`;
        else if (subSprintMatch) suffix = ` [sub-sprint ${subSprintMatch[1]}]`;
        if (desc) return `${friendly}${suffix}: ${truncate(desc, 30)}`;
        return `${friendly}${suffix}`;
      }
      return '(spawning agent)';
    }

    case 'Grep': {
      const pattern = input.pattern as string | undefined;
      if (pattern) return `grep: ${truncate(pattern, 35)}`;
      return 'grep';
    }

    case 'Glob': {
      const pattern = input.pattern as string | undefined;
      if (pattern) return `glob: ${truncate(pattern, 35)}`;
      return 'glob';
    }

    case 'TaskCreate':
    case 'TaskUpdate':
    case 'TaskList':
      return 'Managing tasks...';

    case 'ToolSearch': {
      const query = input.query as string | undefined;
      if (query) return `loading: ${truncate(query, 35)}`;
      return 'loading tools';
    }

    case 'Skill': {
      const skillName = input.skill_name as string | undefined;
      if (skillName) return `skill: ${truncate(skillName, 35)}`;
      return 'running skill';
    }

    case 'WebFetch': {
      const url = input.url as string | undefined;
      if (url) return `fetch: ${truncate(url, 35)}`;
      return 'web request';
    }

    case 'WebSearch': {
      const query = input.query as string | undefined;
      if (query) return `search: ${truncate(query, 35)}`;
      return 'web search';
    }

    default:
      return toolName;
  }
}

/**
 * Get friendly display name for agent types
 */
function getAgentDisplayName(agentType: string): string {
  const names: Record<string, string> = {
    'uc-sprint-researcher': 'Researching',
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
function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

/**
 * Parse rate limit reset time from error message
 * Examples:
 * - "rate limit exceeded, resets 10pm"
 * - "rate limit exceeded, resets at 10:30pm"
 * - "rate limit exceeded, resets in 5 minutes"
 * - "Rate limited. Try again at 2024-02-15T15:30:00Z"
 * - "You're out of extra usage · resets 10pm"
 * - "You've exceeded your usage limit"
 */
export function parseRateLimitMessage(
  message: string
): { resetTime: Date } | null {
  // Check if this is a rate limit message
  const isRateLimit =
    /rate.?limit/i.test(message) ||
    /out of.*(usage|credits)/i.test(message) ||
    /exceeded.*usage/i.test(message) ||
    /usage.*limit/i.test(message);

  if (!isRateLimit) {
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
    } else if (period === 'am' && hours === 12) {
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
export function toolToActivityType(
  tool: ToolName
): 'read' | 'write' | 'edit' | 'bash' | 'agent' | 'search' | 'info' {
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
    case 'Agent':
      return 'agent';
    case 'Grep':
    case 'Glob':
    case 'WebFetch':
    case 'WebSearch':
    case 'ToolSearch':
      return 'search';
    case 'Skill':
      return 'info';
    default:
      return 'info';
  }
}

/**
 * Map agent subtype to stage name
 */
export function agentToStageName(
  agentType: string
): 'RESEARCH' | 'PLANNING' | 'CHECKING' | 'BUILDING' | 'VERIFYING' | 'WORKING' {
  switch (agentType) {
    case 'uc-sprint-researcher':
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
