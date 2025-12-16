import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaArrowLeft, FaCheck, FaXmark, FaTrophy } from "react-icons/fa6";
import { Progress, Modal } from "antd";
import { useFlashcardSets } from "~/hooks/useFlashcardSets";
import Loading from "~/components/common/Loading";

const FlashcardQuizPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        quizQuestions,
        currentFlashcardSet,
        loading,
        error,
        fetchQuiz,
        fetchFlashcardSetById,
    } = useFlashcardSets();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [exitModalVisible, setExitModalVisible] = useState(false);
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (id && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchQuiz(id);
            fetchFlashcardSetById(id);
        }
    }, [id, fetchQuiz, fetchFlashcardSetById]);

    const currentQuestion = quizQuestions[currentQuestionIndex];
    const totalQuestions = quizQuestions.length;
    const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    const handleSelectAnswer = (answer: string) => {
        if (isAnswered) return;

        setSelectedAnswer(answer);
        setIsAnswered(true);

        if (answer === currentQuestion.correctAnswer) {
            setCorrectCount((prev) => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
        }
    };

    const handleRestart = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setCorrectCount(0);
        setShowResult(false);
    };

    const getOptionStyle = (option: string) => {
        if (!isAnswered) {
            return option === selectedAnswer
                ? "border-teal-400 bg-teal-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50";
        }

        if (option === currentQuestion.correctAnswer) {
            return "border-green-400 bg-green-50";
        }

        if (option === selectedAnswer && option !== currentQuestion.correctAnswer) {
            return "border-red-400 bg-red-50";
        }

        return "border-gray-200 opacity-50";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loading/>
            </div>
        );
    }

    if (error || quizQuestions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <p className="text-red-500 mb-4">
                    {error || "Unable to create quiz for this flashcard set"}
                </p>
                <Link to={`/flashcards/${id}`} className="text-teal-600 hover:underline">
                    Back to study
                </Link>
            </div>
        );
    }

    // Result Screen
    if (showResult) {
        const percentage = Math.round((correctCount / totalQuestions) * 100);
        const isPassed = percentage >= 70;

        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <div
                        className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${isPassed ? "bg-green-100" : "bg-orange-100"
                            }`}
                    >
                        <FaTrophy
                            className={`w-10 h-10 ${isPassed ? "text-green-500" : "text-orange-500"}`}
                        />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {isPassed ? "Excellent! 🎉" : "Keep it up! 💪"}
                    </h2>

                    <p className="text-gray-500 mb-6">
                        You have completed quiz "{currentFlashcardSet?.title}"
                    </p>

                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                        <div className="text-4xl font-bold text-gray-800 mb-2">
                            {correctCount}/{totalQuestions}
                        </div>
                        <p className="text-gray-500">Correct answers</p>
                        <Progress
                            percent={percentage}
                            status={isPassed ? "success" : "normal"}
                            showInfo={false}
                            className="mt-4"
                        />
                        <p className="text-sm text-gray-400 mt-2">{percentage}%</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleRestart}
                            className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
                        >
                            Retry Quiz
                        </button>
                        <Link
                            to={`/flashcards/${id}`}
                            className="w-full py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            Back to study
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setExitModalVisible(true)}
                            className="text-gray-600 hover:text-teal-600 transition-colors"
                        >
                            <FaArrowLeft className="w-5 h-5" />
                        </button>

                        <div className="flex-1 mx-6">
                            <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                                <span>Question {currentQuestionIndex + 1}/{totalQuestions}</span>
                                <span>{correctCount} correct</span>
                            </div>
                            <Progress
                                percent={progressPercent}
                                showInfo={false}
                                strokeColor="#0d9488"
                                trailColor="#e5e7eb"
                                size="small"
                            />
                        </div>

                        <button
                            onClick={() => setExitModalVisible(true)}
                            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Exit
                        </button>
                    </div>
                </div>
            </div>

            {/* Question */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
                    {currentQuestion.imageUrl && (
                        <img
                            src={currentQuestion.imageUrl}
                            alt="Question"
                            className="max-h-40 mx-auto mb-6 rounded-lg object-contain"
                        />
                    )}
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800 text-center">
                        {currentQuestion.question}
                    </h2>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleSelectAnswer(option)}
                            disabled={isAnswered}
                            className={`relative p-5 rounded-xl border-2 text-left transition-all ${getOptionStyle(
                                option
                            )} ${!isAnswered ? "cursor-pointer" : "cursor-default"}`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                                    {String.fromCharCode(65 + index)}
                                </span>
                                <span className="text-gray-700 font-medium">{option}</span>
                            </div>

                            {isAnswered && option === currentQuestion.correctAnswer && (
                                <div className="absolute top-3 right-3">
                                    <FaCheck className="w-5 h-5 text-green-500" />
                                </div>
                            )}

                            {isAnswered &&
                                option === selectedAnswer &&
                                option !== currentQuestion.correctAnswer && (
                                    <div className="absolute top-3 right-3">
                                        <FaXmark className="w-5 h-5 text-red-500" />
                                    </div>
                                )}
                        </button>
                    ))}
                </div>

                {/* Next Button */}
                {isAnswered && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={handleNext}
                            className="px-8 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors animate-fade-in"
                        >
                            {currentQuestionIndex < totalQuestions - 1
                                ? "Next Question"
                                : "View Results"}
                        </button>
                    </div>
                )}
            </div>

            {/* Exit Modal */}
            <Modal
                title="Thoát Quiz?"
                open={exitModalVisible}
                onOk={() => navigate(`/flashcards/${id}`)}
                onCancel={() => setExitModalVisible(false)}
                okText="Exit"
                cancelText="Continue"
            >
                <p>Your progress will not be saved.</p>
            </Modal>
        </div>
    );
};

export default FlashcardQuizPage;
