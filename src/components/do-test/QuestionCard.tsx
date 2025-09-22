import React from 'react';
import type { Question } from '~/types/test';

interface QuestionCardProps {
    question: Question;
    questionNumber: number;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, questionNumber }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">{questionNumber}. {question.text}</h3>
            <div className="space-y-3">
                {question.options.map(option => (
                    <label key={option.id} className="flex items-center space-x-3 cursor-pointer p-3 rounded-md hover:bg-gray-50 border border-gray-300">
                        <input type="radio" name={`question-${question.id}`} className="h-4 w-4" />
                        <span>{option.text}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default QuestionCard;