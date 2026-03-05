import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { useAutopilot } from './context/autopilot-context.js';
import { Header } from './components/Header.js';
import { SprintInfo } from './components/SprintInfo.js';
import { StageProgress } from './components/StageProgress.js';
import { CurrentStage } from './components/CurrentStage.js';
import { ActivityFeed } from './components/ActivityFeed.js';
import { ProgressBar } from './components/ProgressBar.js';
import { TokenCounter } from './components/TokenCounter.js';
import { useTimer } from './hooks/useTimer.js';
/**
 * Main autopilot display component
 */
function AutopilotDisplay({ config }) {
    const { state } = useAutopilot();
    const { mode, currentSprint, sprintInfo, totalSprints, sprintsCompleted, currentStage, stageDescription, stageStartTime, completedStages, activities, tokens, cost, currentAgent, lastError, } = state;
    // Note: init is called in index.tsx by AutopilotRunner, not here
    // Stage timer
    const stageTimer = useTimer({
        startTime: stageStartTime || undefined,
        autoStart: !!stageStartTime,
    });
    // Calculate progress
    const completed = sprintsCompleted.length;
    const displayPhase = currentSprint ? completed + 1 : 0;
    // Get last activity time for stale detection
    const lastActivityTime = activities.length > 0 ? activities[activities.length - 1].timestamp : null;
    return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Header, { projectName: config.projectName, currentSprint: displayPhase, totalSprints: totalSprints }), _jsx(Text, { children: " " }), currentSprint && (_jsxs(_Fragment, { children: [_jsx(SprintInfo, { sprint: currentSprint, info: sprintInfo }), _jsx(Text, { children: " " })] })), completedStages.length > 0 && (_jsxs(_Fragment, { children: [_jsx(StageProgress, { completedStages: completedStages }), _jsx(Text, { children: " " })] })), _jsx(CurrentStage, { mode: mode, stage: currentStage, description: stageDescription, elapsed: stageTimer.formatted, agent: currentAgent }), _jsx(Text, { children: " " }), _jsx(ActivityFeed, { activities: activities, maxLines: 10, showEmptyState: mode === 'running', lastActivityTime: lastActivityTime }), _jsx(Text, { children: " " }), _jsx(ProgressBar, { completed: completed, total: totalSprints, width: 40 }), _jsx(TokenCounter, { tokens: tokens, cost: cost, showCost: cost > 0 }), lastError && (_jsxs(_Fragment, { children: [_jsx(Text, { children: " " }), _jsxs(Text, { color: "red", children: ["Error: ", lastError] })] }))] }));
}
/**
 * Main App component - uses existing AutopilotProvider from parent
 * Note: AutopilotProvider is created in index.tsx, not here
 */
export function App({ config }) {
    return _jsx(AutopilotDisplay, { config: config });
}
export default App;
//# sourceMappingURL=App.js.map