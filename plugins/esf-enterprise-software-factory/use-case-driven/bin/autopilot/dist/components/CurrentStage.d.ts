import type { StageName } from '../types/events.js';
import type { AutopilotState } from '../types/config.js';
export interface CurrentStageProps {
    mode: AutopilotState['mode'];
    stage: StageName | null;
    description?: string;
    elapsed?: string;
    agent?: string | null;
}
/**
 * Current stage display with spinner and status
 */
export declare function CurrentStage({ mode, stage, description, elapsed, agent, }: CurrentStageProps): import("react/jsx-runtime").JSX.Element;
export default CurrentStage;
//# sourceMappingURL=CurrentStage.d.ts.map