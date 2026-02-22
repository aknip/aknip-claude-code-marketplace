import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { progressChars } from '../utils/icons.js';
/**
 * Progress bar component
 */
export function ProgressBar({ completed, total, width = 40, label = 'Progress', showCount = true, }) {
    // Calculate filled portion
    const filled = total > 0 ? Math.floor((completed / total) * width) : 0;
    const empty = width - filled;
    return (_jsxs(Box, { children: [_jsxs(Text, { children: ["## ", label, " "] }), _jsx(Text, { dimColor: true, children: progressChars.leftBracket }), _jsx(Text, { color: "cyan", children: progressChars.filled.repeat(filled) }), _jsx(Text, { dimColor: true, children: progressChars.empty.repeat(empty) }), _jsx(Text, { dimColor: true, children: progressChars.rightBracket }), showCount && (_jsxs(Text, { children: [' ', completed, "/", total, " phases"] }))] }));
}
/**
 * Compact inline progress bar
 */
export function InlineProgressBar({ completed, total, width = 20, }) {
    const filled = total > 0 ? Math.floor((completed / total) * width) : 0;
    const empty = width - filled;
    return (_jsxs(Text, { children: [_jsx(Text, { dimColor: true, children: "[" }), _jsx(Text, { color: "cyan", children: progressChars.filled.repeat(filled) }), _jsx(Text, { dimColor: true, children: progressChars.empty.repeat(empty) }), _jsx(Text, { dimColor: true, children: "]" })] }));
}
export default ProgressBar;
//# sourceMappingURL=ProgressBar.js.map