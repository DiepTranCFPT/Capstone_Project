import React, { useState, useEffect } from 'react';
import type { QuestionBankItem } from '~/types/question';

interface QuestionCardProps {
    question: QuestionBankItem;
    questionNumber: number;
    onAnswerChange?: (questionIndex: number, hasAnswer: boolean, answerData?: { selectedAnswerId?: string; frqAnswerText?: string }) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, questionNumber, onAnswerChange }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');

    useEffect(() => {
        if (onAnswerChange) {
            onAnswerChange(questionNumber - 1, selectedAnswer !== '', {
                selectedAnswerId: selectedAnswer || undefined,
                frqAnswerText: undefined
            });
        }
    }, [selectedAnswer, questionNumber, onAnswerChange]);

    const handleAnswerChange = (answerId: string) => {
        setSelectedAnswer(answerId);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">{questionNumber}. {question.text}</h3>
            <div className="space-y-3">
                {question.options?.map(option => (
                    <label key={option.id} className="flex items-center space-x-3 cursor-pointer p-3 rounded-md hover:bg-gray-50 border border-gray-200">
                        <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option.id}
                            checked={selectedAnswer === option.id}
                            onChange={() => handleAnswerChange(option.id || '')}
                            className="h-4 w-4"
                        />
                        <span>{option.text}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default QuestionCard;
