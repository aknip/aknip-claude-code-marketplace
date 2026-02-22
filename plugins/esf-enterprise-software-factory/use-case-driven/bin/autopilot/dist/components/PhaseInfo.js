import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Box, Text } from 'ink';
/**
 * Phase information display showing name, goal, and key deliverables
 */
export function PhaseInfo({ phase, info, maxDeliverables = 3 }) {
    if (!info) {
        return (_jsx(Box, { flexDirection: "column", children: _jsxs(Text, { bold: true, children: ["## PHASE ", phase] }) }));
    }
    return (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { bold: true, children: ["## PHASE ", phase, ": ", info.name] }), _jsx(Text, { children: " " }), info.goal && _jsx(Text, { dimColor: true, children: info.goal }), info.deliverables.slice(0, maxDeliverables).map((d, i) => (_jsxs(Text, { dimColor: true, children: ['  ', d] }, i)))] }));
}
export default PhaseInfo;
//# sourceMappingURL=PhaseInfo.js.map