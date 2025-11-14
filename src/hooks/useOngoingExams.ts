import { useState, useEffect, useCallback } from 'react';
import { toast } from '~/components/common/Toast';

export interface OngoingExam {
  examId: string;
  attemptId: string;
  title: string;
  remainingTime: number;
  progress: number;
  lastAccessed: number;
}

export const useOngoingExams = () => {
  const [ongoingExams, setOngoingExams] = useState<OngoingExam[]>([]);
  const [hasShownToast, setHasShownToast] = useState(false);

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
              exams.push({
                examId: attemptData.examId,
                attemptId: attemptData.examAttemptId,
                title: attemptData.title || 'Untitled Exam',
                remainingTime: progress.remainingTime,
                progress: progress.answeredQuestions ? progress.answeredQuestions.size : 0,
                lastAccessed: progress.lastSaved || Date.now()
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
              exams.push({
                examId: activeAttempt.examId || 'combo',
                attemptId: activeAttempt.examAttemptId,
                title: activeAttempt.title || 'Combo Exam',
                remainingTime: progress.remainingTime,
                progress: progress.answeredQuestions ? progress.answeredQuestions.size : 0,
                lastAccessed: progress.lastSaved || Date.now()
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

  // Resume an ongoing exam
  const resumeExam = useCallback((exam: OngoingExam) => {
    if (exam.examId === 'combo') {
      // For combo exams
      window.location.href = `/do-test/combo/${exam.attemptId}`;
    } else {
      // For individual exams
      window.location.href = `/do-test/${exam.examId}/full`;
    }
  }, []);

  // Clear an ongoing exam (when completed or cancelled)
  const clearExam = useCallback((examId: string, attemptId: string) => {
    // Remove from localStorage
    localStorage.removeItem(`exam_attempt_${examId}`);
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
    checkOngoingExams,
    showOngoingExamToast,
    resumeExam,
    clearExam
  };
};
