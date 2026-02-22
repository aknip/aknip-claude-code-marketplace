import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Box, Text } from 'ink';
/**
 * Display completed stages with their durations
 */
export function StageProgress({ completedStages }) {
    if (completedStages.length === 0) {
        return null;
    }
    return (_jsx(Box, { flexDirection: "column", children: completedStages.map((stage, i) => (_jsxs(Box, { children: [_jsxs(Text, { dimColor: true, children: ["\u2713 ", stage.name.padEnd(10)] }), _jsx(Box, { flexGrow: 1 }), _jsx(Text, { dimColor: true, children: stage.duration })] }, i))) }));
}
export default StageProgress;
//# sourceMappingURL=StageProgress.js.map