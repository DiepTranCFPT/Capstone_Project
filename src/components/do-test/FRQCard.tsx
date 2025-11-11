import React, { useState, useEffect, useRef } from 'react';
import type { FRQ } from '~/types/question';
import { useAuth } from '~/hooks/useAuth';
import { Button } from 'antd';
import { FaRobot } from 'react-icons/fa';

interface FRQCardProps {
    question: FRQ;
    questionNumber: number;
    savedAnswer?: string;
    onAnswerChange?: (questionIndex: number, hasAnswer: boolean, answerData?: { selectedAnswerId?: string; frqAnswerText?: string }) => void;
}

const FRQCard: React.FC<FRQCardProps> = ({ question, questionNumber, savedAnswer, onAnswerChange }) => {
    const { spendTokens } = useAuth();
    const [isAnalyzed, setIsAnalyzed] = useState(false);
    const [answerText, setAnswerText] = useState(savedAnswer || '');
    const isInitialMountRef = useRef(true);
    const prevSavedAnswerRef = useRef<string | undefined>(savedAnswer);
    const isSyncingRef = useRef(false);

    // Sync answerText when savedAnswer prop changes (e.g., when loaded from localStorage)
    useEffect(() => {
        // Only sync if savedAnswer actually changed from parent
        if (savedAnswer !== prevSavedAnswerRef.current) {
            const newValue = savedAnswer || '';
            prevSavedAnswerRef.current = savedAnswer;

            // Always update if prop changed, using functional update to avoid dependency
            setAnswerText(prevText => {
                if (newValue !== prevText) {
                    isSyncingRef.current = true;
                    // Reset flag after state update completes
                    requestAnimationFrame(() => {
                        isSyncingRef.current = false;
                    });
                    return newValue;
                }
                return prevText;
            });
        }
    }, [savedAnswer]); // Only depend on savedAnswer

    // Notify parent about saved answer on initial mount
    useEffect(() => {
        if (savedAnswer && savedAnswer.trim() !== '' && onAnswerChange && isInitialMountRef.current) {
            onAnswerChange(questionNumber - 1, true, {
                selectedAnswerId: undefined,
                frqAnswerText: savedAnswer.trim() || undefined
            });
        }
    }, []); // Empty dependency array - only run once on mount

    // Notify parent when answerText changes (skip on initial mount and when syncing)
    useEffect(() => {
        // Skip if we're currently syncing from prop
        if (isSyncingRef.current) {
            return;
        }

        // Always notify on initial mount if there's a saved answer
        const shouldNotify = !isInitialMountRef.current || (savedAnswer && savedAnswer.trim() !== '');

        if (shouldNotify && onAnswerChange) {
            const trimmedText = answerText.trim();
            onAnswerChange(questionNumber - 1, trimmedText !== '', {
                selectedAnswerId: undefined,
                frqAnswerText: trimmedText || undefined
            });
        }

        if (isInitialMountRef.current) {
            isInitialMountRef.current = false;
        }
    }, [answerText, questionNumber, onAnswerChange]); // Remove savedAnswer from deps to avoid array size changes

    const handleAnalyze = () => {
        spendTokens(1);
        setIsAnalyzed(true);
        // Here you would typically make an API call to your AI service
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setAnswerText(e.target.value);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">{questionNumber}. {question.text}</h3>
            <textarea
                rows={6}
                value={answerText}
                onChange={handleTextChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                placeholder="Type your answer here..."
            ></textarea>
            <div className="mt-4">
                <Button
                    icon={<FaRobot />}
                    onClick={handleAnalyze}
                    disabled={isAnalyzed}
                    className="flex items-center"
                >
                    {isAnalyzed ? 'Analyzed' : 'Phân tích với AI (1 Token)'}
                </Button>
            </div>
        </div>
    );
};

export default FRQCard;
