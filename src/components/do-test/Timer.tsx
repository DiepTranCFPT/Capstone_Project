import React, { useState, useEffect, useRef } from 'react';

interface TimerProps {
    initialMinutes: number;
    onTimeUp: () => void;
    remainingTime?: number;
    onTimeChange?: (seconds: number) => void;
}

const Timer: React.FC<TimerProps> = ({ initialMinutes, onTimeUp, remainingTime, onTimeChange }) => {
    const [seconds, setSeconds] = useState(() => {
        // Always start with initial time, remainingTime will be synced via useEffect
        const savedTime = localStorage.getItem('examRemainingTime');
        const parsedSavedTime = savedTime ? parseInt(savedTime, 10) : null;
        return (parsedSavedTime && parsedSavedTime > 0) ? parsedSavedTime : initialMinutes * 60;
    });
    const [isRunning, setIsRunning] = useState(true);
    const onTimeUpRef = useRef(onTimeUp);
    const onTimeChangeRef = useRef(onTimeChange);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const hasInitializedRef = useRef(false);

    // Update refs when callbacks change
    useEffect(() => {
        onTimeUpRef.current = onTimeUp;
    }, [onTimeUp]);

    useEffect(() => {
        onTimeChangeRef.current = onTimeChange;
    }, [onTimeChange]);

    // Sync with external remainingTime changes (only if it's a valid time > 0)
    // Use a ref to avoid dependency on seconds which would cause infinite loops
    const prevRemainingTimeRef = useRef<number | undefined>(undefined);
    useEffect(() => {
        // Only sync if remainingTime has actually changed and is valid
        if (remainingTime !== undefined &&
            remainingTime > 0 &&
            remainingTime !== prevRemainingTimeRef.current &&
            hasInitializedRef.current) {
            setSeconds(remainingTime);
            prevRemainingTimeRef.current = remainingTime;
        }
        if (!hasInitializedRef.current) {
            hasInitializedRef.current = true;
            prevRemainingTimeRef.current = remainingTime;
        }
    }, [remainingTime]);

    useEffect(() => {
        if (isRunning && seconds > 0) {
            intervalRef.current = setInterval(() => {
                setSeconds(prev => {
                    const newSeconds = prev - 1;
                    if (newSeconds <= 0) {
                        setIsRunning(false);
                        onTimeUpRef.current();
                        return 0;
                    }
                    return newSeconds;
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, seconds]);

    // Notify parent of time change in a separate useEffect to avoid setState during render
    useEffect(() => {
        if (onTimeChangeRef.current && seconds > 0) {
            // Use setTimeout to defer the callback to avoid setState during render
            const timeoutId = setTimeout(() => {
                onTimeChangeRef.current?.(seconds);
            }, 0);
            return () => clearTimeout(timeoutId);
        }
    }, [seconds]);

    // Save remaining time to localStorage whenever seconds change
    useEffect(() => {
        localStorage.setItem('examRemainingTime', seconds.toString());
    }, [seconds]);

    // Reset timer when initialMinutes changes (but not when remainingTime is controlled)
    useEffect(() => {
        if (remainingTime === undefined) {
            setSeconds(initialMinutes * 60);
            setIsRunning(true);
        }
    }, [initialMinutes, remainingTime]);

    const formatTime = () => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="text-2xl font-bold text-red-600">
            {formatTime()}
        </div>
    );
};

export default Timer;
