import React, { useState, useEffect } from 'react';

const Timer: React.FC<{ initialMinutes: number, onTimeUp: () => void }> = ({ initialMinutes, onTimeUp }) => {
    const [seconds, setSeconds] = useState(initialMinutes * 60);

    useEffect(() => {
        if (seconds <= 0) {
            onTimeUp();
            return;
        }
        const interval = setInterval(() => {
            setSeconds(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [seconds, onTimeUp]);

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