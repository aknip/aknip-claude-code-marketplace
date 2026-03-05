/**
 * Icon mappings for autopilot display
 */
/**
 * Get emoji icon for activity type
 */
export function getActivityIcon(type) {
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
 * Get stage icon
 */
export function getStageIcon(stage) {
    const icons = {
        RESEARCH: '🔬',
        PLANNING: '📋',
        CHECKING: '✅',
        BUILDING: '🔨',
        VERIFYING: '🔍',
        WORKING: '⚙️',
        WAITING: '⏳',
    };
    return icons[stage] || '⚙️';
}
/**
 * Get agent display info
 */
export function getAgentInfo(agent) {
    const agents = {
        'uc-sprint-researcher': { icon: '🔬', name: 'Sprint Researcher' },
        'uc-planner': { icon: '📋', name: 'Planner' },
        'uc-checker': { icon: '✅', name: 'Checker' },
        'uc-executor': { icon: '🔨', name: 'Executor' },
        'uc-verifier': { icon: '🔍', name: 'Verifier' },
        'Explore': { icon: '🧭', name: 'Explorer' },
        'Plan': { icon: '🗺️', name: 'Planner' },
        'Bash': { icon: '⚡', name: 'Shell' },
    };
    return agents[agent] || { icon: '🤖', name: agent };
}
/**
 * Get status icon
 */
export function getStatusIcon(status) {
    const icons = {
        pending: '⏳',
        running: '▶️',
        passed: '✅',
        completed: '✅',
        failed: '❌',
        paused: '⏸️',
        gaps_found: '⚠️',
        needs_verification: '🔎',
        incomplete: '🔄',
        human_needed: '👤',
        waiting: '⏳',
    };
    return icons[status] || '❓';
}
/**
 * Get progress bar characters
 */
export const progressChars = {
    filled: '━',
    empty: '─',
    leftBracket: '[',
    rightBracket: ']',
};
/**
 * Get checkmark or X for boolean
 */
export function getBooleanIcon(value) {
    return value ? '✓' : '✗';
}
/**
 * Get spinner frames for animation
 */
export const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
/**
 * Get color name for activity type
 */
export function getActivityColor(type) {
    const colors = {
        error: 'red',
        result: 'green',
        agent: 'cyan',
        bash: 'yellow',
        text: 'gray',
        waiting: 'yellow',
    };
    return colors[type];
}
//# sourceMappingURL=icons.js.map