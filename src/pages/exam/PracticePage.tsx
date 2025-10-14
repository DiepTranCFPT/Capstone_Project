import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiHome } from 'react-icons/fi';
import FlashCard from '~/components/practice/FlashCard';
import PracticeQuizCard from '~/components/practice/PracticeQuizCard';
import { mockMCQ } from '~/data/mockTest';

const PracticePage: React.FC = () => {
    const { examId, practiceType, mode } = useParams<{
        examId: string;
        practiceType: 'mcq' | 'frq';
        mode?: 'flashcard' | 'quiz';
    }>();

    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [shuffledQuestions, setShuffledQuestions] = useState(mockMCQ);
    const [correctAnswers, setCorrectAnswers] = useState<boolean[]>([]);

    useEffect(() => {
        // Shuffle questions when component mounts or mode changes
        const shuffled = [...mockMCQ].sort(() => Math.random() - 0.5);
        setShuffledQuestions(shuffled);
    }, [mode]);

    const handleNext = () => {
        if (mode === 'quiz') {
            // For quiz mode, record if current answer was correct
            const wasCorrect = correctAnswers[currentIndex] || false;
            const newCorrectAnswers = [...correctAnswers];
            newCorrectAnswers[currentIndex] = wasCorrect;
            setCorrectAnswers(newCorrectAnswers);
        }

        if (currentIndex < shuffledQuestions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleShuffle = () => {
        const shuffled = [...shuffledQuestions].sort(() => Math.random() - 0.5);
        setShuffledQuestions(shuffled);
        setCurrentIndex(0);
    };

    const handleBackToExam = () => {
        navigate(`/exam-test/${examId}`);
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    // Calculate statistics for quiz mode
    const totalAnswered = correctAnswers.filter(answer => answer !== undefined).length;
    const correctCount = correctAnswers.filter(answer => answer === true).length;

    const getModeTitle = () => {
        if (mode === 'flashcard') return 'Flash Card';
        if (mode === 'quiz') return 'Bài Quiz Practice';
        return 'Luyện Tập';
    };

    const getModeDescription = () => {
        if (mode === 'flashcard') return 'Nhấn vào card để lật và xem đáp án';
        if (mode === 'quiz') return 'Chọn đáp án và kiểm tra kết quả ngay lập tức';
        return 'Chọn chế độ luyện tập phù hợp';
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className=" bg-gray-100 border-b border-gray-200 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleBackToExam}
                                className="flex items-center space-x-2 bg-backgroundColor hover:opacity-90 text-white px-4 py-2 rounded-lg transition-all duration-200 border"
                            >
                                <FiArrowLeft size={18} />
                                <span>Quay lại</span>
                            </button>

                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">
                                    {getModeTitle()}
                                </h1>
                                <p className="text-gray-600 text-sm">
                                    {getModeDescription()}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleBackToHome}
                            className="flex items-center space-x-2 bg-backgroundColor hover:opacity-90 text-white px-4 py-2 rounded-lg transition-all duration-200 border"
                        >
                            <FiHome size={18} />
                            <span>Trang chủ</span>
                        </button>
                    </div>

                    {/* Mode indicator */}
                    <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-600">Bài học:</span>
                        <span className="text-emerald-400 font-medium">{examId}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-600">Loại:</span>
                        <span className="text-blue-400 font-medium capitalize">{practiceType}</span>
                        {mode && (
                            <>
                                <span className="text-gray-600">•</span>
                                <span className="text-gray-600">Chế độ:</span>
                                <span className="text-purple-400 font-medium capitalize">{mode}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
                <div className="max-w-6xl mx-auto">
                    {mode === 'flashcard' && (
                        <FlashCard
                            questions={shuffledQuestions}
                            currentIndex={currentIndex}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            onShuffle={handleShuffle}
                        />
                    )}

                    {mode === 'quiz' && (
                        <PracticeQuizCard
                            questions={shuffledQuestions}
                            currentIndex={currentIndex}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            correctCount={correctCount}
                            totalCount={totalAnswered}
                        />
                    )}

                    {!mode && (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-6">📚</div>
                            <h3 className="text-2xl font-bold text-white mb-4">
                                Chọn chế độ luyện tập
                            </h3>
                            <p className="text-gray-300 mb-8 max-w-md mx-auto">
                                Vui lòng chọn chế độ học phù hợp từ trang trước để bắt đầu luyện tập.
                            </p>
                            <button
                                onClick={handleBackToExam}
                                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Chọn chế độ
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-100 border-t border-gray-200 p-4 mt-12">
                <div className="max-w-6xl mx-auto text-center">
                    <p className="text-gray-600 text-sm">
                        💡 Mẹo: Không giới hạn thời gian - hãy dành thời gian suy nghĩ kỹ từng câu hỏi
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PracticePage;
