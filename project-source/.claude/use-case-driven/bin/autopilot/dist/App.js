import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { useAutopilot } from './context/autopilot-context.js';
import { Header } from './components/Header.js';
import { PhaseInfo } from './components/PhaseInfo.js';
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
    const { mode, currentPhase, phaseInfo, totalPhases, phasesCompleted, currentStage, stageDescription, stageStartTime, completedStages, activities, tokens, cost, currentAgent, lastError, } = state;
    // Note: init is called in index.tsx by AutopilotRunner, not here
    // Stage timer
    const stageTimer = useTimer({
        startTime: stageStartTime || undefined,
        autoStart: !!stageStartTime,
    });
    // Calculate progress
    const completed = phasesCompleted.length;
    const displayPhase = currentPhase ? completed + 1 : 0;
    // Get last activity time for stale detection
    const lastActivityTime = activities.length > 0 ? activities[activities.length - 1].timestamp : null;
    return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Header, { projectName: config.projectName, currentPhase: displayPhase, totalPhases: totalPhases }), _jsx(Text, { children: " " }), currentPhase && (_jsxs(_Fragment, { children: [_jsx(PhaseInfo, { phase: currentPhase, info: phaseInfo }), _jsx(Text, { children: " " })] })), completedStages.length > 0 && (_jsxs(_Fragment, { children: [_jsx(StageProgress, { completedStages: completedStages }), _jsx(Text, { children: " " })] })), _jsx(CurrentStage, { mode: mode, stage: currentStage, description: stageDescription, elapsed: stageTimer.formatted, agent: currentAgent }), _jsx(Text, { children: " " }), _jsx(ActivityFeed, { activities: activities, maxLines: 10, showEmptyState: mode === 'running', lastActivityTime: lastActivityTime }), _jsx(Text, { children: " " }), _jsx(ProgressBar, { completed: completed, total: totalPhases, width: 40 }), _jsx(TokenCounter, { tokens: tokens, cost: cost, showCost: cost > 0 }), lastError && (_jsxs(_Fragment, { children: [_jsx(Text, { children: " " }), _jsxs(Text, { color: "red", children: ["Error: ", lastError] })] }))] }));
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