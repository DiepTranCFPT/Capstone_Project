import React, { useEffect } from 'react';

interface TimerProps {
    initialMinutes: number;
    onTimeUp: () => void;
    remainingTime?: number;
    onTimeChange?: (seconds: number) => void;
}

const Timer: React.FC<TimerProps> = ({ remainingTime = 0 }) => {
    // Save remaining time to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('examRemainingTime', remainingTime.toString());
    }, [remainingTime]);

    const formatTime = () => {
        const mins = Math.floor(remainingTime / 60);
        const secs = remainingTime % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="text-2xl font-bold text-red-600">
            {formatTime()}
        </div>
    );
};

export default Timer;
