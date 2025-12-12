import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdHourglassEmpty, MdCheckCircle, MdError, MdClose } from 'react-icons/md';
import { useExamAttempt } from '~/hooks/useExamAttempt';

interface WaitResultModalProps {
    isOpen: boolean;
    attemptId: string;
    onClose: () => void;
}

type ModalState = 'asking' | 'waiting' | 'success' | 'timeout';

const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const WaitResultModal: React.FC<WaitResultModalProps> = ({ isOpen, attemptId, onClose }) => {
    const navigate = useNavigate();
    const { subscribeAttemptResult } = useExamAttempt();
    const [state, setState] = useState<ModalState>('asking');
    const [elapsedTime, setElapsedTime] = useState(0);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setState('asking');
            setElapsedTime(0);
        }
    }, [isOpen]);

    // Handle waiting for result with timeout
    const startWaiting = useCallback(async () => {
        setState('waiting');
        const startTime = Date.now();

        // Start elapsed time counter
        const intervalId = setInterval(() => {
            const elapsed = Date.now() - startTime;
            setElapsedTime(Math.floor(elapsed / 1000));

            if (elapsed >= TIMEOUT_DURATION) {
                clearInterval(intervalId);
                setState('timeout');
            }
        }, 1000);

        try {
            // Call subscribe API to wait for grading result
            const result = await subscribeAttemptResult(attemptId);
            clearInterval(intervalId);

            if (result) {
                setState('success');
                // Navigate to result page after short delay
                setTimeout(() => {
                    navigate(`/test-result/${attemptId}`);
                }, 1000);
            } else {
                setState('timeout');
            }
        } catch (error) {
            clearInterval(intervalId);
            console.error('Error waiting for result:', error);
            setState('timeout');
        }
    }, [attemptId, navigate, subscribeAttemptResult]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
                {/* Close button */}
                {state !== 'waiting' && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <MdClose size={24} />
                    </button>
                )}

                {/* Asking State */}
                {state === 'asking' && (
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-teal-100 flex items-center justify-center">
                            <MdHourglassEmpty className="text-4xl text-teal-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">
                            Exam submitted successfully!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Do you want to wait for the result?
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200"
                            >
                                No, do it later
                            </button>
                            <button
                                onClick={startWaiting}
                                className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition-all duration-200"
                            >
                                Yes, wait for result
                            </button>
                        </div>
                    </div>
                )}

                {/* Waiting State */}
                {state === 'waiting' && (
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-teal-100 flex items-center justify-center">
                            <div className="animate-spin">
                                <MdHourglassEmpty className="text-4xl text-teal-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">
                            Waiting for result...
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Please wait while the system grades your exam
                        </p>
                        <div className="text-3xl font-bold text-teal-600 mb-4">
                            {formatTime(elapsedTime)}
                        </div>
                        <p className="text-sm text-gray-500">
                            Maximum wait time: 5 minutes
                        </p>
                        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-teal-500 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min((elapsedTime / 300) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Success State */}
                {state === 'success' && (
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                            <MdCheckCircle className="text-4xl text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">
                            Result is ready!
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Redirecting to result page...
                        </p>
                    </div>
                )}

                {/* Timeout State */}
                {state === 'timeout' && (
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center">
                            <MdError className="text-4xl text-orange-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">
                            Error!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            The wait time has exceeded. The result will be updated later, you can check it in your "History" section.
                        </p>
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition-all duration-200"
                        >
                            Understand
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WaitResultModal;
