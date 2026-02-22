import React, { ReactNode } from 'react';
import type { StageName, CompletedStage, ActivityEntry } from '../types/events.js';
import type { AutopilotConfig, AutopilotState, PhaseInfo, PhaseResult } from '../types/config.js';
/**
 * Autopilot UI State
 */
export interface AutopilotUIState {
    config: AutopilotConfig | null;
    mode: AutopilotState['mode'];
    currentPhase: number | null;
    phaseInfo: PhaseInfo | null;
    totalPhases: number;
    phasesCompleted: number[];
    currentStage: StageName | null;
    stageDescription: string;
    stageStartTime: Date | null;
    completedStages: CompletedStage[];
    activities: ActivityEntry[];
    maxActivities: number;
    tokens: number;
    cost: number;
    startTime: Date | null;
    currentAgent: string | null;
    lastError: string | null;
}
/**
 * Actions for state updates
 */
export type AutopilotAction = {
    type: 'INIT';
    config: AutopilotConfig;
    totalPhases: number;
} | {
    type: 'START_PHASE';
    phase: number;
    phaseInfo: PhaseInfo;
} | {
    type: 'COMPLETE_PHASE';
    phase: number;
    result: PhaseResult;
} | {
    type: 'SET_STAGE';
    stage: StageName;
    description: string;
} | {
    type: 'COMPLETE_STAGE';
} | {
    type: 'ADD_ACTIVITY';
    activity: ActivityEntry;
} | {
    type: 'SET_AGENT';
    agent: string | null;
} | {
    type: 'UPDATE_TOKENS';
    tokens: number;
} | {
    type: 'UPDATE_COST';
    cost: number;
} | {
    type: 'SET_ERROR';
    error: string;
} | {
    type: 'SET_MODE';
    mode: AutopilotState['mode'];
} | {
    type: 'RESET_STAGES';
};
/**
 * Context type
 */
interface AutopilotContextType {
    state: AutopilotUIState;
    dispatch: React.Dispatch<AutopilotAction>;
    init: (config: AutopilotConfig, totalPhases: number) => void;
    startPhase: (phase: number, phaseInfo: PhaseInfo) => void;
    completePhase: (phase: number, result: PhaseResult) => void;
    setStage: (stage: StageName, description: string) => void;
    completeStage: () => void;
    addActivity: (activity: ActivityEntry) => void;
    setAgent: (agent: string | null) => void;
    updateTokens: (tokens: number) => void;
    setError: (error: string) => void;
    setMode: (mode: AutopilotState['mode']) => void;
    resetStages: () => void;
}
/**
 * Provider component
 */
export declare function AutopilotProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
/**
 * Hook to use autopilot context
 */
export declare function useAutopilot(): AutopilotContextType;
export {};
//# sourceMappingURL=autopilot-context.d.ts.map