import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiHome } from 'react-icons/fi';
import FlashCard from '~/components/practice/FlashCard';
import PracticeQuizCard from '~/components/practice/PracticeQuizCard';
import FRQCard from '~/components/practice/FRQCard';
import { usePracticeQuestions } from '~/hooks/usePracticeQuestions';

const PracticePage: React.FC = () => {
    const { examId, practiceType, mode } = useParams<{
        examId: string;
        practiceType: 'mcq' | 'frq';
        mode?: 'flashcard' | 'quiz';
    }>();

    const navigate = useNavigate();
    const { questions: apiQuestions, loading, shuffleQuestions } = usePracticeQuestions(practiceType);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [shuffledQuestions, setShuffledQuestions] = useState<typeof apiQuestions>([]);
    const [correctAnswers, setCorrectAnswers] = useState<boolean[]>([]);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        // Update shuffled questions when API questions change
        if (apiQuestions.length > 0) {
            const shuffled = [...apiQuestions].sort(() => Math.random() - 0.5);
            console.log('PracticePage - Setting shuffled questions:', shuffled);
            setShuffledQuestions(shuffled);
        } else {
            console.log('PracticePage - No API questions to shuffle');
        }
    }, [apiQuestions]);

    useEffect(() => {
        // Reset current index when questions change
        setCurrentIndex(0);
        setCorrectAnswers([]);
    }, [shuffledQuestions]);

    const handleNext = () => {
        if (currentIndex < shuffledQuestions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // Reached the last question, complete the quiz
            setIsCompleted(true);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleShuffle = () => {
        shuffleQuestions();
        setCurrentIndex(0);
        setCorrectAnswers([]);
        setIsCompleted(false);
    };

    const handleAnswerSelected = (isCorrect: boolean) => {
        const newCorrectAnswers = [...correctAnswers];
        newCorrectAnswers[currentIndex] = isCorrect;
        setCorrectAnswers(newCorrectAnswers);
    };

    const handleBackToExam = () => {
        navigate(`/exam-details/${examId}`);
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
                    {loading && (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-6">⏳</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                Đang tải câu hỏi...
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                Vui lòng đợi trong giây lát để chúng tôi tải câu hỏi luyện tập.
                            </p>
                        </div>
                    )}

                    {!loading && shuffledQuestions.length === 0 && (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-6">📝</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                Không có câu hỏi nào
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                Hiện tại chưa có câu hỏi nào để luyện tập. Vui lòng quay lại sau.
                            </p>
                            <button
                                onClick={handleBackToExam}
                                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Quay lại
                            </button>
                        </div>
                    )}

                    {!loading && shuffledQuestions.length > 0 && mode === 'flashcard' && practiceType === 'mcq' && (
                        <FlashCard
                            questions={shuffledQuestions}
                            currentIndex={currentIndex}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            onShuffle={handleShuffle}
                        />
                    )}

                    {!loading && shuffledQuestions.length > 0 && mode === 'flashcard' && practiceType === 'frq' && (
                        <FRQCard
                            questions={shuffledQuestions}
                            currentIndex={currentIndex}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            onShuffle={handleShuffle}
                        />
                    )}

                    {mode === 'quiz' && practiceType === 'mcq' && !isCompleted && (
                        <PracticeQuizCard
                            questions={shuffledQuestions}
                            currentIndex={currentIndex}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            onAnswerSelected={handleAnswerSelected}
                            correctCount={correctCount}
                            totalCount={totalAnswered}
                        />
                    )}

                    {mode === 'quiz' && practiceType === 'mcq' && isCompleted && (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-6">🎉</div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-4">
                                Hoàn thành bài luyện tập!
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                Bạn đã hoàn thành tất cả câu hỏi trong bài luyện tập này.
                            </p>

                            {/* Final Statistics */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-teal-200/60 p-8 shadow-xl mb-8 max-w-md mx-auto">
                                <div className="text-center mb-6">
                                    <div className="text-4xl font-bold text-teal-600 mb-2">
                                        {correctCount}/{shuffledQuestions.length}
                                    </div>
                                    <div className="text-gray-600">Câu trả lời đúng</div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-teal-600">{correctCount}</div>
                                        <div className="text-xs text-gray-600 font-medium">Đúng</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-600">{shuffledQuestions.length - correctCount}</div>
                                        <div className="text-xs text-gray-600 font-medium">Sai</div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-cyan-600">
                                            {shuffledQuestions.length > 0 ? Math.round((correctCount / shuffledQuestions.length) * 100) : 0}%
                                        </div>
                                        <div className="text-xs text-gray-600 font-medium">Độ chính xác</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center space-x-4">
                                <button
                                    onClick={() => {
                                        setCurrentIndex(0);
                                        setCorrectAnswers([]);
                                        setIsCompleted(false);
                                    }}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-all duration-200 border border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md"
                                >
                                    Làm lại
                                </button>
                                <button
                                    onClick={handleBackToExam}
                                    className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Quay lại
                                </button>
                            </div>
                        </div>
                    )}

                    {mode === 'quiz' && practiceType === 'frq' && (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-6">📝</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                Chế độ Quiz không khả dụng cho câu hỏi tự luận
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                Vui lòng chọn chế độ Flash Card để xem đáp án mẫu cho câu hỏi tự luận.
                            </p>
                            <button
                                onClick={() => navigate(`/exam-details/${examId}`)}
                                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Quay lại
                            </button>
                        </div>
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
