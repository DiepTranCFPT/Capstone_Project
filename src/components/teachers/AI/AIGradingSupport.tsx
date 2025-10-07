import { Card, Tag } from "antd";
import React from "react";
import { BulbOutlined } from '@ant-design/icons';
interface AIGradingSupportProps {
    studentAnswer: string
}

const AIGradingSupport: React.FC<AIGradingSupportProps> = ({ studentAnswer }) => {

    // In a real app, this would be a result of an API call analyzing studentAnswer
    const aiAnalysis = {
        suggestedScore: 85,
        keyPositivePoints: [
            "Clearly defines the law of inertia.",
            "Correctly identifies the relationship between force and motion."
        ],
        areasForImprovement: [
            "Could provide a real-world example to illustrate the concept.",
            "Minor grammatical error in the second sentence."
        ]
    };

    return (
        <Card
            title={
                <div className="flex items-center">
                    <BulbOutlined className="mr-2 text-yellow-500" /> AI Suggestion
                </div>
            }
            bordered={false}
            className="bg-blue-50"
        >
            <p className="text-xs text-gray-500 mb-2">Student Answer: {studentAnswer}</p>
            <p className="font-semibold">Suggested Score: <Tag color="blue">{aiAnalysis.suggestedScore}</Tag></p>
            <div className="mt-4">
                <p className="font-semibold text-green-700">Positive Points:</p>
                <ul className="list-disc list-inside text-sm">
                    {aiAnalysis.keyPositivePoints.map((point, index) => <li key={index}>{point}</li>)}
                </ul>
            </div>
            <div className="mt-4">
                <p className="font-semibold text-orange-700">Areas for Improvement:</p>
                <ul className="list-disc list-inside text-sm">
                    {aiAnalysis.areasForImprovement.map((point, index) => <li key={index}>{point}</li>)}
                </ul>
            </div>
        </Card>
    );
};

export default AIGradingSupport;