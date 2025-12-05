import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiHome } from 'react-icons/fi';
import FRQCard from '~/components/practice/FRQCard';
import { usePracticeQuestions } from '~/hooks/usePracticeQuestions';
import { useExams } from '~/hooks/useExams';

const FRQPracticePage: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();
    const { questions: apiQuestions, loading, shuffleQuestions } = usePracticeQuestions('frq');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [shuffledQuestions, setShuffledQuestions] = useState<typeof apiQuestions>([]);

    const { currentExam, fetchExamById } = useExams();

    useEffect(() => {
        if (examId) {
            fetchExamById(examId);
        }
    }, [examId]);
    
    useEffect(() => {
        // Update shuffled questions when API questions change
        if (apiQuestions.length > 0) {
            const shuffled = [...apiQuestions].sort(() => Math.random() - 0.5);
            console.log('FRQPracticePage - Setting shuffled questions:', shuffled);
            setShuffledQuestions(shuffled);
        } else {
            console.log('FRQPracticePage - No API questions to shuffle');
        }
    }, [apiQuestions]);

    useEffect(() => {
        // Reset current index when questions change
        setCurrentIndex(0);
    }, [shuffledQuestions]);

    const handleNext = () => {
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
        shuffleQuestions();
        setCurrentIndex(0);
    };

    const handleBackToExam = () => {
        navigate(`/exam-details/${examId}`);
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-gray-100 border-b border-gray-200 p-6">
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
                                    Luyện Tập Tự Luận (FRQ)
                                </h1>
                                <p className="text-gray-600 text-sm">
                                    Viết đáp án và so sánh với đáp án mẫu
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
                        <span className="text-emerald-400 font-medium">{currentExam?.title}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-600">Loại:</span>
                        <span className="text-purple-400 font-medium">Tự luận (FRQ)</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-600">Chế độ:</span>
                        <span className="text-indigo-400 font-medium">Luyện tập</span>
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
                                Hiện tại chưa có câu hỏi tự luận nào để luyện tập. Vui lòng quay lại sau.
                            </p>
                            <button
                                onClick={handleBackToExam}
                                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Quay lại
                            </button>
                        </div>
                    )}

                    {!loading && shuffledQuestions.length > 0 && (
                        <FRQCard
                            questions={shuffledQuestions}
                            currentIndex={currentIndex}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            onShuffle={handleShuffle}
                        />
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-100 border-t border-gray-200 p-4 mt-12">
                <div className="max-w-6xl mx-auto text-center">
                    <p className="text-gray-600 text-sm">
                        💡 Mẹo: Không giới hạn thời gian - hãy dành thời gian suy nghĩ kỹ và viết đáp án chi tiết
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FRQPracticePage;
