import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
/**
 * Header component showing "UC AUTOPILOT" and phase counter
 */
export function Header({ projectName, currentPhase, totalPhases }) {
    return (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { children: [_jsx(Text, { bold: true, color: "cyan", children: "# UC AUTOPILOT" }), _jsx(Box, { flexGrow: 1 }), _jsxs(Text, { children: ["Phase ", currentPhase, "/", totalPhases] })] }), projectName && (_jsx(Text, { dimColor: true, children: projectName }))] }));
}
export default Header;
//# sourceMappingURL=Header.js.map