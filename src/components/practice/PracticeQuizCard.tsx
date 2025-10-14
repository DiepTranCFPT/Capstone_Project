import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiRotateCcw, FiCheck, FiX } from 'react-icons/fi';

interface Question {
    id: number;
    text: string;
    options: { id: string; text: string }[];
    correctAnswer: string;
    explanation: string;
}

interface PracticeQuizCardProps {
    questions: Question[];
    currentIndex: number;
    onNext: () => void;
    onPrevious: () => void;
    correctCount: number;
    totalCount: number;
}

const PracticeQuizCard: React.FC<PracticeQuizCardProps> = ({
    questions,
    currentIndex,
    onNext,
    onPrevious,
    correctCount,
    totalCount
}) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const currentQuestion = questions[currentIndex];

    const handleAnswerSelect = (answerId: string) => {
        if (showResult) return;

        setSelectedAnswer(answerId);
        const correct = answerId === currentQuestion.correctAnswer;
        setIsCorrect(correct);
        setShowResult(true);
    };

    const handleNext = () => {
        setSelectedAnswer('');
        setShowResult(false);
        setIsCorrect(false);
        onNext();
    };

    const handleRetry = () => {
        setSelectedAnswer('');
        setShowResult(false);
        setIsCorrect(false);
    };

    const getCorrectAnswerText = () => {
        const correctOption = currentQuestion.options.find(opt => opt.id === currentQuestion.correctAnswer);
        return correctOption ? correctOption.text : '';
    };



    return (
        <div className="w-full max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-gray-600 font-medium">
                    Câu {currentIndex + 1} / {questions.length}
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-teal-200/50 shadow-sm">
                    <span className="text-teal-600 font-semibold">{correctCount}</span>
                    <span className="text-gray-600"> / {totalCount} đúng</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-teal-100/60 rounded-full h-3 mb-8 shadow-inner">
                <div
                    className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                ></div>
            </div>

            {/* Question Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-teal-200/60 p-8 shadow-xl">
                <h3 className="text-xl font-semibold text-gray-800 mb-8 leading-relaxed">
                    {currentQuestion.text}
                </h3>

                {/* Options */}
                <div className="space-y-3 mb-8">
                    {currentQuestion.options.map((option) => {
                        const isSelected = selectedAnswer === option.id;
                        const isCorrectAnswer = option.id === currentQuestion.correctAnswer;
                        const showCorrect = showResult && isCorrectAnswer;
                        const showIncorrect = showResult && isSelected && !isCorrect;

                        return (
                            <button
                                key={option.id}
                                onClick={() => handleAnswerSelect(option.id)}
                                disabled={showResult}
                                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                                    showCorrect
                                        ? 'bg-teal-100 border-teal-400 text-teal-800 shadow-md'
                                        : showIncorrect
                                        ? 'bg-red-100 border-red-400 text-red-800 shadow-md'
                                        : isSelected
                                        ? 'bg-teal-50 border-teal-300 text-teal-700 shadow-sm'
                                        : 'bg-gray-50/80 border-gray-200 text-gray-700 hover:bg-teal-50/60 hover:border-teal-200 hover:text-teal-800'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        showCorrect
                                            ? 'border-teal-500 bg-teal-500'
                                            : showIncorrect
                                            ? 'border-red-500 bg-red-500'
                                            : isSelected
                                            ? 'border-teal-400'
                                            : 'border-gray-400'
                                    }`}>
                                        {showCorrect && <FiCheck size={12} className="text-white" />}
                                        {showIncorrect && <FiX size={12} className="text-white" />}
                                    </div>
                                    <span className="font-medium">{option.text}</span>
                                    {showCorrect && (
                                        <div className="ml-auto">
                                            <span className="bg-teal-600 text-white px-2 py-1 rounded text-sm font-medium">
                                                Đúng
                                            </span>
                                        </div>
                                    )}
                                    {showIncorrect && (
                                        <div className="ml-auto">
                                            <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
                                                Sai
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Result Section */}
                {showResult && (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <div className={`p-4 rounded-lg border ${
                            isCorrect
                                ? 'bg-teal-50 border-teal-300'
                                : 'bg-red-50 border-red-300'
                        }`}>
                            <div className="flex items-center space-x-2 mb-2">
                                {isCorrect ? (
                                    <FiCheck className="text-teal-600" size={20} />
                                ) : (
                                    <FiX className="text-red-600" size={20} />
                                )}
                                <span className={`font-semibold ${
                                    isCorrect ? 'text-teal-700' : 'text-red-700'
                                }`}>
                                    {isCorrect ? 'Chính xác!' : 'Chưa đúng!'}
                                </span>
                            </div>

                            {!isCorrect && (
                                <div className="mb-3">
                                    <span className="text-gray-600 text-sm">
                                        Đáp án đúng: <span className="text-teal-600 font-medium">{getCorrectAnswerText()}</span>
                                    </span>
                                </div>
                            )}

                            <div className="bg-white/60 rounded-lg p-3 border border-gray-200">
                                <h4 className="text-gray-800 font-semibold mb-2">Giải thích:</h4>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    {currentQuestion.explanation}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleRetry}
                                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-all duration-200 border border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md"
                            >
                                <FiRotateCcw size={16} />
                                <span className="font-medium">Làm lại</span>
                            </button>

                            <button
                                onClick={handleNext}
                                className={`flex items-center space-x-2 text-white px-6 py-3 rounded-lg transition-all duration-200 border shadow-lg hover:shadow-xl ${
                                    currentIndex === questions.length - 1
                                        ? 'bg-gradient-to-r from-teal-600 to-cyan-600 border-teal-500/60 hover:from-teal-700 hover:to-cyan-700 hover:border-teal-400'
                                        : 'bg-gradient-to-r from-teal-600 to-cyan-600 border-teal-500/60 hover:from-teal-700 hover:to-cyan-700 hover:border-teal-400'
                                }`}
                            >
                                <span className="font-medium">
                                    {currentIndex === questions.length - 1 ? 'Hoàn thành' : 'Câu tiếp theo'}
                                </span>
                                <FiChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation (when not showing result) */}
            {!showResult && (
                <div className="flex items-center justify-between mt-8">
                    <button
                        onClick={onPrevious}
                        disabled={currentIndex === 0}
                        className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 px-4 py-3 rounded-lg transition-all duration-200 border border-gray-300 hover:border-gray-400 disabled:border-gray-200 shadow-sm hover:shadow-md disabled:shadow-none"
                    >
                        <FiChevronLeft size={18} />
                        <span className="font-medium">Trước</span>
                    </button>

                    <div className="text-gray-500 text-sm font-medium">
                        Chọn một đáp án để tiếp tục
                    </div>

                    <div className="w-32"></div> {/* Spacer for centering */}
                </div>
            )}

            {/* Statistics */}
            <div className="mt-6 text-center">
                <div className="inline-flex items-center space-x-6 bg-white/60 backdrop-blur-sm rounded-xl px-6 py-4 border border-teal-200/50 shadow-lg">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-teal-600">{correctCount}</div>
                        <div className="text-xs text-gray-600 font-medium">Đúng</div>
                    </div>
                    <div className="w-px h-8 bg-teal-200"></div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">{totalCount - correctCount}</div>
                        <div className="text-xs text-gray-600 font-medium">Sai</div>
                    </div>
                    <div className="w-px h-8 bg-teal-200"></div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-600">
                            {totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0}%
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Độ chính xác</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PracticeQuizCard;
