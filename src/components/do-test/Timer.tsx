import React, { useState, useEffect, useRef } from 'react';

const Timer: React.FC<{ initialMinutes: number, onTimeUp: () => void }> = ({ initialMinutes, onTimeUp }) => {
    const [seconds, setSeconds] = useState(() => {
        // Load saved time from localStorage, or use initial minutes
        const savedTime = localStorage.getItem('examRemainingTime');
        return savedTime ? parseInt(savedTime, 10) : initialMinutes * 60;
    });
    const [isRunning, setIsRunning] = useState(true);
    const onTimeUpRef = useRef(onTimeUp);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Update ref when onTimeUp changes
    useEffect(() => {
        onTimeUpRef.current = onTimeUp;
    }, [onTimeUp]);

    useEffect(() => {
        if (isRunning && seconds > 0) {
            intervalRef.current = setInterval(() => {
                setSeconds(prev => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        onTimeUpRef.current();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, seconds]);

    // Save remaining time to localStorage whenever seconds change
    useEffect(() => {
        localStorage.setItem('examRemainingTime', seconds.toString());
    }, [seconds]);

    // Reset timer when initialMinutes changes
    useEffect(() => {
        setSeconds(initialMinutes * 60);
        setIsRunning(true);
    }, [initialMinutes]);

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
