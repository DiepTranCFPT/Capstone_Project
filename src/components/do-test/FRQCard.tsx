import React, { useState } from 'react';
import type { FRQ } from '~/types/question';
import { useAuth } from '~/hooks/useAuth';
import { Button } from 'antd';
import { FaRobot } from 'react-icons/fa';

interface FRQCardProps {
    question: FRQ;
    questionNumber: number;
}

const FRQCard: React.FC<FRQCardProps> = ({ question, questionNumber }) => {
    const { spendTokens } = useAuth();
    const [isAnalyzed, setIsAnalyzed] = useState(false);

    const handleAnalyze = () => {
        spendTokens(1);
        setIsAnalyzed(true);
        // Here you would typically make an API call to your AI service
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">{questionNumber}. {question.text}</h3>
            <textarea
                rows={6}
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
