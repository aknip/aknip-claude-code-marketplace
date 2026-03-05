import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
/**
 * Get agent display info
 */
function getAgentDisplay(agent) {
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
 * Current stage display with spinner and status
 */
export function CurrentStage({ mode, stage, description, elapsed, agent, }) {
    return (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { children: [_jsx(Text, { bold: true, children: "## " }), mode === 'running' && (_jsxs(_Fragment, { children: [_jsx(Text, { color: "green", children: _jsx(Spinner, { type: "dots" }) }), _jsxs(Text, { bold: true, children: [" ", stage || 'WORKING'] }), elapsed && _jsxs(Text, { children: [" ", elapsed] })] })), mode === 'idle' && _jsx(Text, { bold: true, children: "READY" }), mode === 'paused' && (_jsx(Text, { bold: true, color: "yellow", children: "PAUSED" })), mode === 'completed' && (_jsx(Text, { bold: true, color: "green", children: "COMPLETED" })), mode === 'failed' && (_jsx(Text, { bold: true, color: "red", children: "FAILED" }))] }), agent && mode === 'running' && (_jsx(Box, { marginTop: 1, children: _jsxs(Text, { color: "cyan", children: ["Agent:", ' ', _jsxs(Text, { color: "white", children: [getAgentDisplay(agent).icon, " ", getAgentDisplay(agent).name] })] }) })), description && (_jsx(Text, { dimColor: true, children: description.length > 58 ? description.slice(0, 55) + '...' : description }))] }));
}
export default CurrentStage;
//# sourceMappingURL=CurrentStage.js.map