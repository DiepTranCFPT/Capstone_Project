import { useState, useEffect, useCallback } from 'react';
import { toast } from '~/components/common/Toast';
import { useExamAttempt } from '~/hooks/useExamAttempt';
import type { ActiveExam } from '~/types/test';

export interface OngoingExam {
  examId: string;
  attemptId: string;
  title: string;
  remainingTime: number;
  progress: number;
  lastAccessed: number;
  examType: 'single' | 'combo' | 'random-combo';
  metadata?: {
    templateIds?: string[];
    subjectIds?: string[];
  };
}

export const useOngoingExams = () => {
  const [ongoingExams, setOngoingExams] = useState<OngoingExam[]>([]);
  const [hasShownToast, setHasShownToast] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const { startSingleAttempt, startComboAttempt, startComboRandomAttempt } = useExamAttempt();

  // Check for ongoing exams in localStorage
  const checkOngoingExams = useCallback(() => {
    const exams: OngoingExam[] = [];

    // Check all localStorage keys for exam attempts
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('exam_attempt_')) {
        try {
          const attemptData = JSON.parse(localStorage.getItem(key) || '{}');
          const examProgressStr = localStorage.getItem('examProgress');

          if (examProgressStr) {
            const progress = JSON.parse(examProgressStr);

            // Only include if there's remaining time and it matches this exam
            if (progress.remainingTime > 0 && progress.examId === attemptData.examId) {
              // Get metadata from localStorage
              const metadataStr = localStorage.getItem(`exam_metadata_${attemptData.examId}`);
              const metadata = metadataStr ? JSON.parse(metadataStr) : {};
              
              exams.push({
                examId: attemptData.examId,
                attemptId: attemptData.examAttemptId,
                title: attemptData.title || 'Untitled Exam',
                remainingTime: progress.remainingTime,
                progress: progress.answeredQuestions ? progress.answeredQuestions.size : 0,
                lastAccessed: progress.lastSaved || Date.now(),
                examType: metadata.examType || 'single',
                metadata: metadata
              });
            }
          }
        } catch (error) {
          console.error('Error parsing exam attempt data:', error);
        }
      }
    }

    // Also check for combo exams stored in activeExamAttempt
    try {
      const activeAttemptStr = localStorage.getItem('activeExamAttempt');
      if (activeAttemptStr) {
        const activeAttempt = JSON.parse(activeAttemptStr);
        const examProgressStr = localStorage.getItem('examProgress');

        if (examProgressStr) {
          const progress = JSON.parse(examProgressStr);

          if (progress.remainingTime > 0) {
            // Check if this is already in the list
            const exists = exams.some(exam => exam.attemptId === activeAttempt.examAttemptId);
            if (!exists) {
              // Get metadata from localStorage
              const metadataStr = localStorage.getItem(`exam_metadata_${activeAttempt.examId || 'combo'}`);
              const metadata = metadataStr ? JSON.parse(metadataStr) : {};
              
              exams.push({
                examId: activeAttempt.examId || 'combo',
                attemptId: activeAttempt.examAttemptId,
                title: activeAttempt.title || 'Combo Exam',
                remainingTime: progress.remainingTime,
                progress: progress.answeredQuestions ? progress.answeredQuestions.size : 0,
                lastAccessed: progress.lastSaved || Date.now(),
                examType: metadata.examType || 'combo',
                metadata: metadata
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error parsing active exam attempt:', error);
    }

    setOngoingExams(exams);
    return exams;
  }, []);

  // Smart resume with API sync
  const resumeExamWithSync = useCallback(async (exam: OngoingExam) => {
    if (isResuming) return;
    
    setIsResuming(true);
    toast.loading('Đang đồng bộ dữ liệu...', { autoClose: 2000 });

    try {
      let result: ActiveExam | null = null;

      // Call appropriate API based on exam type
      switch (exam.examType) {
        case 'single':
          if (exam.metadata?.templateIds?.[0]) {
            result = await startSingleAttempt({ templateId: exam.metadata.templateIds[0] });
          }
          break;
        
        case 'combo':
          if (exam.metadata?.templateIds?.length) {
            result = await startComboAttempt({ templateIds: exam.metadata.templateIds });
          }
          break;
        
        case 'random-combo':
          if (exam.metadata?.subjectIds?.length) {
            result = await startComboRandomAttempt({ subjectIds: exam.metadata.subjectIds });
          }
          break;
      }

      if (result) {
        // Store the fresh data with saved answers
        localStorage.setItem('activeExamAttempt', JSON.stringify(result));
        
        // Store metadata for future resume
        localStorage.setItem(`exam_metadata_${exam.examId}`, JSON.stringify({
          examType: exam.examType,
          templateIds: exam.metadata?.templateIds,
          subjectIds: exam.metadata?.subjectIds
        }));
        
        toast.success('Đồng bộ thành công! Chuyển đến bài thi...', { autoClose: 1500 });
        
        // Redirect based on exam type
        setTimeout(() => {
          if (exam.examType === 'single') {
            window.location.href = `/do-test/${exam.examId}/full`;
          } else {
            window.location.href = `/do-test/combo/${exam.attemptId}`;
          }
        }, 1500);
      } else {
        // Fallback to old behavior if API fails
        console.warn('API resume failed, falling back to localStorage');
        toast.warning('Không thể đồng bộ, sử dụng dữ liệu local...', { autoClose: 2000 });
        
        setTimeout(() => {
          if (exam.examType === 'single') {
            window.location.href = `/do-test/${exam.examId}/full`;
          } else {
            window.location.href = `/do-test/combo/${exam.attemptId}`;
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error resuming exam:', error);
      toast.error('Lỗi khi tiếp tục bài thi', { autoClose: 3000 });
      
      // Fallback to old behavior
      setTimeout(() => {
        if (exam.examType === 'single') {
          window.location.href = `/do-test/${exam.examId}/full`;
        } else {
          window.location.href = `/do-test/combo/${exam.attemptId}`;
        }
      }, 3000);
    } finally {
      setIsResuming(false);
    }
  }, [startSingleAttempt, startComboAttempt, startComboRandomAttempt, isResuming]);

  // Show toast notification for ongoing exams
  const showOngoingExamToast = useCallback(() => {
    if (hasShownToast) return;

    const exams = checkOngoingExams();
    if (exams.length > 0) {
      toast.info(
        `Bạn có ${exams.length} bài thi đang làm chưa hoàn thành. Xem ngay!`,
        {
          autoClose: 8000,
          onClick: () => {
            // Navigate to ongoing exams page
            window.location.href = '/ongoing-exams';
          }
        }
      );
      setHasShownToast(true);
    }
  }, [checkOngoingExams, hasShownToast]);

  // Clear an ongoing exam (when completed or cancelled)
  const clearExam = useCallback((examId: string, attemptId: string) => {
    // Remove from localStorage
    localStorage.removeItem(`exam_attempt_${examId}`);
    localStorage.removeItem(`exam_metadata_${examId}`);
    if (attemptId) {
      localStorage.removeItem('activeExamAttempt');
    }

    // Refresh the list
    checkOngoingExams();
  }, [checkOngoingExams]);

  // Initialize on mount
  useEffect(() => {
    checkOngoingExams();
  }, [checkOngoingExams]);

  return {
    ongoingExams,
    isResuming,
    checkOngoingExams,
    showOngoingExamToast,
    resumeExam: resumeExamWithSync, // Use the new smart resume
    clearExam
  };
};
