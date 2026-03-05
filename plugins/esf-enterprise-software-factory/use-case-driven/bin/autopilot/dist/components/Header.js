import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
/**
 * Header component showing "UC AUTOPILOT" and sprint counter
 */
export function Header({ projectName, currentSprint, totalSprints }) {
    return (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { children: [_jsx(Text, { bold: true, color: "cyan", children: "# UC AUTOPILOT" }), _jsx(Box, { flexGrow: 1 }), _jsxs(Text, { children: ["Sprint ", currentSprint, "/", totalSprints] })] }), projectName && (_jsx(Text, { dimColor: true, children: projectName }))] }));
}
export default Header;
//# sourceMappingURL=Header.js.map