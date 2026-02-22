import type { PhaseInfo as PhaseInfoType } from '../types/config.js';
export interface PhaseInfoProps {
    phase: number;
    info: PhaseInfoType | null;
    maxDeliverables?: number;
}
/**
 * Phase information display showing name, goal, and key deliverables
 */
export declare function PhaseInfo({ phase, info, maxDeliverables }: PhaseInfoProps): import("react/jsx-runtime").JSX.Element;
export default PhaseInfo;
//# sourceMappingURL=PhaseInfo.d.ts.map