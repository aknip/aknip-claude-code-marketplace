import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useReducer, useCallback } from 'react';
/**
 * Initial state
 */
const initialState = {
    config: null,
    mode: 'idle',
    currentSprint: null,
    sprintInfo: null,
    totalSprints: 0,
    sprintsCompleted: [],
    currentStage: null,
    stageDescription: '',
    stageStartTime: null,
    completedStages: [],
    activities: [],
    maxActivities: 10,
    tokens: 0,
    cost: 0,
    startTime: null,
    currentAgent: null,
    lastError: null,
};
/**
 * Format elapsed time as M:SS
 */
function formatElapsed(start, end = new Date()) {
    const elapsed = Math.floor((end.getTime() - start.getTime()) / 1000);
    const min = Math.floor(elapsed / 60);
    const sec = elapsed % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
}
/**
 * Reducer for state updates
 */
function autopilotReducer(state, action) {
    switch (action.type) {
        case 'INIT':
            return {
                ...initialState,
                config: action.config,
                totalSprints: action.totalSprints,
                mode: 'running',
                startTime: new Date(),
            };
        case 'START_SPRINT':
            return {
                ...state,
                currentSprint: action.sprint,
                sprintInfo: action.sprintInfo,
                currentStage: null,
                stageDescription: '',
                stageStartTime: null,
                completedStages: [],
                activities: [],
            };
        case 'COMPLETE_SPRINT':
            return {
                ...state,
                sprintsCompleted: [...state.sprintsCompleted, action.sprint],
                tokens: state.tokens + action.result.tokens,
                cost: state.cost + action.result.cost,
            };
        case 'SET_STAGE': {
            // Complete previous stage if exists
            let completedStages = state.completedStages;
            if (state.currentStage && state.stageStartTime) {
                completedStages = [
                    ...completedStages,
                    {
                        name: state.currentStage,
                        duration: formatElapsed(state.stageStartTime),
                    },
                ];
            }
            return {
                ...state,
                currentStage: action.stage,
                stageDescription: action.description,
                stageStartTime: new Date(),
                completedStages,
            };
        }
        case 'COMPLETE_STAGE': {
            if (!state.currentStage || !state.stageStartTime)
                return state;
            return {
                ...state,
                completedStages: [
                    ...state.completedStages,
                    {
                        name: state.currentStage,
                        duration: formatElapsed(state.stageStartTime),
                    },
                ],
                currentStage: null,
                stageDescription: '',
                stageStartTime: null,
            };
        }
        case 'ADD_ACTIVITY': {
            const activities = [...state.activities, action.activity];
            // Keep only last N activities
            return {
                ...state,
                activities: activities.slice(-state.maxActivities),
            };
        }
        case 'SET_AGENT':
            return {
                ...state,
                currentAgent: action.agent,
            };
        case 'UPDATE_TOKENS':
            return {
                ...state,
                tokens: action.tokens,
            };
        case 'UPDATE_COST':
            return {
                ...state,
                cost: action.cost,
            };
        case 'SET_ERROR':
            return {
                ...state,
                lastError: action.error,
            };
        case 'SET_MODE':
            return {
                ...state,
                mode: action.mode,
            };
        case 'RESET_STAGES':
            return {
                ...state,
                currentStage: null,
                stageDescription: '',
                stageStartTime: null,
                completedStages: [],
                activities: [],
                currentAgent: null,
            };
        default:
            return state;
    }
}
const AutopilotContext = createContext(null);
/**
 * Provider component
 */
export function AutopilotProvider({ children }) {
    const [state, dispatch] = useReducer(autopilotReducer, initialState);
    const init = useCallback((config, totalSprints) => {
        dispatch({ type: 'INIT', config, totalSprints });
    }, []);
    const startSprint = useCallback((sprint, sprintInfo) => {
        dispatch({ type: 'START_SPRINT', sprint, sprintInfo });
    }, []);
    const completeSprint = useCallback((sprint, result) => {
        dispatch({ type: 'COMPLETE_SPRINT', sprint, result });
    }, []);
    const setStage = useCallback((stage, description) => {
        dispatch({ type: 'SET_STAGE', stage, description });
    }, []);
    const completeStage = useCallback(() => {
        dispatch({ type: 'COMPLETE_STAGE' });
    }, []);
    const addActivity = useCallback((activity) => {
        dispatch({ type: 'ADD_ACTIVITY', activity });
    }, []);
    const setAgent = useCallback((agent) => {
        dispatch({ type: 'SET_AGENT', agent });
    }, []);
    const updateTokens = useCallback((tokens) => {
        dispatch({ type: 'UPDATE_TOKENS', tokens });
    }, []);
    const setError = useCallback((error) => {
        dispatch({ type: 'SET_ERROR', error });
    }, []);
    const setMode = useCallback((mode) => {
        dispatch({ type: 'SET_MODE', mode });
    }, []);
    const resetStages = useCallback(() => {
        dispatch({ type: 'RESET_STAGES' });
    }, []);
    return (_jsx(AutopilotContext.Provider, { value: {
            state,
            dispatch,
            init,
            startSprint,
            completeSprint,
            setStage,
            completeStage,
            addActivity,
            setAgent,
            updateTokens,
            setError,
            setMode,
            resetStages,
        }, children: children }));
}
/**
 * Hook to use autopilot context
 */
export function useAutopilot() {
    const context = useContext(AutopilotContext);
    if (!context) {
        throw new Error('useAutopilot must be used within AutopilotProvider');
    }
    return context;
}
//# sourceMappingURL=autopilot-context.js.map