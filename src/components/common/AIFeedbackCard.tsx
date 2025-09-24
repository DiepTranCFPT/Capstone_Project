import React from 'react';
import { FaRobot } from 'react-icons/fa';

interface AIFeedbackCardProps {
    feedback: {
        score: number;
        suggestions: string[];
    };
}

const AIFeedbackCard: React.FC<AIFeedbackCardProps> = ({ feedback }) => {
    return (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
                <FaRobot className="text-blue-500 text-2xl mr-3" />
                <h3 className="font-semibold text-blue-800 text-lg">AI Feedback Report</h3>
            </div>
            <div>
                <p className="text-gray-700 mb-2">
                    <strong>Estimated Score:</strong> {feedback.score}/10
                </p>
                <p className="text-gray-700 mb-2">
                    <strong>Suggestions for Improvement:</strong>
                </p>
                <ul className="list-disc list-inside text-gray-600">
                    {feedback.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AIFeedbackCard;
