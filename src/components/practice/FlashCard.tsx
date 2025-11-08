import React, { useState } from 'react';
import { FiRotateCcw, FiChevronLeft, FiChevronRight, FiShuffle } from 'react-icons/fi';

interface Question {
    id: number;
    text: string;
    options: { id: string; text: string }[];
    correctAnswer: string;
}

interface FlashCardProps {
    questions: Question[];
    currentIndex: number;
    onNext: () => void;
    onPrevious: () => void;
    onShuffle: () => void;
}

const FlashCard: React.FC<FlashCardProps> = ({
    questions,
    currentIndex,
    onNext,
    onPrevious,
    onShuffle
}) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const currentQuestion = questions[currentIndex];

    console.log('FlashCard - Questions:', questions);
    console.log('FlashCard - Current Index:', currentIndex);
    console.log('FlashCard - Current Question:', currentQuestion);

    // Safety check - if no questions or invalid index, show loading/error state
    if (!questions || questions.length === 0 || !currentQuestion) {
        return (
            <div className="w-full max-w-2xl mx-auto text-center py-20">
                <div className="text-6xl mb-6">📝</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {questions && questions.length === 0 ? 'Không có câu hỏi nào' : 'Đang tải câu hỏi...'}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {questions && questions.length === 0
                        ? 'Hiện tại chưa có câu hỏi nào để luyện tập.'
                        : 'Vui lòng đợi trong giây lát để chúng tôi tải câu hỏi luyện tập.'
                    }
                </p>
            </div>
        );
    }

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const getCorrectAnswerText = () => {
        const correctOption = currentQuestion.options.find(opt => opt.id === currentQuestion.correctAnswer);
        return correctOption ? correctOption.text : '';
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-gray-600 font-medium">
                    Câu {currentIndex + 1} / {questions.length}
                </div>
                <button
                    onClick={onShuffle}
                    className="flex items-center space-x-2 bg-teal-600/80 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-all duration-200 border border-teal-500/60 hover:border-teal-400 shadow-sm hover:shadow-md"
                >
                    <FiShuffle size={16} />
                    <span className="font-medium">Xáo trộn</span>
                </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-teal-100/60 rounded-full h-3 mb-8 shadow-inner">
                <div
                    className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                ></div>
            </div>

            {/* Flash Card */}
            <div className="relative">
                <div
                    className={`relative w-full h-96 cursor-pointer transition-transform duration-700 transform-style-preserve-3d ${
                        isFlipped ? 'rotate-y-180' : ''
                    }`}
                    onClick={handleFlip}
                >
                    {/* Front of card */}
                    <div className="absolute inset-0 w-full h-full backface-hidden">
                        <div className="w-full h-full bg-white backdrop-blur-sm rounded-2xl border border-teal-200/60 hover:border-teal-300/80 p-8 flex flex-col items-center justify-center text-center shadow-xl">
                            <div className="absolute top-4 right-4 bg-teal-600/80 text-white px-3 py-1 rounded-full text-sm shadow-md">
                                Nhấn để lật
                            </div>
                            <div className="text-6xl mb-6 text-teal-600">❓</div>
                            <h3 className="text-xl font-semibold text-gray-800 leading-relaxed">
                                {currentQuestion.text}
                            </h3>
                            <div className="mt-6 text-teal-600/70 text-sm font-medium">
                                Nhấn vào card để xem đáp án
                            </div>
                        </div>
                    </div>

                    {/* Back of card */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                        <div className="w-full h-full bg-gradient-to-br from-teal-600/90 via-teal-700/95 to-cyan-600/90 backdrop-blur-sm rounded-2xl border border-teal-400/60 p-8 flex flex-col justify-center text-center shadow-2xl">
                            <div className="absolute top-4 left-4 bg-white/20 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                                Đáp án
                            </div>
                            <div className="text-4xl mb-4 text-white">✅</div>

                            <div className="space-y-4">
                                <div className="bg-white/15 rounded-lg p-4 border border-white/30 backdrop-blur-sm">
                                    <h4 className="text-white font-semibold mb-2">Đáp án đúng:</h4>
                                    <p className="text-cyan-100 text-lg font-medium">
                                        {getCorrectAnswerText()}
                                    </p>
                                </div>                              
                            </div>

                            <div className="mt-6 text-cyan-200/80 text-sm">
                                Nhấn để lật lại câu hỏi
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
                <button
                    onClick={onPrevious}
                    disabled={currentIndex === 0}
                    className="flex items-center space-x-2 bg-white hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 px-4 py-3 rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-400 disabled:border-gray-200 shadow-sm hover:shadow-md disabled:shadow-none"
                >
                    <FiChevronLeft size={18} />
                    <span className="font-medium">Trước</span>
                </button>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleFlip}
                        className="flex items-center space-x-2 bg-backgroundColor hover:from-teal-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg transition-all duration-200 border border-teal-500/60 hover:border-teal-400 shadow-lg hover:shadow-xl"
                    >
                        <FiRotateCcw size={18} />
                        <span className="font-medium">{isFlipped ? 'Ẩn đáp án' : 'Hiện đáp án'}</span>
                    </button>
                </div>

                <button
                    onClick={onNext}
                    disabled={currentIndex === questions.length - 1}
                    className="flex items-center space-x-2 bg-white hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 px-4 py-3 rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-400 disabled:border-gray-200 shadow-sm hover:shadow-md disabled:shadow-none"
                >
                    <span className="font-medium">Tiếp</span>
                    <FiChevronRight size={18} />
                </button>
            </div>

            {/* Statistics */}
            <div className="mt-6 text-center">
                <div className="inline-flex items-center space-x-6 bg-white/60 backdrop-blur-sm rounded-xl px-6 py-4 border border-teal-200/50 shadow-lg">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-teal-600">{currentIndex + 1}</div>
                        <div className="text-xs text-gray-600 font-medium">Đã học</div>
                    </div>
                    <div className="w-px h-8 bg-teal-200"></div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">{questions.length - currentIndex - 1}</div>
                        <div className="text-xs text-gray-600 font-medium">Còn lại</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlashCard;
