/**
 * Timer hook for tracking elapsed time
 */
export interface UseTimerOptions {
    startTime?: Date;
    updateInterval?: number;
    autoStart?: boolean;
}
export interface UseTimerReturn {
    elapsed: number;
    formatted: string;
    start: () => void;
    stop: () => void;
    reset: () => void;
    isRunning: boolean;
}
export declare function useTimer(options?: UseTimerOptions): UseTimerReturn;
/**
 * Hook for a simple countdown timer
 */
export declare function useCountdown(seconds: number, onComplete?: () => void): {
    remaining: number;
    isRunning: boolean;
};
//# sourceMappingURL=useTimer.d.ts.map