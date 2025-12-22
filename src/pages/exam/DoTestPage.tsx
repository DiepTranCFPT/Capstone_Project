import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs } from 'antd';
import Timer from '~/components/do-test/Timer';
import QuestionCard from '~/components/do-test/QuestionCard';
import FRQCard from '~/components/do-test/FRQCard';
import ContextDisplay from '~/components/do-test/ContextDisplay';
import ProctoringStatus from '~/components/do-test/ProctoringStatus';
import ProctoringRulesModal from '~/components/do-test/ProctoringRulesModal';
import { useExamAttempt } from '~/hooks/useExamAttempt';
import { useEnhancedExamPersistence } from '~/hooks/useEnhancedExamPersistence';
import { useExamUnloadWarning } from '~/hooks/useExamUnloadWarning';
import { useExamProctoring } from '~/hooks/useExamProctoring';
import type { ExamSubmissionAnswer, ActiveExamQuestion, ExamAnswer } from '~/types/test';
import {
    MdOutlineMenuBook,
    MdTimer,
    MdSave,
    MdBarChart,
    MdList,
    MdHourglassEmpty,
    MdError,
    MdCheckCircle,
    MdCancel
} from 'react-icons/md';


const DoTestPage: React.FC = () => {
    const { examId, attemptId } = useParams<{ examId?: string, testType?: 'full' | 'mcq' | 'frq', attemptId?: string }>();
    const navigate = useNavigate();
    const { submitAttempt, loading, error } = useExamAttempt();

    // Proctoring state
    const [showProctoringRules, setShowProctoringRules] = useState(false);
    const [proctoringAccepted, setProctoringAccepted] = useState(false);
    const [timerStarted, setTimerStarted] = useState(false);
    const [showResumeModal, setShowResumeModal] = useState(false); // Modal to resume exam with fullscreen

    // Enhanced exam persistence hooks with dual-save mechanism
    const {
        saveExamProgress,
        loadExamProgress,
        clearExamProgress,
        startAutoSave,
        stopAutoSave,
        lastSavedTime
    } = useEnhancedExamPersistence();

    // Unload warning hook
    useExamUnloadWarning(true);

    const [showConFirmed, setShowConFirmed] = useState(false);
    const [isSubmit, setIsSubmit] = useState(false);
    const [isCancel, setIsCancel] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Proctoring hook with auto-submit callback
    const {
        violationCounts,
        totalViolations,
        isFullscreen,
        isProctoringActive,
        startProctoring,
        stopProctoring,
        // getProctoringMetadata,
    } = useExamProctoring(
        {
            enableTabDetection: true,
            enableCopyBlock: true,
            enableFullscreenMode: true,
            strictFullscreen: true,
            maxViolations: 4,
        },
        () => {
            // Auto-submit callback when max violations reached
            handleSubmit();
        },
        attemptId || examId // Pass attemptId/examId for localStorage persistence
    );

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

    // Helper function to calculate remaining time based on exam start time
    const calculateRemainingTime = useCallback(() => {
        if (!activeExamData) return 3600; // Default 60 minutes

        const examAttemptId = activeExamData.examAttemptId;
        const durationInSeconds = activeExamData.durationInMinute * 60;

        // Priority 1: Check if we have a cross-device resume timestamp with remainTime
        const remainTimeReceivedAtStr = localStorage.getItem(`exam_remaintime_received_at_${examAttemptId}`);
        const remainTimeValueStr = localStorage.getItem(`exam_remaintime_value_${examAttemptId}`);

        if (remainTimeReceivedAtStr && remainTimeValueStr) {
            const remainTimeReceivedAt = parseInt(remainTimeReceivedAtStr, 10);
            const remainTimeValue = parseInt(remainTimeValueStr, 10);
            const now = Date.now();
            const elapsedSinceReceived = Math.floor((now - remainTimeReceivedAt) / 1000);
            const remaining = remainTimeValue - elapsedSinceReceived;
            return Math.max(0, remaining);
        }

        // Priority 2: Calculate from localStorage timestamp (same device resume)
        const examStartedAtStr = localStorage.getItem(`exam_started_at_${examAttemptId}`);

        if (examStartedAtStr) {
            const examStartedAt = parseInt(examStartedAtStr, 10);
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - examStartedAt) / 1000);
            const remaining = durationInSeconds - elapsedSeconds;
            return Math.max(0, remaining);
        }

        return durationInSeconds;
    }, [activeExamData]);

    // Initialize remaining time - prioritize API remainTime for cross-device resume
    const [remainingTime, setRemainingTime] = useState<number>(() => {
        if (!activeExamData) return 3600;

        const examAttemptId = activeExamData.examAttemptId;
        // Priority 1: Check if we already have cross-device resume data stored (or passed from OngoingExams)
        const remainTimeReceivedAtStr = localStorage.getItem(`exam_remaintime_received_at_${examAttemptId}`);
        const remainTimeValueStr = localStorage.getItem(`exam_remaintime_value_${examAttemptId}`);

        if (remainTimeReceivedAtStr && remainTimeValueStr) {
            const remainTimeReceivedAt = parseInt(remainTimeReceivedAtStr, 10);
            const remainTimeValue = parseInt(remainTimeValueStr, 10);
            const now = Date.now();
            const elapsedSinceReceived = Math.floor((now - remainTimeReceivedAt) / 1000);
            const remaining = remainTimeValue - elapsedSinceReceived;
            // console.log('[DoTestPage] INIT Priority 1 (Stored keys):', { remainTimeValue, elapsedSinceReceived, remaining });
            return Math.max(0, remaining);
        }

        const durationInSeconds = activeExamData.durationInMinute * 60;

        // Priority 2: Use remainTime from API (cross-device resume)
        // remainTime is returned in SECONDS from the API
        if (activeExamData.remainTime && activeExamData.remainTime > 0) {

            // Store the timestamp when we received remainTime and its value
            // This allows calculateRemainingTime to properly track elapsed time
            localStorage.setItem(`exam_remaintime_received_at_${examAttemptId}`, Date.now().toString());
            localStorage.setItem(`exam_remaintime_value_${examAttemptId}`, activeExamData.remainTime.toString());

            // console.log('[DoTestPage] INIT Priority 2 (API remainTime):', activeExamData.remainTime);
            return activeExamData.remainTime;
        }

        // Priority 3: Calculate from localStorage timestamp (same device resume)
        const examStartedAtStr = localStorage.getItem(`exam_started_at_${examAttemptId}`);

        if (examStartedAtStr) {
            const examStartedAt = parseInt(examStartedAtStr, 10);
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - examStartedAt) / 1000);
            return Math.max(0, durationInSeconds - elapsedSeconds);
        }

        // Priority 4: Use full duration (fresh start)
        // Priority 4: Use full duration (fresh start)
        return durationInSeconds;
    });

    // Update remainingTime when activeExamData changes (especially when remainTime is available)
    useEffect(() => {
        if (!activeExamData) return;

        const examAttemptId = activeExamData.examAttemptId;
        const durationInSeconds = activeExamData.durationInMinute * 60;

        // Priority 1: Check if we already have cross-device resume data stored
        const remainTimeReceivedAtStr = localStorage.getItem(`exam_remaintime_received_at_${examAttemptId}`);
        const remainTimeValueStr = localStorage.getItem(`exam_remaintime_value_${examAttemptId}`);

        if (remainTimeReceivedAtStr && remainTimeValueStr) {
            const remainTimeReceivedAt = parseInt(remainTimeReceivedAtStr, 10);
            const remainTimeValue = parseInt(remainTimeValueStr, 10);
            const now = Date.now();
            const elapsedSinceReceived = Math.floor((now - remainTimeReceivedAt) / 1000);
            const remaining = remainTimeValue - elapsedSinceReceived;
            // console.log('[DoTestPage] Updating from stored remainTime:', remainTimeValue, '- elapsed:', elapsedSinceReceived, '= remaining:', remaining);
            setRemainingTime(Math.max(0, remaining));
            return;
        }

        // Priority 2: Use remainTime from API (cross-device resume)
        if (activeExamData.remainTime && activeExamData.remainTime > 0) {
            // console.log('[DoTestPage] Updating remainingTime from API:', activeExamData.remainTime, 'seconds');

            // Store the timestamp when we received remainTime and its value
            localStorage.setItem(`exam_remaintime_received_at_${examAttemptId}`, Date.now().toString());
            localStorage.setItem(`exam_remaintime_value_${examAttemptId}`, activeExamData.remainTime.toString());

            setRemainingTime(activeExamData.remainTime);
            return;
        }

        // Priority 3: Calculate from localStorage timestamp (same device resume)
        const examStartedAtStr = localStorage.getItem(`exam_started_at_${examAttemptId}`);

        if (examStartedAtStr) {
            const examStartedAt = parseInt(examStartedAtStr, 10);
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - examStartedAt) / 1000);
            setRemainingTime(Math.max(0, durationInSeconds - elapsedSeconds));
            return;
        }

        // Priority 4: Use full duration (fresh start)
        setRemainingTime(durationInSeconds);
    }, [activeExamData]);


    // Timer countdown logic - recalculates from start time every second
    useEffect(() => {
        if (timerStarted) {
            const timer = setInterval(() => {
                const newTime = calculateRemainingTime();
                setRemainingTime(newTime);

                if (newTime <= 0) {
                    clearInterval(timer);
                    handleSubmit();
                }
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [timerStarted, calculateRemainingTime]);

    // Initialize answers and answeredQuestions from localStorage directly
    const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(() => {
        try {
            const progressStr = localStorage.getItem('examProgress');
            if (progressStr) {
                const progress = JSON.parse(progressStr);
                if (progress.answeredQuestions) {
                    if (Array.isArray(progress.answeredQuestions)) {
                        return new Set(progress.answeredQuestions.map((id: number | string) => id.toString()));
                    }
                }
            }
            // Fallback to individual key
            const answeredStr = localStorage.getItem('answeredQuestions');
            if (answeredStr) {
                const parsed = JSON.parse(answeredStr);
                if (Array.isArray(parsed)) {
                    return new Set(parsed.map((id: number | string) => id.toString()));
                }
            }
        } catch (e) {
            console.error('[DoTestPage] Error loading answeredQuestions from localStorage:', e);
        }
        return new Set();
    });

    const [answers, setAnswers] = useState<Record<string, { selectedAnswerId?: string; frqAnswerText?: string }>>(() => {
        try {
            const progressStr = localStorage.getItem('examProgress');
            if (progressStr) {
                const progress = JSON.parse(progressStr);
                if (progress.answers && Object.keys(progress.answers).length > 0) {
                    return progress.answers;
                }
            }
            // Fallback to individual key
            const answersStr = localStorage.getItem('examAnswers');
            if (answersStr) {
                const parsed = JSON.parse(answersStr);
                if (parsed && Object.keys(parsed).length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error('[DoTestPage] Error loading answers from localStorage:', e);
        }
        return {};
    });

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

    // Debounce ref to prevent duplicate server save calls
    const saveDebounceRef = useRef<NodeJS.Timeout | null>(null);

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

        // 🥈 Load localStorage progress first to check timestamp
        const savedProgress = loadExamProgress();

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

        // 🎯 Check if localStorage has NEWER data than API (user changed answer on web after mobile sync)
        // If localStorage exists and has answers, compare to decide which source to use
        const hasLocalStorageAnswers = savedProgress && savedProgress.answers && Object.keys(savedProgress.answers).length > 0;
        const hasApiAnswers = Object.keys(apiAnswers).length > 0;

        // If both sources have data, prefer localStorage if it was saved more recently (serverLastSync exists)
        // This handles the case: mobile saves → web loads → web changes answer → reload
        if (hasLocalStorageAnswers && hasApiAnswers) {
            // Check if localStorage was synced to server (means user made changes on this device)
            const localStorageHasServerSync = savedProgress.serverLastSync && savedProgress.serverLastSync > 0;

            if (localStorageHasServerSync) {
                // User made changes on web after loading from mobile, use localStorage
                console.log('[DoTestPage] Using localStorage answers (user made changes on web after mobile sync)');
                // Fall through to localStorage loading logic below
            } else {
                // No server sync recorded, this is fresh load from mobile - use API answers
                // console.log('[DoTestPage] Using API answers (fresh cross-device sync from mobile)');
                setAnswers(apiAnswers);
                setAnsweredQuestions(answeredSet);

                // ⏱️ Timer logic: localStorage saved time → API duration → default
                if (savedProgress && savedProgress.remainingTime != null && savedProgress.remainingTime > 0) {
                    setRemainingTime(savedProgress.remainingTime);
                } else if (activeExamData.durationInMinute) {
                    setRemainingTime(activeExamData.durationInMinute * 60);
                }
                return; // 🚫 Don't load from localStorage
            }
        } else if (hasApiAnswers && !hasLocalStorageAnswers) {
            // Only API has answers (first time loading from mobile)
            // console.log('[DoTestPage] Using API answers (no localStorage data)');
            setAnswers(apiAnswers);
            setAnsweredQuestions(answeredSet);

            // ⏱️ Timer logic
            if (activeExamData.durationInMinute) {
                setRemainingTime(activeExamData.durationInMinute * 60);
            }
            return;
        }

        // 🥈 Priority 2: localStorage backup (ongoing exams or user made changes after mobile sync)

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeExamData, sortedQuestions]); // Removed loadExamProgress from dependencies - it's stable from hook


    const autoSaveCallback = useCallback(() => {
        // Get current values from refs at save time - skip server sync for auto-save
        saveExamProgress(
            answersRef.current,
            answeredQuestionsRef.current,
            remainingTimeRef.current,
            activeExamData?.examAttemptId,
            examId,
            true // skipServerSync - only save to localStorage
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

    // Check if exam was already started (user already accepted rules before reload)
    useEffect(() => {
        if (activeExamData) {
            const currentAttemptId = activeExamData.examAttemptId;
            const examStartedKey = `exam_started_${currentAttemptId}`;
            const wasExamStarted = localStorage.getItem(examStartedKey) === 'true';

            if (wasExamStarted) {
                // User already accepted rules, show resume modal for fullscreen (browser requires user gesture)
                setProctoringAccepted(true);
                setTimerStarted(true); // Timer can start immediately
                setShowResumeModal(true); // Show modal for user to click to enter fullscreen
            }
        }
    }, [activeExamData]);

    // Show proctoring rules modal when exam loads (only if not already started)
    useEffect(() => {
        if (activeExamData && !proctoringAccepted && !showProctoringRules) {
            const examAttemptId = activeExamData.examAttemptId;
            const examStartedKey = `exam_started_${examAttemptId}`;
            const wasExamStarted = localStorage.getItem(examStartedKey) === 'true';

            if (!wasExamStarted) {
                // Delay to show modal after exam content is loaded
                const timer = setTimeout(() => {
                    setShowProctoringRules(true);
                });
                return () => clearTimeout(timer);
            }
        }
    }, [activeExamData, proctoringAccepted, showProctoringRules]);


    const handleSubmit = async () => {
        if (!activeExamData) return;

        setIsSubmitting(true);

        // Stop proctoring before submission
        if (isProctoringActive) {
            stopProctoring();
        }

        // Prepare answers using stored answer data
        const submissionAnswers: ExamSubmissionAnswer[] = sortedQuestions.map((q: ActiveExamQuestion) => {
            const answerData = answers[q.examQuestionId];
            return {
                examQuestionId: q.examQuestionId,
                selectedAnswerId: answerData?.selectedAnswerId || null,
                frqAnswerText: answerData?.frqAnswerText || null
            };
        });

        // Get proctoring metadata
        // const proctoringMetadata = getProctoringMetadata();
        // console.log('Proctoring Metadata:', proctoringMetadata);

        try {
            const result = await submitAttempt(activeExamData.examAttemptId, {
                answers: submissionAnswers,
                attemptSessionToken: activeExamData.attemptSessionToken
            });
            if (result) {
                // Close the confirmation modal
                setShowConFirmed(false);
                // Clear all exam progress and exam_started status after successful submission
                clearExamProgress();
                // Clear exam_started flag, start timestamp, and remainTime data
                const examAttemptId = activeExamData.examAttemptId;
                if (examAttemptId) {
                    localStorage.removeItem(`exam_started_${examAttemptId}`);
                    localStorage.removeItem(`exam_started_at_${examAttemptId}`);
                    localStorage.removeItem(`exam_remaintime_received_at_${examAttemptId}`);
                    localStorage.removeItem(`exam_remaintime_value_${examAttemptId}`);
                    // Clear proctoring violations data
                    localStorage.removeItem(`proctoring_violation_counts_${examAttemptId}`);
                    localStorage.removeItem(`proctoring_violations_${examAttemptId}`);
                }
                // Clear exam specific attempt data
                if (examId) {
                    localStorage.removeItem(`exam_attempt_${examId}`);
                }

                navigate(`/exam-test?showWaitModal=true&attemptId=${examAttemptId}`);
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

        // Clear exam_started flag, start timestamp, and remainTime data
        const examAttemptId = activeExamData?.examAttemptId;
        if (examAttemptId) {
            localStorage.removeItem(`exam_started_${examAttemptId}`);
            localStorage.removeItem(`exam_started_at_${examAttemptId}`);
            localStorage.removeItem(`exam_remaintime_received_at_${examAttemptId}`);
            localStorage.removeItem(`exam_remaintime_value_${examAttemptId}`);
            // Clear proctoring violations data
            localStorage.removeItem(`proctoring_violation_counts_${examAttemptId}`);
            localStorage.removeItem(`proctoring_violations_${examAttemptId}`);
        }

        // Stop proctoring
        if (isProctoringActive) {
            stopProctoring();
        }

        // Check if this is a combo test (has attemptId param)
        if (attemptId) {
            window.location.href = `/exam-test`;
        } else {
            window.location.href = `/exam-details/${examId}`;
        }
    };

    const handleConfirmSubmit = () => {
        setShowConFirmed(true);
        setIsSubmit(true);
        setIsCancel(false);
    };

    const handleConfirmCancel = () => {
        setShowConFirmed(true);
        setIsCancel(true);
        setIsSubmit(false);
    };

    const totalQuestions = sortedQuestions.length;

    const handleAnswerChange = useCallback((examQuestionId: string, hasAnswer: boolean, answerData?: { selectedAnswerId?: string; frqAnswerText?: string }) => {
        setAnswers(prev => {
            const currentAnswer = prev[examQuestionId];

            // Check if answer actually changed
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

            // Update answers - if clearing, remove the answer completely
            let newAnswers: typeof prev;
            if (!hasAnswer && !answerData?.selectedAnswerId && !answerData?.frqAnswerText) {
                // Clear answer - remove from object
                const { [examQuestionId]: _, ...rest } = prev;
                newAnswers = rest;
            } else {
                // Update answer
                newAnswers = {
                    ...prev,
                    [examQuestionId]: {
                        ...prev[examQuestionId],
                        ...answerData
                    }
                };
            }

            // Update answeredQuestions
            setAnsweredQuestions(prevAnswered => {
                const newSet = new Set(prevAnswered);
                if (hasAnswer) {
                    newSet.add(examQuestionId);
                } else {
                    newSet.delete(examQuestionId);
                }
                return newSet;
            });

            // Always save when answer content changes (not just when set changes)
            // Use debounce to prevent duplicate API calls
            if (saveDebounceRef.current) {
                clearTimeout(saveDebounceRef.current);
            }
            saveDebounceRef.current = setTimeout(() => {
                saveExamProgress(
                    newAnswers,
                    new Set(Object.keys(newAnswers).filter(id => {
                        const ans = newAnswers[id];
                        return ans && (ans.selectedAnswerId || (ans.frqAnswerText && ans.frqAnswerText.trim() !== ''));
                    })),
                    remainingTimeRef.current,
                    activeExamData?.examAttemptId,
                    examId,
                    false, // skipServerSync
                    activeExamData?.attemptSessionToken
                );
            }, 500); // Debounce 500ms to prevent duplicate calls

            return newAnswers;
        });
    }, [saveExamProgress, activeExamData?.examAttemptId, activeExamData?.attemptSessionToken, examId]);

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
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2"><MdOutlineMenuBook className="text-teal-600" />{activeExamData?.title || 'Exam'}</h2>
                    <div className="h-1 w-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></div>
                </div>

                {/* Proctoring Status */}
                <ProctoringStatus
                    isActive={isProctoringActive}
                    isFullscreen={isFullscreen}
                    violationCounts={violationCounts}
                    totalViolations={totalViolations}
                    maxViolations={4}
                />

                <div className="bg-teal-50/60 rounded-xl p-4 mb-6 border border-teal-200/50">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700 flex items-center gap-1"><MdTimer /> Time left:</span>
                        <Timer
                            initialMinutes={activeExamData?.durationInMinute}
                            onTimeUp={handleSubmit}
                            remainingTime={remainingTime}
                            onTimeChange={setRemainingTime}
                        />
                    </div>

                    {/* Auto-save indicator */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-teal-200/30">
                        <span className="text-sm text-gray-600 flex items-center gap-1"><MdSave /> Auto save:</span>
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

                        {/* Server sync UI hidden - sync happens automatically when selecting answers */}
                        {/* Auto-save now only saves to localStorage for reliability */}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white/60 rounded-xl p-4 mb-6 border border-teal-200/50">
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-gray-700 flex items-center gap-1"><MdBarChart /> Progress</span>
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
                            <MdList className="mr-2" />
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
                        className="w-full bg-backgroundColor hover:bg-backgroundColor/80 text-white font-bold py-4 rounded-xl transition-all duration-200 border border-teal-500/60 hover:border-teal-400 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Submit
                    </button>
                    <button
                        onClick={handleConfirmCancel}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-all duration-200 border border-red-400/60 hover:border-red-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
                            <div className="text-6xl mb-6"><MdHourglassEmpty className="mx-auto text-teal-500" /></div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                Loading...
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                Please wait while we load the exam.
                            </p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-6"><MdError className="mx-auto text-red-500" /></div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                Error loading exam
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                {error}
                            </p>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Try again
                                </button>
                                <button
                                    onClick={() => {
                                        // Clear all exam-related localStorage
                                        localStorage.removeItem('activeExamAttempt');
                                        localStorage.removeItem('examProgress');
                                        localStorage.removeItem('answeredQuestions');
                                        localStorage.removeItem('examAnswers');

                                        // Clear exam-specific items
                                        if (examId) {
                                            localStorage.removeItem(`exam_attempt_${examId}`);
                                            localStorage.removeItem(`exam_started_${activeExamData?.examAttemptId}`);
                                            localStorage.removeItem(`exam_started_at_${activeExamData?.examAttemptId}`);
                                            localStorage.removeItem(`exam_metadata_${examId}`);
                                        }

                                        // Clear any attempt-specific keys
                                        if (activeExamData?.examAttemptId) {
                                            localStorage.removeItem(`exam_started_${activeExamData.examAttemptId}`);
                                            localStorage.removeItem(`exam_started_at_${activeExamData.examAttemptId}`);
                                            localStorage.removeItem(`exam_remaintime_received_at_${activeExamData.examAttemptId}`);
                                            localStorage.removeItem(`exam_remaintime_value_${activeExamData.examAttemptId}`);
                                        }

                                        // Clear exam progress using the hook
                                        clearExamProgress();

                                        // Navigate back to exam test page
                                        navigate('/exam-test');
                                    }}
                                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Back
                                </button>
                            </div>
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

                                // Helper function to get questionContext from either camelCase or snake_case
                                const getQuestionContext = (question: ActiveExamQuestion['question']) => {
                                    const ctx = question.questionContext ||
                                        (question as unknown as { question_context?: typeof question.questionContext }).question_context;
                                    return ctx;
                                };

                                // Group questions by contextId for shared context display
                                const contextGroups = new Map<string, ActiveExamQuestion[]>();
                                const noContextQuestions: ActiveExamQuestion[] = [];

                                mcqQuestions.forEach((q: ActiveExamQuestion) => {
                                    const context = getQuestionContext(q.question);
                                    const contextId = context?.id;
                                    if (contextId) {
                                        if (!contextGroups.has(contextId)) {
                                            contextGroups.set(contextId, []);
                                        }
                                        contextGroups.get(contextId)!.push(q);
                                    } else {
                                        noContextQuestions.push(q);
                                    }
                                });

                                // Build render order: group questions with shared context together
                                const renderGroups: { contextId: string | null; questions: ActiveExamQuestion[] }[] = [];
                                const processedContexts = new Set<string>();

                                // Process questions in original order, but group shared contexts
                                mcqQuestions.forEach((q: ActiveExamQuestion) => {
                                    const context = getQuestionContext(q.question);
                                    const contextId = context?.id;

                                    if (contextId) {
                                        if (!processedContexts.has(contextId)) {
                                            processedContexts.add(contextId);
                                            renderGroups.push({
                                                contextId,
                                                questions: contextGroups.get(contextId)!
                                            });
                                        }
                                    } else {
                                        // Individual question without context
                                        renderGroups.push({
                                            contextId: null,
                                            questions: [q]
                                        });
                                    }
                                });

                                return (
                                    <Tabs.TabPane
                                        tab={`MCQ (${mcqQuestions.length})`}
                                        key="mcq"
                                        className="space-y-8"
                                    >
                                        {renderGroups.map((group, groupIndex) => {
                                            const firstQuestion = group.questions[0];
                                            const sharedContext = group.contextId ? getQuestionContext(firstQuestion.question) : null;
                                            const isSharedContext = group.questions.length > 1 && sharedContext;

                                            // Wrapper for shared context groups
                                            if (isSharedContext && sharedContext) {
                                                return (
                                                    <div
                                                        key={group.contextId || `no-context-${groupIndex}`}
                                                        className="border-2 border-blue-300 rounded-xl bg-blue-50/30 p-4 space-y-4"
                                                    >
                                                        {/* Reading Passage Header */}
                                                        <div className="bg-white rounded-lg shadow-sm border border-blue-200 overflow-hidden">
                                                            <div className="bg-blue-500 text-white px-4 py-2 flex items-center gap-2">
                                                                <MdOutlineMenuBook size={20} />
                                                                <span className="font-semibold">Reading Passage - {group.questions.length} Questions</span>
                                                            </div>
                                                            <div className="p-4">
                                                                <ContextDisplay context={sharedContext} defaultExpanded={true} />
                                                            </div>
                                                        </div>

                                                        {/* Questions in this reading group */}
                                                        <div className="space-y-4 ">
                                                            {group.questions.map((q: ActiveExamQuestion) => {
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
                                                                                    .map((a: ExamAnswer) => ({ id: a.id, text: a.content || '' })),
                                                                                imageUrl: q.question.imageUrl,
                                                                                audioUrl: q.question.audioUrl,
                                                                            }}
                                                                            questionNumber={q.orderNumber}
                                                                            onAnswerChange={(answerId) => handleAnswerChange(q.examQuestionId, !!answerId, { selectedAnswerId: answerId })}
                                                                            selectedAnswerId={currentAnswer?.selectedAnswerId}
                                                                            onClearAnswer={() => handleAnswerChange(q.examQuestionId, false, { selectedAnswerId: undefined })}
                                                                        />
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            // Individual questions (no shared context)
                                            return (
                                                <div key={group.contextId || `no-context-${groupIndex}`} className="space-y-4">
                                                    {group.questions.map((q: ActiveExamQuestion) => {
                                                        const index = sortedQuestions.findIndex((q2: ActiveExamQuestion) => q2.examQuestionId === q.examQuestionId);
                                                        const currentAnswer = answers[q.examQuestionId];
                                                        const questionContext = getQuestionContext(q.question);

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
                                                                            .map((a: ExamAnswer) => ({ id: a.id, text: a.content || '' })),
                                                                        imageUrl: q.question.imageUrl,
                                                                        audioUrl: q.question.audioUrl,
                                                                    }}
                                                                    questionNumber={q.orderNumber}
                                                                    onAnswerChange={(answerId) => handleAnswerChange(q.examQuestionId, !!answerId, { selectedAnswerId: answerId })}
                                                                    selectedAnswerId={currentAnswer?.selectedAnswerId}
                                                                    onClearAnswer={() => handleAnswerChange(q.examQuestionId, false, { selectedAnswerId: undefined })}
                                                                    questionContext={questionContext}
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </Tabs.TabPane>
                                );
                            })()}

                            {/* FRQ Tab */}
                            {(() => {
                                const frqQuestions = sortedQuestions.filter((q: ActiveExamQuestion) => q.question.type === 'frq');

                                // Helper function to get questionContext from either camelCase or snake_case
                                const getQuestionContext = (question: ActiveExamQuestion['question']) => {
                                    const ctx = question.questionContext ||
                                        (question as unknown as { question_context?: typeof question.questionContext }).question_context;
                                    return ctx;
                                };

                                // Group questions by contextId for shared context display
                                const contextGroups = new Map<string, ActiveExamQuestion[]>();

                                frqQuestions.forEach((q: ActiveExamQuestion) => {
                                    const context = getQuestionContext(q.question);
                                    const contextId = context?.id;
                                    if (contextId) {
                                        if (!contextGroups.has(contextId)) {
                                            contextGroups.set(contextId, []);
                                        }
                                        contextGroups.get(contextId)!.push(q);
                                    }
                                });

                                // Track which contexts have been rendered
                                const renderedContexts = new Set<string>();

                                return (
                                    <Tabs.TabPane
                                        tab={`FRQ (${frqQuestions.length})`}
                                        key="frq"
                                        className="space-y-8"
                                    >
                                        {frqQuestions.map((q: ActiveExamQuestion) => {
                                            const index = sortedQuestions.indexOf(q);
                                            const currentAnswer = answers[q.examQuestionId];
                                            const questionContext = getQuestionContext(q.question);
                                            const contextId = questionContext?.id;
                                            const isSharedContext = contextId && contextGroups.get(contextId)!.length > 1;
                                            const isFirstInContext = contextId && !renderedContexts.has(contextId);

                                            // Mark context as rendered
                                            if (contextId) {
                                                renderedContexts.add(contextId);
                                            }

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
                                                            expectedAnswer: "Sample answer",
                                                            imageUrl: q.question.imageUrl,
                                                            audioUrl: q.question.audioUrl,
                                                        }}
                                                        questionNumber={q.orderNumber}
                                                        savedAnswer={currentAnswer?.frqAnswerText}
                                                        onAnswerChange={(_questionIndex, hasAnswer, answerData) =>
                                                            handleAnswerChange(q.examQuestionId, hasAnswer, answerData)
                                                        }
                                                        questionContext={isSharedContext ? (isFirstInContext ? questionContext : undefined) : questionContext}
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
            </main >

            {/* Proctoring Rules Modal */}
            < ProctoringRulesModal
                visible={showProctoringRules}
                onAccept={() => {
                    setShowProctoringRules(false);
                    setProctoringAccepted(true);
                    startProctoring();

                    // Save exam start timestamp and started status to localStorage
                    const examAttemptId = activeExamData?.examAttemptId;
                    if (examAttemptId) {
                        // Only set start time if not already set (for resume scenarios)
                        if (!localStorage.getItem(`exam_started_at_${examAttemptId}`)) {
                            localStorage.setItem(`exam_started_at_${examAttemptId}`, Date.now().toString());
                        }
                        localStorage.setItem(`exam_started_${examAttemptId}`, 'true');

                        // Recalculate remaining time and start timer
                        setRemainingTime(calculateRemainingTime());
                    }
                    setTimerStarted(true); // Start timer after accepting rules
                }}
                onReject={() => {
                    setShowProctoringRules(false);
                    handleCancel();
                }}
            />

            {/* Resume Exam Modal - shown after reload to enter fullscreen */}
            {
                showResumeModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-teal-100 flex items-center justify-center">
                                    <MdOutlineMenuBook className="text-4xl text-teal-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                                    Resume Exam
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Your exam progress has been saved. Click the button below to resume in fullscreen mode.
                                </p>
                                <button
                                    onClick={() => {
                                        setShowResumeModal(false);
                                        startProctoring(); // This will enter fullscreen via user gesture
                                    }}
                                    className="w-full bg-backgroundColor hover:bg-backgroundColor/80 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Continue Exam
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showConFirmed && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-teal-200/50 max-w-md mx-4">
                            <div className="text-center">
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isSubmit ? 'bg-teal-100' : 'bg-red-100'
                                    }`}>
                                    <span className="text-2xl">
                                        {isSubmit ? <MdCheckCircle className="text-teal-600" /> : <MdCancel className="text-red-600" />}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3">
                                    {isSubmit ? 'Confirm Submit' : 'Confirm Cancel'}
                                </h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {isSubmit
                                        ? 'Are you sure you want to submit the exam? This action cannot be undone.'
                                        : 'Are you sure you want to cancel the exam? Your current answers will be submitted.'
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
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all duration-200 border border-red-400/60 hover:border-red-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Confirm Cancel'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className="px-6 py-3 bg-backgroundColor hover:bg-backgroundColor/80 text-white font-medium rounded-lg transition-all duration-200 border border-teal-500/60 hover:border-teal-400 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Confirm Submit'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default DoTestPage;
