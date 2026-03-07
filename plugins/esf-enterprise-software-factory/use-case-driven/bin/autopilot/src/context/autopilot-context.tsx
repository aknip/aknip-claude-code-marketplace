import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import type {
  StageName,
  CompletedStage,
  ActivityEntry,
  StreamEvent,
} from '../types/events.js';
import type {
  AutopilotConfig,
  AutopilotState,
  SprintInfo,
  SprintResult,
} from '../types/config.js';

/**
 * Autopilot UI State
 */
export interface AutopilotUIState {
  // Configuration
  config: AutopilotConfig | null;

  // Execution state
  mode: AutopilotState['mode'];
  currentSprint: number | null;
  sprintInfo: SprintInfo | null;
  totalSprints: number;
  sprintsCompleted: number[];

  // Stage tracking
  currentStage: StageName | null;
  stageDescription: string;
  stageStartTime: Date | null;
  completedStages: CompletedStage[];

  // Activity feed
  activities: ActivityEntry[];
  maxActivities: number;

  // Metrics
  tokens: number;
  cost: number;
  startTime: Date | null;

  // Current agent
  currentAgent: string | null;

  // Errors
  lastError: string | null;
}

/**
 * Actions for state updates
 */
export type AutopilotAction =
  | { type: 'INIT'; config: AutopilotConfig; totalSprints: number }
  | { type: 'START_SPRINT'; sprint: number; sprintInfo: SprintInfo }
  | { type: 'COMPLETE_SPRINT'; sprint: number; result: SprintResult }
  | { type: 'SET_STAGE'; stage: StageName; description: string }
  | { type: 'COMPLETE_STAGE' }
  | { type: 'ADD_ACTIVITY'; activity: ActivityEntry }
  | { type: 'SET_AGENT'; agent: string | null }
  | { type: 'UPDATE_TOKENS'; tokens: number }
  | { type: 'UPDATE_COST'; cost: number }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'SET_MODE'; mode: AutopilotState['mode'] }
  | { type: 'RESET_STAGES' };

/**
 * Initial state
 */
const initialState: AutopilotUIState = {
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
  maxActivities: 12,
  tokens: 0,
  cost: 0,
  startTime: null,
  currentAgent: null,
  lastError: null,
};

/**
 * Format elapsed time as M:SS
 */
function formatElapsed(start: Date, end: Date = new Date()): string {
  const elapsed = Math.floor((end.getTime() - start.getTime()) / 1000);
  const min = Math.floor(elapsed / 60);
  const sec = elapsed % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

/**
 * Reducer for state updates
 */
function autopilotReducer(
  state: AutopilotUIState,
  action: AutopilotAction
): AutopilotUIState {
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
      if (!state.currentStage || !state.stageStartTime) return state;

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

/**
 * Context type
 */
interface AutopilotContextType {
  state: AutopilotUIState;
  dispatch: React.Dispatch<AutopilotAction>;
  // Convenience methods
  init: (config: AutopilotConfig, totalSprints: number) => void;
  startSprint: (sprint: number, sprintInfo: SprintInfo) => void;
  completeSprint: (sprint: number, result: SprintResult) => void;
  setStage: (stage: StageName, description: string) => void;
  completeStage: () => void;
  addActivity: (activity: ActivityEntry) => void;
  setAgent: (agent: string | null) => void;
  updateTokens: (tokens: number) => void;
  setError: (error: string) => void;
  setMode: (mode: AutopilotState['mode']) => void;
  resetStages: () => void;
}

const AutopilotContext = createContext<AutopilotContextType | null>(null);

/**
 * Provider component
 */
export function AutopilotProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(autopilotReducer, initialState);

  const init = useCallback(
    (config: AutopilotConfig, totalSprints: number) => {
      dispatch({ type: 'INIT', config, totalSprints });
    },
    []
  );

  const startSprint = useCallback(
    (sprint: number, sprintInfo: SprintInfo) => {
      dispatch({ type: 'START_SPRINT', sprint, sprintInfo });
    },
    []
  );

  const completeSprint = useCallback(
    (sprint: number, result: SprintResult) => {
      dispatch({ type: 'COMPLETE_SPRINT', sprint, result });
    },
    []
  );

  const setStage = useCallback(
    (stage: StageName, description: string) => {
      dispatch({ type: 'SET_STAGE', stage, description });
    },
    []
  );

  const completeStage = useCallback(() => {
    dispatch({ type: 'COMPLETE_STAGE' });
  }, []);

  const addActivity = useCallback((activity: ActivityEntry) => {
    dispatch({ type: 'ADD_ACTIVITY', activity });
  }, []);

  const setAgent = useCallback((agent: string | null) => {
    dispatch({ type: 'SET_AGENT', agent });
  }, []);

  const updateTokens = useCallback((tokens: number) => {
    dispatch({ type: 'UPDATE_TOKENS', tokens });
  }, []);

  const setError = useCallback((error: string) => {
    dispatch({ type: 'SET_ERROR', error });
  }, []);

  const setMode = useCallback((mode: AutopilotState['mode']) => {
    dispatch({ type: 'SET_MODE', mode });
  }, []);

  const resetStages = useCallback(() => {
    dispatch({ type: 'RESET_STAGES' });
  }, []);

  return (
    <AutopilotContext.Provider
      value={{
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
      }}
    >
      {children}
    </AutopilotContext.Provider>
  );
}

/**
 * Hook to use autopilot context
 */
export function useAutopilot(): AutopilotContextType {
  const context = useContext(AutopilotContext);
  if (!context) {
    throw new Error('useAutopilot must be used within AutopilotProvider');
  }
  return context;
}
