import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiShuffle } from 'react-icons/fi';

interface Question {
    id: number;
    text: string;
    options: { id: string; text: string }[];
    correctAnswer: string;
    // explanation: string;
}

interface FRQCardProps {
    questions: Question[];
    currentIndex: number;
    onNext: () => void;
    onPrevious: () => void;
    onShuffle: () => void;
}

const FRQCard: React.FC<FRQCardProps> = ({
    questions,
    currentIndex,
    onNext,
    onPrevious,
    onShuffle
}) => {
    const [userAnswer, setUserAnswer] = useState('');
    const [showAnswer, setShowAnswer] = useState(false);
    const currentQuestion = questions[currentIndex];

    console.log('FRQCard - Questions:', questions);
    console.log('FRQCard - Current Index:', currentIndex);
    console.log('FRQCard - Current Question:', currentQuestion);

    // Safety check - if no questions or invalid index, show loading/error state
    if (!questions || questions.length === 0 || !currentQuestion) {
        return (
            <div className="w-full max-w-4xl mx-auto text-center py-20">
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

    const toggleAnswer = () => {
        setShowAnswer(!showAnswer);
    };

    const getCorrectAnswerText = () => {
        // For FRQ, the correct answer is usually the first (and only) option
        return currentQuestion.options.length > 0 ? currentQuestion.options[0].text : '';
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-gray-600 font-medium">
                    Câu {currentIndex + 1} / {questions.length}
                </div>
                <button
                    onClick={onShuffle}
                    className="flex items-center space-x-2 bg-indigo-600/80 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 border border-indigo-500/60 hover:border-indigo-400 shadow-sm hover:shadow-md"
                >
                    <FiShuffle size={16} />
                    <span className="font-medium">Xáo trộn</span>
                </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-indigo-100/60 rounded-full h-3 mb-8 shadow-inner">
                <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                ></div>
            </div>

            {/* FRQ Content */}
            <div className="bg-white backdrop-blur-sm rounded-2xl border border-indigo-200/60 p-8 shadow-xl">
                {/* Question Section */}
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <div className="bg-indigo-600/80 text-white px-3 py-1 rounded-full text-sm shadow-md">
                            Câu hỏi tự luận
                        </div>
                    </div>
                    <div className="text-5xl mb-6 text-indigo-600">📝</div>
                    <h3 className="text-xl font-semibold text-gray-800 leading-relaxed">
                        {currentQuestion.text}
                    </h3>
                </div>

                {/* Answer Input Section */}
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <div className="bg-indigo-100/80 text-indigo-700 px-3 py-1 rounded-full text-sm shadow-sm">
                            Viết đáp án của bạn
                        </div>
                    </div>
                    <textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Nhập đáp án của bạn ở đây..."
                        className="w-full h-48 p-4 border border-indigo-200/60 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200/50 outline-none resize-none bg-indigo-50/30 text-gray-800 placeholder-gray-500"
                    />
                </div>

                {/* Show Answer Button */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={toggleAnswer}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 border border-indigo-500/60 hover:border-indigo-400 shadow-lg hover:shadow-xl"
                    >
                        {showAnswer ? 'Ẩn đáp án mẫu' : 'Hiện đáp án mẫu'}
                    </button>
                </div>

                {/* Answer Section */}
                {showAnswer && (
                    <div className="bg-gradient-to-br from-indigo-50/90 to-purple-50/90 rounded-xl p-6 border border-indigo-200/50 shadow-inner">
                        <div className="flex items-center mb-4">
                            <div className="bg-white/80 text-indigo-700 px-3 py-1 rounded-full text-sm shadow-sm">
                                Đáp án mẫu
                            </div>
                        </div>
                        <div className="bg-white/60 rounded-lg p-4 border border-indigo-200/30">
                            <p className="text-gray-800 text-base leading-relaxed whitespace-pre-line">
                                {getCorrectAnswerText()}
                            </p>
                        </div>
                    </div>
                )}
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

export default FRQCard;
