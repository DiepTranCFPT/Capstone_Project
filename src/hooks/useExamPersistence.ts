import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '~/components/common/Toast';

export interface ExamProgress {
  answers: Record<string, { selectedAnswerId?: string; frqAnswerText?: string }>;
  answeredQuestions: Set<string>; // Changed to Set<string> for examQuestionIds
  remainingTime: number;
  lastSaved: number;
  attemptId?: string;
  examId?: string;
}

const STORAGE_KEYS = {
  ANSWERS: 'examAnswers',
  ANSWERED_QUESTIONS: 'answeredQuestions',
  REMAINING_TIME: 'examRemainingTime',
  ACTIVE_ATTEMPT: 'activeExamAttempt',
  PROGRESS: 'examProgress'
} as const;

/**
 * Hook quản lý việc lưu trữ và khôi phục tiến độ bài thi
 */
export const useExamPersistence = () => {
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Lưu tiến độ bài thi vào localStorage
   */
  const saveExamProgress = useCallback((
    answers: Record<string, { selectedAnswerId?: string; frqAnswerText?: string }>,
    answeredQuestions: Set<string>,
    remainingTime: number,
    attemptId?: string,
    examId?: string
  ) => {
    try {
      const progress: ExamProgress = {
        answers,
        answeredQuestions: answeredQuestions,
        remainingTime,
        lastSaved: Date.now(),
        attemptId,
        examId
      };

      // Lưu từng phần riêng biệt để tương thích với code hiện tại
      localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(answers));
      localStorage.setItem(STORAGE_KEYS.ANSWERED_QUESTIONS, JSON.stringify(Array.from(answeredQuestions)));
      localStorage.setItem(STORAGE_KEYS.REMAINING_TIME, remainingTime.toString());
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));

      setLastSavedTime(Date.now());
      return true;
    } catch (error) {
      console.error('Failed to save exam progress:', error);
      toast.error('Không thể lưu tiến độ bài thi');
      return false;
    }
  }, []);

  /**
   * Khôi phục tiến độ bài thi từ localStorage
   */
  const loadExamProgress = useCallback((): ExamProgress | null => {
    try {
      const progressStr = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (progressStr) {
        const progress: ExamProgress = JSON.parse(progressStr);
        // Validate data integrity
        if (progress.answers && typeof progress.remainingTime === 'number') {
          // Convert answeredQuestions to Set safely
          let answeredQuestionsSet: Set<string> = new Set();
          if (progress.answeredQuestions) {
            if (Array.isArray(progress.answeredQuestions)) {
              answeredQuestionsSet = new Set(progress.answeredQuestions.map((id: number | string) => id.toString()));
            } else if (progress.answeredQuestions instanceof Set) {
              answeredQuestionsSet = new Set(progress.answeredQuestions);
            } else if (typeof progress.answeredQuestions === 'object' && progress.answeredQuestions !== null) {
              // Handle case where it might be stored as object
              answeredQuestionsSet = new Set(Object.keys(progress.answeredQuestions));
            }
          }

          // Don't call setLastSavedTime here to avoid state updates during render
          return {
            ...progress,
            answeredQuestions: answeredQuestionsSet
          };
        }
      }

      // Fallback to individual keys if progress key doesn't exist
      const answersStr = localStorage.getItem(STORAGE_KEYS.ANSWERS);
      const answeredQuestionsStr = localStorage.getItem(STORAGE_KEYS.ANSWERED_QUESTIONS);
      const remainingTimeStr = localStorage.getItem(STORAGE_KEYS.REMAINING_TIME);
      const activeAttemptStr = localStorage.getItem(STORAGE_KEYS.ACTIVE_ATTEMPT);

      if (answersStr && remainingTimeStr) {
        const answers = JSON.parse(answersStr);
        const remainingTime = parseInt(remainingTimeStr, 10);
        const activeAttempt = activeAttemptStr ? JSON.parse(activeAttemptStr) : null;

        // Convert old number-based answeredQuestions to string-based if needed
        let answeredQuestionsSet: Set<string> = new Set();
        if (answeredQuestionsStr) {
          const parsed = JSON.parse(answeredQuestionsStr);
          if (Array.isArray(parsed)) {
            answeredQuestionsSet = new Set(parsed.map((id: number | string) => id.toString()));
          }
        }

        return {
          answers,
          answeredQuestions: answeredQuestionsSet,
          remainingTime,
          lastSaved: Date.now(),
          attemptId: activeAttempt?.examAttemptId,
          examId: activeAttempt?.examId
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to load exam progress:', error);
      return null;
    }
  }, []);

  /**
   * Xóa toàn bộ tiến độ bài thi
   */
  const clearExamProgress = useCallback(() => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      setLastSavedTime(null);
      return true;
    } catch (error) {
      console.error('Failed to clear exam progress:', error);
      return false;
    }
  }, []);

  /**
   * Kiểm tra xem có tiến độ được lưu không
   */
  const hasSavedProgress = useCallback((): boolean => {
    try {
      return localStorage.getItem(STORAGE_KEYS.PROGRESS) !== null ||
        localStorage.getItem(STORAGE_KEYS.ANSWERS) !== null;
    } catch {
      return false;
    }
  }, []);

  /**
   * Thiết lập auto-save định kỳ
   */
  const startAutoSave = useCallback((
    saveCallback: () => void,
    intervalMs: number = 30000 // 30 seconds
  ) => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    autoSaveIntervalRef.current = setInterval(() => {
      saveCallback();
    }, intervalMs);
  }, []);

  /**
   * Dừng auto-save
   */
  const stopAutoSave = useCallback(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
    }
    setIsAutoSaving(false);
  }, []);

  /**
   * Cleanup khi component unmount
   */
  useEffect(() => {
    return () => {
      stopAutoSave();
    };
  }, [stopAutoSave]);

  return {
    saveExamProgress,
    loadExamProgress,
    clearExamProgress,
    hasSavedProgress,
    startAutoSave,
    stopAutoSave,
    lastSavedTime,
    isAutoSaving
  };
};
