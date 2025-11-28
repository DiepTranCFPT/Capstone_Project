import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs } from 'antd';
import Timer from '~/components/do-test/Timer';
import QuestionCard from '~/components/do-test/QuestionCard';
import FRQCard from '~/components/do-test/FRQCard';
import { useExamAttempt } from '~/hooks/useExamAttempt';
import { useEnhancedExamPersistence } from '~/hooks/useEnhancedExamPersistence';
import { useExamUnloadWarning } from '~/hooks/useExamUnloadWarning';
import type { ExamSubmissionAnswer, ActiveExamQuestion, ExamAnswer } from '~/types/test';


const DoTestPage: React.FC = () => {
    const { examId, attemptId } = useParams<{ examId?: string, testType?: 'full' | 'mcq' | 'frq', attemptId?: string }>();
    const navigate = useNavigate();
    const { submitAttempt, loading, error } = useExamAttempt();

    // Enhanced exam persistence hooks with dual-save mechanism
    const {
        saveExamProgress,
        loadExamProgress,
        clearExamProgress,
        startAutoSave,
        stopAutoSave,
        lastSavedTime,
        syncStatus,
        syncToServer
    } = useEnhancedExamPersistence();

    // Unload warning hook
    useExamUnloadWarning(true);

    const [showConFirmed, setShowConFirmed] = useState(false);
    const [isSubmit, setIsSubmit] = useState(false);
    const [isCancel, setIsCancel] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isManualSyncing, setIsManualSyncing] = useState(false);

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
        if (!activeExamData || sortedQuestions.length === 0) return;

        // 🥇 Priority 1: Cross-device savedAnswer from API
        const apiAnswers: Record<string, { selectedAnswerId?: string; frqAnswerText?: string }> = {};
        const answeredSet: Set<string> = new Set();

        sortedQuestions.forEach((question: ActiveExamQuestion) => {
            if (question.savedAnswer && (question.savedAnswer.selectedAnswerId || question.savedAnswer.frqAnswerText)) {
                apiAnswers[question.examQuestionId] = {
                    selectedAnswerId: question.savedAnswer.selectedAnswerId || undefined,
                    frqAnswerText: question.savedAnswer.frqAnswerText || undefined
                };
                answeredSet.add(question.examQuestionId);
            }
        });

        // 🎯 If there are API answers (mobile->web), use them
        if (Object.keys(apiAnswers).length > 0) {
            setAnswers(apiAnswers);
            setAnsweredQuestions(answeredSet);

            // ⏱️ Timer logic: localStorage saved time → API duration → default
            const savedProgress = loadExamProgress();
            if (savedProgress && savedProgress.remainingTime != null && savedProgress.remainingTime > 0) {
                setRemainingTime(savedProgress.remainingTime);
            } else if (activeExamData.durationInMinute) {
                setRemainingTime(activeExamData.durationInMinute * 60);
            }
            return; // 🚫 Don't load from localStorage
        }

        // 🥈 Priority 2: localStorage backup (ongoing exams)
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
        const answeredQuestionsSet: Set<string> = new Set();
        Object.keys(convertedAnswers).forEach(examQuestionId => {
            const answer = convertedAnswers[examQuestionId];
            if (answer && (answer.selectedAnswerId || (answer.frqAnswerText && answer.frqAnswerText.trim() !== ''))) {
                answeredQuestionsSet.add(examQuestionId);
            }
        });

        // Always update answeredQuestions when loading from localStorage
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
    }, [activeExamData, autoSaveCallback, startAutoSave, stopAutoSave]);

    // Manual sync function
    const handleManualSync = useCallback(async () => {
        if (!activeExamData?.examAttemptId || isManualSyncing) return;

        setIsManualSyncing(true);
        try {
            await syncToServer(
                activeExamData.examAttemptId,
                answersRef.current,
                answeredQuestionsRef.current
            );
        } finally {
            setIsManualSyncing(false);
        }
    }, [activeExamData?.examAttemptId, syncToServer, isManualSyncing]);

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
                navigate(`/exam-test`);
            } else {
                // If submission failed, close modal anyway to prevent getting stuck
                setShowConFirmed(false);
                console.error('Submission failed - no result returned');
            }
        } catch (err) {
            console.error('Submit failed:', err);
            setShowConFirmed(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setShowConFirmed(false);
        clearExamProgress();

        // Check if this is a combo test (has attemptId param)
        if (attemptId) {
            navigate('/exam-test');
        } else {
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
        setAnswers(prev => {
            const currentAnswer = prev[examQuestionId];
            
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

    // Get sync status display info
    const getSyncStatusInfo = () => {
        if (syncStatus.isSyncing) {
            return {
                text: 'Saving...',
                color: 'text-blue-600',
                icon: '🔄'
            };
        }
        if (syncStatus.syncError) {
            return {
                text: 'Saving failed',
                color: 'text-red-600',
                icon: '⚠️'
            };
        }
        if (syncStatus.hasUnsyncedChanges) {
            return {
                text: 'Unsaved changes',
                color: 'text-orange-600',
                icon: '⏳'
            };
        }
        if (syncStatus.lastSyncTime) {
            return {
                text: `Last saved: ${new Date(syncStatus.lastSyncTime).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}`,
                color: 'text-green-600',
                icon: '✅'
            };
        }
        return {
            text: 'Unsaved',
            color: 'text-gray-500',
            icon: '📱'
        };
    };

    const syncStatusInfo = getSyncStatusInfo();

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
                        <span className="font-semibold text-gray-700">⏱️ Time left:</span>
                        <Timer
                            initialMinutes={activeExamData?.durationInMinute || 60}
                            onTimeUp={handleSubmit}
                            remainingTime={remainingTime}
                            onTimeChange={setRemainingTime}
                        />
                    </div>
                    
                    {/* Auto-save indicator */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-teal-200/30">
                        <span className="text-sm text-gray-600">💾 Auto save:</span>
                        <div className="flex items-center gap-2">
                            {lastSavedTime && Date.now() - lastSavedTime < 2000 ? (
                                <div className="flex items-center gap-1 text-xs text-teal-600 font-medium">
                                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                                    Saving...
                                </div>
                            ) : lastSavedTime ? (
                                <span className="text-xs text-gray-500">
                                    {new Date(lastSavedTime).toLocaleTimeString('vi-VN', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            ) : (
                                <span className="text-xs text-gray-400">Unsaved</span>
                            )}
                        </div>
                    </div>

                    {/* Server sync indicator */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-teal-200/30">
                        <span className="text-sm text-gray-600">☁️ Sync server:</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs ${syncStatusInfo.color} flex items-center gap-1`}>
                                <span>{syncStatusInfo.icon}</span>
                                <span className="truncate max-w-24">{syncStatusInfo.text}</span>
                            </span>
                        </div>
                    </div>

                    {/* Manual sync button */}
                    {activeExamData?.examAttemptId && (
                        <button
                            onClick={handleManualSync}
                            disabled={isManualSyncing || syncStatus.isSyncing}
                            className="w-full mt-3 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            {isManualSyncing ? (
                                <>
                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                    Syncing...
                                </>
                            ) : (
                                <>
                                    <span>🔄</span>
                                    Sync now
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="bg-white/60 rounded-xl p-4 mb-6 border border-teal-200/50">
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-gray-700">📊 Progress</span>
                        <span className="text-sm text-gray-600">
                            {answeredQuestions.size}/{totalQuestions} questions
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
                            {totalQuestions > 0 ? Math.round((answeredQuestions.size / totalQuestions) * 100) : 0}% completed
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="bg-white/60 rounded-xl p-4 mb-6 border border-teal-200/50">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                            <span className="mr-2">📋</span>
                            Questions ({totalQuestions})
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
                        Submit
                    </button>
                    <button
                        onClick={handleConfirmCancel}
                        className="w-full bg-red-500 hover:to-red-700 text-white font-bold py-4 rounded-xl transition-all duration-200 border border-red-400/60 hover:border-red-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Cancel
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto bg-white/40">
                <div className="max-w-4xl mx-auto">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-6">⏳</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                Loading...
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                Please wait while we load the exam.
                            </p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-6">❌</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                Error loading exam
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                {error}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Try again
                            </button>
                        </div>
                    ) : activeExamData ? (
                        <Tabs
                            defaultActiveKey="mcq"
                            type="card"
                            className="custom-tabs"
                        >
                            {/* MCQ Tab */}
                            {(() => {
                                const mcqQuestions = sortedQuestions.filter((q: ActiveExamQuestion) => q.question.type === 'mcq');
                                return (
                                    <Tabs.TabPane
                                        tab={`MCQ (${mcqQuestions.length})`}
                                        key="mcq"
                                        className="space-y-8"
                                    >
                                        {mcqQuestions.map((q: ActiveExamQuestion) => {
                                            const index = sortedQuestions.findIndex((q2: ActiveExamQuestion) => q2.examQuestionId === q.examQuestionId);
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
                                        })}
                                    </Tabs.TabPane>
                                );
                            })()}

                            {/* FRQ Tab */}
                            {(() => {
                                const frqQuestions = sortedQuestions.filter((q: ActiveExamQuestion) => q.question.type === 'frq');
                                return (
                                    <Tabs.TabPane
                                        tab={`FRQ (${frqQuestions.length})`}
                                        key="frq"
                                        className="space-y-8"
                                    >
                                        {frqQuestions.map((q: ActiveExamQuestion) => {
                                            const index = sortedQuestions.indexOf(q);
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
                                        })}
                                    </Tabs.TabPane>
                                );
                            })()}
                        </Tabs>
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
                                {isSubmit ? 'Confirm Submit' : 'Confirm Cancel'}
                            </h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                {isSubmit
                                    ? 'Are you sure you want to submit the exam? This action cannot be undone.'
                                    : 'Are you sure you want to cancel the exam? All progress will be lost.'
                                }
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setShowConFirmed(false)}
                                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 border border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md"
                                >
                                    Cancel
                                </button>

                                {isCancel ? (
                                    <button
                                        onClick={handleCancel}
                                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg transition-all duration-200 border border-red-400/60 hover:border-red-300 shadow-lg hover:shadow-xl"
                                    >
                                        Confirm Cancel
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-200 border border-teal-500/60 hover:border-teal-400 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Confirm Submit'}
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
