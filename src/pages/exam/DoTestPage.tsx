import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Timer from '~/components/do-test/Timer';
import QuestionCard from '~/components/do-test/QuestionCard';
import FRQCard from '~/components/do-test/FRQCard';
import { useExamAttempt } from '~/hooks/useExamAttempt';
import { useExamPersistence } from '~/hooks/useExamPersistence';
import { useExamUnloadWarning } from '~/hooks/useExamUnloadWarning';
import type { ExamSubmissionAnswer, ActiveExamQuestion, ExamAnswer } from '~/types/test';


const DoTestPage: React.FC = () => {
    const { examId, attemptId } = useParams<{ examId?: string, testType?: 'full' | 'mcq' | 'frq', attemptId?: string }>();
    const navigate = useNavigate();
    const { submitAttempt, loading, error } = useExamAttempt();

    // Exam persistence hooks
    const {
        saveExamProgress,
        loadExamProgress,
        clearExamProgress,
        startAutoSave,
        stopAutoSave,
        lastSavedTime
    } = useExamPersistence();

    // Unload warning hook
    useExamUnloadWarning(true);

    // Determine if this is a combo test
    // const isComboTest = examId === 'combo' || !!attemptId;

    const [showConFirmed, setShowConFirmed] = useState(false);
    const [isSubmit, setIsSubmit] = useState(false);
    const [isCancel, setIsCancel] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Check for stored attempt data from useExamAttempt - memoize to prevent recreation
    const currentActiveExam = useMemo(() => {
        const storedAttempt = localStorage.getItem('activeExamAttempt');
        return storedAttempt ? JSON.parse(storedAttempt) : null;
    }, []); // Empty dependency array since we only want to read once on mount

    // For individual exams, check if we have an attempt stored by exam ID
    const examSpecificAttempt = useMemo(() => {
        if (examId && !attemptId) {
            const attemptKey = `exam_attempt_${examId}`;
            const storedAttempt = localStorage.getItem(attemptKey);
            return storedAttempt ? JSON.parse(storedAttempt) : null;
        }
        return null;
    }, [examId, attemptId]);

    // Use the appropriate attempt data
    const activeExamData = currentActiveExam || examSpecificAttempt;


    // Initialize remaining time - use saved time if available, otherwise use full exam time
    const [remainingTime, setRemainingTime] = useState<number>(() => {
        const savedProgress = loadExamProgress();
        if (savedProgress && savedProgress.remainingTime > 0) {
            return savedProgress.remainingTime;
        }
        return activeExamData?.durationInMinute ? activeExamData.durationInMinute * 60 : 3600; // Default 60 minutes
    });

    // Timer countdown logic
    useEffect(() => {
        if (remainingTime > 0) {
            const timer = setTimeout(() => {
                setRemainingTime(prev => {
                    const newTime = prev - 1;
                    if (newTime <= 0) {
                        handleSubmit();
                        return 0;
                    }
                    return newTime;
                });
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [remainingTime]);

    // Initialize answers and answeredQuestions - will be loaded from localStorage in useEffect
    const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
    const [answers, setAnswers] = useState<Record<string, { selectedAnswerId?: string; frqAnswerText?: string }>>({});

    // Sort questions by orderNumber - moved before useEffect that uses it
    const sortedQuestions = useMemo(() =>
        activeExamData?.questions.slice().sort((a: ActiveExamQuestion, b: ActiveExamQuestion) => a.orderNumber - b.orderNumber) || [],
        [activeExamData?.questions]
    );

    // Refs to store current values for auto-save callback
    const answersRef = useRef(answers);
    const answeredQuestionsRef = useRef(answeredQuestions);
    const remainingTimeRef = useRef(remainingTime);

    // Refs for question navigation
    const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Update refs when values change
    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    useEffect(() => {
        answeredQuestionsRef.current = answeredQuestions;
    }, [answeredQuestions]);

    useEffect(() => {
        remainingTimeRef.current = remainingTime;
    }, [remainingTime]);

    // Load saved state from localStorage on mount - this ensures answers are displayed after reload
    useEffect(() => {
        if (!activeExamData || sortedQuestions.length === 0) {
            return;
        }

        const savedProgress = loadExamProgress();
        if (!savedProgress || !savedProgress.answers || Object.keys(savedProgress.answers).length === 0) {
            return;
        }

        // Convert old index-based answers to examQuestionId-based if needed
        let convertedAnswers = savedProgress.answers;
        const answerKeys = Object.keys(savedProgress.answers);
        const hasIndexKeys = answerKeys.some(key => !isNaN(Number(key)));

        if (hasIndexKeys && sortedQuestions.length > 0) {
            // Convert from index-based to examQuestionId-based
            convertedAnswers = {};
            answerKeys.forEach(key => {
                const index = parseInt(key, 10);
                if (index >= 0 && index < sortedQuestions.length) {
                    const question = sortedQuestions[index];
                    convertedAnswers[question.examQuestionId] = savedProgress.answers[key];
                }
            });
        }

        // Update answers - always update if we have saved data
        setAnswers(prevAnswers => {
            // If prevAnswers is empty, always update
            if (Object.keys(prevAnswers).length === 0) {
                return convertedAnswers;
            }
            // Otherwise, only update if different
            const hasChanges = JSON.stringify(prevAnswers) !== JSON.stringify(convertedAnswers);
            return hasChanges ? convertedAnswers : prevAnswers;
        });

        // Create answeredQuestions Set from answers - ensure it includes all questions with answers
        // Build the set directly from convertedAnswers to ensure accuracy
        const answeredQuestionsSet: Set<string> = new Set();

        // Add all question IDs that have answers in convertedAnswers
        // This is the source of truth - if there's an answer, the question is answered
        Object.keys(convertedAnswers).forEach(examQuestionId => {
            const answer = convertedAnswers[examQuestionId];
            // Add to set if answer has content (either selectedAnswerId or frqAnswerText)
            if (answer && (answer.selectedAnswerId || (answer.frqAnswerText && answer.frqAnswerText.trim() !== ''))) {
                answeredQuestionsSet.add(examQuestionId);
            }
        });

        // Always update answeredQuestions when loading from localStorage
        // Use a new Set reference to ensure re-render
        setAnsweredQuestions(new Set(answeredQuestionsSet));

        // Only update remaining time if we have a valid saved time
        setRemainingTime(prevTime => {
            if (savedProgress.remainingTime > 0 && savedProgress.remainingTime !== prevTime) {
                return savedProgress.remainingTime;
            }
            return prevTime;
        });
    }, [activeExamData, sortedQuestions, loadExamProgress]);

    // Auto-save callback - defined outside useEffect to avoid recreation
    const autoSaveCallback = useCallback(() => {
        // Get current values from refs at save time
        saveExamProgress(
            answersRef.current,
            answeredQuestionsRef.current,
            remainingTimeRef.current,
            activeExamData?.examAttemptId,
            examId
        );
    }, [saveExamProgress, activeExamData?.examAttemptId, examId]);

    // Auto-save setup - only depend on stable values
    useEffect(() => {
        if (activeExamData) {
            startAutoSave(autoSaveCallback, 30000); // Auto-save every 30 seconds

            return () => {
                stopAutoSave();
            };
        }
    }, [activeExamData, autoSaveCallback, startAutoSave, stopAutoSave]); // Include autoSaveCallback as dependency

    const handleSubmit = async () => {
        if (!activeExamData) return;

        setIsSubmitting(true);

        // Prepare answers using stored answer data
        const submissionAnswers: ExamSubmissionAnswer[] = sortedQuestions.map((q: ActiveExamQuestion) => {
            const answerData = answers[q.examQuestionId];
            return {
                examQuestionId: q.examQuestionId,
                selectedAnswerId: answerData?.selectedAnswerId || null,
                frqAnswerText: answerData?.frqAnswerText || null
            };
        });

        try {
            const result = await submitAttempt(activeExamData.examAttemptId, { answers: submissionAnswers });
            if (result) {
                // Close the confirmation modal
                setShowConFirmed(false);
                // Clear all exam progress after successful submission
                clearExamProgress();
                navigate('/exam-test');
            } else {
                // If submission failed, close modal anyway to prevent getting stuck
                setShowConFirmed(false);
                // Maybe show error message here
                console.error('Submission failed - no result returned');
            }
        } catch (err) {
            console.error('Submit failed:', err);
            // Close modal even on error to prevent getting stuck
            setShowConFirmed(false);
            // Handle error - maybe show toast
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        // Close the confirmation modal
        setShowConFirmed(false);

        // Clear all exam progress when cancelling
        clearExamProgress();

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

    const handleAnswerChange = useCallback((examQuestionId: string, hasAnswer: boolean, answerData?: { selectedAnswerId?: string; frqAnswerText?: string }) => {
        // Only update if answerData actually changed
        setAnswers(prev => {
            const currentAnswer = prev[examQuestionId];
            // Check if answerData is different from current
            if (answerData) {
                const isDifferent =
                    currentAnswer?.selectedAnswerId !== answerData.selectedAnswerId ||
                    currentAnswer?.frqAnswerText !== answerData.frqAnswerText;

                if (!isDifferent) {
                    return prev; // No change, return same reference
                }
            } else if (!hasAnswer && !currentAnswer) {
                return prev; // No change, return same reference
            }

            // Update answers
            const newAnswers = {
                ...prev,
                [examQuestionId]: {
                    ...prev[examQuestionId],
                    ...answerData
                }
            };

            // Update answeredQuestions
            setAnsweredQuestions(prevAnswered => {
                const newSet = new Set(prevAnswered);
                if (hasAnswer) {
                    newSet.add(examQuestionId);
                } else {
                    newSet.delete(examQuestionId);
                }
                // Only update if set actually changed
                if (newSet.size === prevAnswered.size &&
                    Array.from(newSet).every(id => prevAnswered.has(id))) {
                    return prevAnswered; // No change
                }
                return newSet;
            });

            return newAnswers;
        });
    }, []);

    // Navigation function to scroll to a specific question
    const scrollToQuestion = useCallback((questionIndex: number) => {
        const questionElement = questionRefs.current[questionIndex];
        if (questionElement) {
            questionElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, []);


    return (
        <div className="flex h-screen bg-teal-50/80">
            {/* Left Sidebar */}
            <aside className="w-72 bg-white/95 backdrop-blur-sm p-6 flex flex-col shadow-xl border-r border-teal-200/50">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">📚{activeExamData?.title || 'Exam'}</h2>
                    <div className="h-1 w-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></div>
                </div>

                <div className="bg-teal-50/60 rounded-xl p-4 mb-6 border border-teal-200/50">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">⏱️ Thời gian còn lại:</span>
                        <Timer
                            initialMinutes={activeExamData?.durationInMinute || 60}
                            onTimeUp={handleSubmit}
                            remainingTime={remainingTime}
                            onTimeChange={setRemainingTime}
                        />
                    </div>
                    {/* Auto-save indicator */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-teal-200/30">
                        <span className="text-sm text-gray-600">💾 Tự động lưu:</span>
                        <div className="flex items-center gap-2">
                            {lastSavedTime && Date.now() - lastSavedTime < 2000 ? (
                                <div className="flex items-center gap-1 text-xs text-teal-600 font-medium">
                                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                                    Đang lưu...
                                </div>
                            ) : lastSavedTime ? (
                                <span className="text-xs text-gray-500">
                                    {new Date(lastSavedTime).toLocaleTimeString('vi-VN', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            ) : (
                                <span className="text-xs text-gray-400">Chưa lưu</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white/60 rounded-xl p-4 mb-6 border border-teal-200/50">
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-gray-700">📊 Tiến độ</span>
                        <span className="text-sm text-gray-600">
                            {answeredQuestions.size}/{totalQuestions} câu
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 h-3 rounded-full transition-all duration-500 ease-out"
                            style={{
                                width: totalQuestions > 0 ? `${(answeredQuestions.size / totalQuestions) * 100}%` : '0%'
                            }}
                        ></div>
                    </div>
                    <div className="text-center">
                        <span className="text-xs text-gray-500">
                            {totalQuestions > 0 ? Math.round((answeredQuestions.size / totalQuestions) * 100) : 0}% hoàn thành
                        </span>
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
                                    key={q.examQuestionId}
                                    onClick={() => scrollToQuestion(index)}
                                    className={`w-10 h-10 rounded-lg border-2 text-sm font-bold transition-all duration-200 cursor-pointer ${answeredQuestions.has(q.examQuestionId)
                                        ? 'bg-teal-600 text-white border-teal-600 shadow-md hover:bg-teal-700'
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
                    ) : activeExamData ? (
                        <div className="space-y-8">
                            {sortedQuestions.map((q: ActiveExamQuestion, index: number) => {
                                if (q.question.type === 'mcq') {
                                    const currentAnswer = answers[q.examQuestionId];
                                    return (
                                        <div
                                            key={q.examQuestionId}
                                            ref={(el) => { questionRefs.current[index] = el; }}
                                        >
                                            <QuestionCard
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
                                                onAnswerChange={(answerId) => handleAnswerChange(q.examQuestionId, !!answerId, { selectedAnswerId: answerId })}
                                                selectedAnswerId={currentAnswer?.selectedAnswerId}
                                            />
                                        </div>
                                    );
                                } else if (q.question.type === 'frq') {
                                    const currentAnswer = answers[q.examQuestionId];
                                    return (
                                        <div
                                            key={q.examQuestionId}
                                            ref={(el) => { questionRefs.current[index] = el; }}
                                        >
                                            <FRQCard
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
                                                savedAnswer={currentAnswer?.frqAnswerText}
                                                onAnswerChange={(_questionIndex, hasAnswer, answerData) =>
                                                    handleAnswerChange(q.examQuestionId, hasAnswer, answerData)
                                                }
                                            />
                                        </div>
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
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isSubmit ? 'bg-teal-100' : 'bg-red-100'
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
