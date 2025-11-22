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
    answeredQuestions: Set<string>
  ): Promise<boolean> => {
    if (!attemptId) {
      console.warn('No attemptId provided for server save');
      return false;
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      // Convert answers to API format
      const payload = {
        answers: Array.from(answeredQuestions).map(examQuestionId => ({
          examQuestionId,
          selectedAnswerId: answers[examQuestionId]?.selectedAnswerId || null,
          frqAnswerText: answers[examQuestionId]?.frqAnswerText || null
        }))
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
   */
  const saveExamProgress = useCallback(async (
    answers: Record<string, { selectedAnswerId?: string; frqAnswerText?: string }>,
    answeredQuestions: Set<string>,
    remainingTime: number,
    attemptId?: string,
    examId?: string
  ) => {
    setIsAutoSaving(true);
    
    try {
      // Save to localStorage (backup) - always succeeds if possible
      const localSaved = saveToLocalStorage(answers, answeredQuestions, remainingTime, attemptId, examId);
      
      // Save to server if we have attemptId
      let serverSaved = true;
      if (attemptId) {
        serverSaved = await saveToServer(attemptId, answers, answeredQuestions);
        
        // If server failed but local saved, mark as having unsynced changes
        if (!serverSaved && localSaved) {
          setSyncStatus(prev => ({ ...prev, hasUnsyncedChanges: true }));
        }
      }

      // Return overall success
      return localSaved && (serverSaved || !attemptId);
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
    answeredQuestions: Set<string>
  ) => {
    const success = await saveToServer(attemptId, answers, answeredQuestions);
    if (success) {
      toast.success('Đã đồng bộ tiến độ lên server thành công!');
    } else {
      toast.error('Không thể đồng bộ tiến độ. Vui lòng thử lại.');
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
