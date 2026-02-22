import { jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { formatTokens, formatCost } from '../utils/format.js';
/**
 * Token and cost counter display
 */
export function TokenCounter({ tokens, cost, showCost = false }) {
    if (tokens === 0) {
        return null;
    }
    return (_jsxs(Box, { children: [_jsxs(Text, { dimColor: true, children: ["Tokens: ", formatTokens(tokens)] }), showCost && cost !== undefined && cost > 0 && (_jsxs(Text, { dimColor: true, children: [" | Cost: ", formatCost(cost)] }))] }));
}
export default TokenCounter;
//# sourceMappingURL=TokenCounter.js.map