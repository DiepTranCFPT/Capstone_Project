import React from 'react';
import type { QuestionBankItem, QuestionContext } from '~/types/question';
import LatexRenderer from '~/components/common/LatexRenderer';
import ContextDisplay from './ContextDisplay';
import { MdClose } from 'react-icons/md';
import { Image } from 'antd';
import { AudioOutlined } from '@ant-design/icons';

interface QuestionCardProps {
    question: QuestionBankItem;
    questionNumber: number;
    onAnswerChange: (answerId: string) => void;
    selectedAnswerId?: string;
    onClearAnswer?: () => void;
    questionContext?: QuestionContext;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    questionNumber,
    onAnswerChange,
    selectedAnswerId,
    onClearAnswer,
    questionContext
}) => {
    const handleAnswerChange = (answerId: string) => {
        onAnswerChange(answerId);
    };

    const handleClear = () => {
        if (onClearAnswer) {
            onClearAnswer();
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            {/* Context Display */}
            {questionContext && (
                <ContextDisplay context={questionContext} defaultExpanded={true} />
            )}

            {/* Question Header */}
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-gray-800 flex-1">
                    {questionNumber}. <LatexRenderer content={question.text} />
                </h3>
                {selectedAnswerId && onClearAnswer && (
                    <button
                        onClick={handleClear}
                        className="ml-3 px-2 py-1 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-all flex items-center gap-1"
                        title="Clear answer"
                    >
                        <MdClose className="w-4 h-4" />
                        Clear
                    </button>
                )}
            </div>

            {/* Question-level media (image/audio) */}
            {(question.imageUrl || question.audioUrl) && (
                <div className="mb-4 space-y-3">
                    {question.imageUrl && (
                        <div className="image-container">
                            <Image
                                src={question.imageUrl}
                                alt="Question image"
                                className="rounded-lg max-h-48 object-contain"
                                style={{ maxWidth: "100%" }}
                            />
                        </div>
                    )}
                    {question.audioUrl && (
                        <div className="audio-container bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <AudioOutlined />
                                <span>Listen to audio</span>
                            </div>
                            <audio
                                src={question.audioUrl}
                                controls
                                className="w-full"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Answer Options */}
            <div className="space-y-3">
                {question.options?.map(option => {
                    const isChecked = String(selectedAnswerId) === String(option.id);
                    return (
                        <label key={option.id} className={`flex items-center space-x-3 cursor-pointer p-3 rounded-md border transition-all ${isChecked ? 'bg-teal-50 border-teal-300' : 'hover:bg-gray-50 border-gray-200'}`}>
                            <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={option.id}
                                checked={isChecked}
                                onChange={() => handleAnswerChange(option.id || '')}
                                className="h-4 w-4 text-teal-600"
                            />
                            <span><LatexRenderer content={option.text} /></span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

export default QuestionCard;

