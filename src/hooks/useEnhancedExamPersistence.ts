import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '~/components/common/Toast';
import { useExamAttempt } from './useExamAttempt';

export interface ExamProgress {
  answers: Record<string, { selectedAnswerId?: string; frqAnswerText?: string }>;
  answeredQuestions: Set<string>; // Changed to Set<string> for examQuestionIds
  remainingTime: number;
  lastSaved: number;
  attemptId?: string;
  examId?: string;
  serverLastSync?: number; // Track server sync timestamp
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: number | null;
  syncError: string | null;
  hasUnsyncedChanges: boolean;
}

const STORAGE_KEYS = {
  ANSWERS: 'examAnswers',
  ANSWERED_QUESTIONS: 'answeredQuestions',
  REMAINING_TIME: 'examRemainingTime',
  ACTIVE_ATTEMPT: 'activeExamAttempt',
  PROGRESS: 'examProgress'
} as const;

/**
 * Enhanced Hook quản lý việc lưu trữ và khôi phục tiến độ bài thi
 * Tích hợp dual-save mechanism: localStorage (backup) + API (sync server)
 */
export const useEnhancedExamPersistence = () => {
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncTime: null,
    syncError: null,
    hasUnsyncedChanges: false
  });

  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { saveProgress: apiSaveProgress } = useExamAttempt();

  /**
   * Lưu tiến độ bài thi vào localStorage (backup)
   */
  const saveToLocalStorage = useCallback((
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
        examId,
        serverLastSync: syncStatus.lastSyncTime || undefined
      };

      // Lưu từng phần riêng biệt để tương thích với code hiện tại
      localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(answers));
      localStorage.setItem(STORAGE_KEYS.ANSWERED_QUESTIONS, JSON.stringify(Array.from(answeredQuestions)));
      localStorage.setItem(STORAGE_KEYS.REMAINING_TIME, remainingTime.toString());
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));

      setLastSavedTime(Date.now());
      return true;
    } catch (error) {
      console.error('Failed to save exam progress to localStorage:', error);
      return false;
    }
  }, [syncStatus.lastSyncTime]);

  /**
   * Lưu tiến độ lên server thông qua API
   */
  const saveToServer = useCallback(async (
    attemptId: string,
    answers: Record<string, { selectedAnswerId?: string; frqAnswerText?: string }>,
    _answeredQuestions: Set<string>, // Keep param for API compatibility but use answers keys instead
    attemptSessionToken?: string
  ): Promise<boolean> => {
    if (!attemptId) {
      console.warn('No attemptId provided for server save');
      return false;
    }

    // Filter to only include answers that have actual content
    const answersWithContent = Object.entries(answers).filter(([, answer]) =>
      answer && (answer.selectedAnswerId || (answer.frqAnswerText && answer.frqAnswerText.trim() !== ''))
    );

    if (answersWithContent.length === 0) {
      return true; // Nothing to save is considered success
    }

    if (!attemptSessionToken) {
      return false;
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      // Convert answers to API format - use answers keys directly for reliability
      const payload = {
        answers: answersWithContent.map(([examQuestionId, answer]) => ({
          examQuestionId,
          selectedAnswerId: answer.selectedAnswerId || null,
          frqAnswerText: answer.frqAnswerText || null
        })),
        attemptSessionToken
      };

      const success = await apiSaveProgress(attemptId, payload);

      if (success) {
        setSyncStatus(prev => ({
          ...prev,
          isSyncing: false,
          lastSyncTime: Date.now(),
          hasUnsyncedChanges: false
        }));
        return true;
      } else {
        setSyncStatus(prev => ({
          ...prev,
          isSyncing: false,
          syncError: 'Server save failed',
          hasUnsyncedChanges: true
        }));
        return false;
      }
    } catch (error) {
      console.error('Failed to save to server:', error);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncError: error instanceof Error ? error.message : 'Network error',
        hasUnsyncedChanges: true
      }));
      return false;
    }
  }, [apiSaveProgress]);

  /**
   * Dual-save mechanism: localStorage (backup) + API (sync server)
   * @param skipServerSync - If true, only save to localStorage (for auto-save to reduce API calls)
   */
  const saveExamProgress = useCallback(async (
    answers: Record<string, { selectedAnswerId?: string; frqAnswerText?: string }>,
    answeredQuestions: Set<string>,
    remainingTime: number,
    attemptId?: string,
    examId?: string,
    skipServerSync: boolean = false,
    attemptSessionToken?: string
  ) => {
    setIsAutoSaving(true);

    try {
      // Save to localStorage first (backup) - always succeeds if possible
      let localSaved = saveToLocalStorage(answers, answeredQuestions, remainingTime, attemptId, examId);

      // Save to server if we have attemptId and not skipping server sync
      let serverSaved = true;
      if (attemptId && !skipServerSync && attemptSessionToken) {
        serverSaved = await saveToServer(attemptId, answers, answeredQuestions, attemptSessionToken);

        // If server saved successfully, update localStorage with serverLastSync timestamp
        // This is crucial for detecting "user changed answer on web after mobile sync"
        if (serverSaved) {
          // Re-save to localStorage with the new serverLastSync timestamp
          const progressStr = localStorage.getItem(STORAGE_KEYS.PROGRESS);
          if (progressStr) {
            try {
              const progress = JSON.parse(progressStr);
              progress.serverLastSync = Date.now();
              localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
            } catch (e) {
              console.error('Failed to update serverLastSync in localStorage:', e);
            }
          }
        }

        // If server failed but local saved, mark as having unsynced changes
        if (!serverSaved && localSaved) {
          setSyncStatus(prev => ({ ...prev, hasUnsyncedChanges: true }));
        }
      }

      // Return overall success
      return localSaved && (serverSaved || !attemptId || skipServerSync || !attemptSessionToken);
    } finally {
      setIsAutoSaving(false);
    }
  }, [saveToLocalStorage, saveToServer]);

  /**
   * Khôi phục tiến độ bài thi - ưu tiên server data, fallback localStorage
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
   * Manual sync - force sync local data to server
   */
  const syncToServer = useCallback(async (
    attemptId: string,
    answers: Record<string, { selectedAnswerId?: string; frqAnswerText?: string }>,
    answeredQuestions: Set<string>,
    attemptSessionToken?: string
  ) => {
    const success = await saveToServer(attemptId, answers, answeredQuestions, attemptSessionToken);
    if (success) {
      toast.success('Sync exam progress to server successfully!');
    } else {
      toast.error('Failed to sync exam progress. Please try again.');
    }
    return success;
  }, [saveToServer, toast]);

  /**
   * Xóa toàn bộ tiến độ bài thi
   */
  const clearExamProgress = useCallback(() => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      setLastSavedTime(null);
      setSyncStatus({
        isSyncing: false,
        lastSyncTime: null,
        syncError: null,
        hasUnsyncedChanges: false
      });
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
   * Thiết lập auto-save định kỳ với dual-save mechanism
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
    // Basic persistence
    saveExamProgress,
    loadExamProgress,
    clearExamProgress,
    hasSavedProgress,
    startAutoSave,
    stopAutoSave,
    lastSavedTime,
    isAutoSaving,

    // Enhanced sync features
    syncStatus,
    syncToServer,

    // Direct localStorage access (for compatibility)
    saveToLocalStorage,
    saveToServer
  };
};
