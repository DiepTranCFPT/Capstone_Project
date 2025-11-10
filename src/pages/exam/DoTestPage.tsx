import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Timer from '~/components/do-test/Timer';
import QuestionCard from '~/components/do-test/QuestionCard';
import FRQCard from '~/components/do-test/FRQCard';
import { useExamAttempt } from '~/hooks/useExamAttempt';
import type { ExamSubmissionAnswer, ActiveExamQuestion, ExamAnswer } from '~/types/test';


const DoTestPage: React.FC = () => {
    const { examId, attemptId } = useParams<{ examId?: string, testType?: 'full' | 'mcq' | 'frq', attemptId?: string }>();
    const navigate = useNavigate();
    const { submitAttempt, loading, error } = useExamAttempt();

    // Determine if this is a combo test
    // const isComboTest = examId === 'combo' || !!attemptId;

    const [showConFirmed, setShowConFirmed] = useState(false);
    const [isSubmit, setIsSubmit] = useState(false);
    const [isCancel, setIsCancel] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
    const [answers, setAnswers] = useState<Record<string, { selectedAnswerId?: string; frqAnswerText?: string }>>({});

    // Load saved state from localStorage
    useEffect(() => {
        const savedAnswers = localStorage.getItem('examAnswers');
        const savedAnsweredQuestions = localStorage.getItem('answeredQuestions');

        if (savedAnswers) {
            setAnswers(JSON.parse(savedAnswers));
        }

        if (savedAnsweredQuestions) {
            setAnsweredQuestions(new Set(JSON.parse(savedAnsweredQuestions)));
        }
    }, []);

    // Save state to localStorage whenever answers or answeredQuestions change
    useEffect(() => {
        if (Object.keys(answers).length > 0) {
            localStorage.setItem('examAnswers', JSON.stringify(answers));
        }
    }, [answers]);

    useEffect(() => {
        if (answeredQuestions.size > 0) {
            localStorage.setItem('answeredQuestions', JSON.stringify(Array.from(answeredQuestions)));
        }
    }, [answeredQuestions]);

    // Check for stored attempt data from useExamAttempt
    const storedAttempt = localStorage.getItem('activeExamAttempt');
    const parsedAttempt = storedAttempt ? JSON.parse(storedAttempt) : null;

    // Use stored attempt data
    const currentActiveExam = parsedAttempt;

    // Sort questions by orderNumber
    const sortedQuestions = useMemo(() =>
        currentActiveExam?.questions.slice().sort((a: ActiveExamQuestion, b: ActiveExamQuestion) => a.orderNumber - b.orderNumber) || [],
        [currentActiveExam?.questions]
    );

    const handleSubmit = async () => {
        if (!currentActiveExam) return;

        setIsSubmitting(true);

        // Prepare answers using stored answer data
        const submissionAnswers: ExamSubmissionAnswer[] = sortedQuestions.map((q: ActiveExamQuestion, index: number) => {
            const answerData = answers[index];
            return {
                examQuestionId: q.examQuestionId,
                selectedAnswerId: answerData?.selectedAnswerId || null,
                frqAnswerText: answerData?.frqAnswerText || null
            };
        });

        try {
            const result = await submitAttempt(currentActiveExam.examAttemptId, { answers: submissionAnswers });
            if (result) {
                // Close the confirmation modal
                setShowConFirmed(false);
                // Clear localStorage after successful submission
                localStorage.removeItem('examAnswers');
                localStorage.removeItem('answeredQuestions');
                localStorage.removeItem('examRemainingTime');
                localStorage.removeItem('activeExamAttempt');
                navigate('/exam-test')
            
            }
        } catch (err) {
            console.error('Submit failed:', err);
            // Handle error - maybe show toast
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        // Clear localStorage when cancelling
        localStorage.removeItem('examAnswers');
        localStorage.removeItem('answeredQuestions');
        localStorage.removeItem('examRemainingTime');
        localStorage.removeItem('activeExamAttempt');
        
        // Check if this is a combo test (has attemptId param)
        if (attemptId) {
            // For combo tests, redirect to exam test page
            navigate('/exam-test');
        } else {
            // For individual exams, redirect to exam details
            navigate(`/exam-details/${examId}`);
        }
    };

    const handleConfirmSubmit = () => {
        setShowConFirmed(true);
        setIsSubmit(true);
    };

    const handleConfirmCancel = () => {
        setShowConFirmed(true);
        setIsCancel(true);
    };

    const totalQuestions = sortedQuestions.length;

    const handleAnswerChange = useCallback((questionIndex: number, hasAnswer: boolean, answerData?: { selectedAnswerId?: string; frqAnswerText?: string }) => {
        setAnsweredQuestions(prev => {
            const newSet = new Set(prev);
            if (hasAnswer) {
                newSet.add(questionIndex);
            } else {
                newSet.delete(questionIndex);
            }
            return newSet;
        });

        if (answerData) {
            setAnswers(prev => ({
                ...prev,
                [questionIndex]: {
                    ...prev[questionIndex],
                    ...answerData
                }
            }));
        }
    }, []);


    return (
        <div className="flex h-screen bg-teal-50/80">
            {/* Left Sidebar */}
            <aside className="w-72 bg-white/95 backdrop-blur-sm p-6 flex flex-col shadow-xl border-r border-teal-200/50">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">📚 English Test</h2>
                    <div className="h-1 w-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></div>
                </div>

                <div className="bg-teal-50/60 rounded-xl p-4 mb-6 border border-teal-200/50">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">⏱️ Thời gian còn lại:</span>
                        <Timer initialMinutes={currentActiveExam?.durationInMinute || 60} onTimeUp={handleSubmit} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="bg-white/60 rounded-xl p-4 mb-6 border border-teal-200/50">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                            <span className="mr-2">📋</span>
                            Câu hỏi ({totalQuestions})
                        </h3>
                        <div className="grid grid-cols-5 gap-2">
                            {sortedQuestions.map((q: ActiveExamQuestion, index: number) => (
                                <button
                                    key={index}
                                    className={`w-10 h-10 rounded-lg border-2 text-sm font-bold transition-all duration-200 ${
                                        answeredQuestions.has(index)
                                            ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                                            : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-teal-100 hover:border-teal-300'
                                    }`}
                                >
                                    {q.orderNumber}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className='flex gap-3 mt-6'>
                    <button
                        onClick={handleConfirmSubmit}
                        className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-4 rounded-xl transition-all duration-200 border border-teal-500/60 hover:border-teal-400 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Nộp bài
                    </button>
                    <button
                        onClick={handleConfirmCancel}
                        className="w-full bg-red-500 hover:to-red-700 text-white font-bold py-4 rounded-xl transition-all duration-200 border border-red-400/60 hover:border-red-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Hủy
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto bg-white/40">
                <div className="max-w-4xl mx-auto space-y-8">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-6">⏳</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                Đang tải bài thi...
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                Vui lòng đợi trong giây lát để chúng tôi tải bài thi.
                            </p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-6">❌</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                Lỗi tải bài thi
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                {error}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : currentActiveExam ? (
                        <div className="space-y-8">
                            {sortedQuestions.map((q: ActiveExamQuestion, index: number) => {
                                if (q.question.type === 'mcq') {
                                    const currentAnswer = answers[index];
                                    return (
                                        <QuestionCard
                                            key={q.examQuestionId}
                                            question={{
                                                id: q.question.id,
                                                text: q.question.content,
                                                subject: q.question.subject.name,
                                                difficulty: q.question.difficulty.name as "easy" | "medium" | "hard",
                                                type: q.question.type as "mcq",
                                                createdBy: q.question.createdBy,
                                                createdAt: new Date().toISOString(),
                                                options: q.question.answers
                                                    .filter((a: ExamAnswer) => a.content !== null)
                                                    .map((a: ExamAnswer) => ({ id: a.id, text: a.content || '' }))
                                            }}
                                            questionNumber={q.orderNumber}
                                            onAnswerChange={(answerId) => handleAnswerChange(index, !!answerId, { selectedAnswerId: answerId })}
                                            selectedAnswerId={currentAnswer?.selectedAnswerId}
                                        />
                                    );
                                } else if (q.question.type === 'frq') {
                                    return (
                                        <FRQCard
                                            key={q.examQuestionId}
                                            question={{
                                                id: q.question.id,
                                                text: q.question.content,
                                                subject: q.question.subject.name,
                                                difficulty: q.question.difficulty.name as "easy" | "medium" | "hard",
                                                type: q.question.type as "frq",
                                                createdBy: q.question.createdBy,
                                                createdAt: new Date().toISOString(),
                                                expectedAnswer: "Sample answer" // This would come from API if available
                                            }}
                                            questionNumber={q.orderNumber}
                                            onAnswerChange={(_questionIndex, hasAnswer, answerData) =>
                                                handleAnswerChange(index, hasAnswer, answerData)
                                            }
                                        />
                                    );
                                }
                                return null;
                            })}
                        </div>
                    ) : null}
                </div>
            </main>

            {showConFirmed && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-teal-200/50 max-w-md mx-4">
                        <div className="text-center">
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                                isSubmit ? 'bg-teal-100' : 'bg-red-100'
                            }`}>
                                <span className="text-2xl">
                                    {isSubmit ? '✅' : '❌'}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">
                                {isSubmit ? 'Xác nhận nộp bài' : 'Xác nhận hủy'}
                            </h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                {isSubmit
                                    ? 'Bạn có chắc chắn muốn nộp bài? Hành động này không thể hoàn tác.'
                                    : 'Bạn có chắc chắn muốn hủy bài thi? Tất cả tiến độ sẽ bị mất.'
                                }
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setShowConFirmed(false)}
                                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 border border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md"
                                >
                                    Hủy bỏ
                                </button>

                                {isCancel ? (
                                    <button
                                        onClick={handleCancel}
                                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg transition-all duration-200 border border-red-400/60 hover:border-red-300 shadow-lg hover:shadow-xl"
                                    >
                                        Xác nhận hủy
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-200 border border-teal-500/60 hover:border-teal-400 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Đang nộp...' : 'Xác nhận nộp'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoTestPage;
