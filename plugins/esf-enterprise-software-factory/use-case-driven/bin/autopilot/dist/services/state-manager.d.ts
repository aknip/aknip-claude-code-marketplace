import type { AutopilotState, DerivedPaths } from '../types/config.js';
/**
 * Update autopilot state in STATE.md
 */
export declare function updateAutopilotState(paths: DerivedPaths, state: Partial<AutopilotState>): Promise<void>;
/**
 * Read current autopilot state from STATE.md
 */
export declare function readAutopilotState(paths: DerivedPaths): Promise<Partial<AutopilotState> | null>;
//# sourceMappingURL=state-manager.d.ts.map