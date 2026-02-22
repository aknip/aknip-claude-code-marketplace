import { useState, useEffect, useCallback } from 'react';
export function useTimer(options = {}) {
    const { startTime: initialStartTime, updateInterval = 1000, autoStart = false, } = options;
    const [startTime, setStartTime] = useState(initialStartTime || (autoStart ? new Date() : null));
    const [isRunning, setIsRunning] = useState(autoStart || !!initialStartTime);
    const [elapsed, setElapsed] = useState(0);
    // Sync startTime when prop changes
    useEffect(() => {
        if (initialStartTime) {
            setStartTime(initialStartTime);
            setIsRunning(true);
        }
    }, [initialStartTime]);
    // Update elapsed time
    useEffect(() => {
        if (!isRunning || !startTime)
            return;
        const updateElapsed = () => {
            const now = new Date();
            const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
            setElapsed(diff);
        };
        // Initial update
        updateElapsed();
        // Set up interval
        const interval = setInterval(updateElapsed, updateInterval);
        return () => clearInterval(interval);
    }, [isRunning, startTime, updateInterval]);
    // Format as M:SS
    const formatted = formatElapsed(elapsed);
    const start = useCallback(() => {
        if (!isRunning) {
            setStartTime(new Date());
            setIsRunning(true);
        }
    }, [isRunning]);
    const stop = useCallback(() => {
        setIsRunning(false);
    }, []);
    const reset = useCallback(() => {
        setStartTime(null);
        setIsRunning(false);
        setElapsed(0);
    }, []);
    return {
        elapsed,
        formatted,
        start,
        stop,
        reset,
        isRunning,
    };
}
/**
 * Format seconds as M:SS
 */
function formatElapsed(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
}
/**
 * Hook for a simple countdown timer
 */
export function useCountdown(seconds, onComplete) {
    const [remaining, setRemaining] = useState(seconds);
    const [isRunning, setIsRunning] = useState(true);
    useEffect(() => {
        if (!isRunning || remaining <= 0) {
            if (remaining <= 0 && onComplete) {
                onComplete();
            }
            return;
        }
        const interval = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    setIsRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isRunning, remaining, onComplete]);
    return { remaining, isRunning };
}
//# sourceMappingURL=useTimer.js.map