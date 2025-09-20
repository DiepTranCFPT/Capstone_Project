import React from 'react';

interface FRQ {
    id: number;
    text: string;
}

interface FRQCardProps {
    question: FRQ;
    questionNumber: number;
}

const FRQCard: React.FC<FRQCardProps> = ({ question, questionNumber }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">{questionNumber}. {question.text}</h3>
            <textarea
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                placeholder="Type your answer here..."
            ></textarea>
        </div>
    );
};

export default FRQCard;