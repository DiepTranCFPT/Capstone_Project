import type { PageInfo } from "~/types/pagination";
import type {
  ExamQuestionDetail,
  ExamResult,
  ExamSubjectInfo,
} from "~/types/test";

/**
 * Payload cho API /exam-attempts/start-single
 */
export interface StartSinglePayload {
  templateId: string;
}

/**
 * Payload cho API /exam-attempts/start-combo
 */
export interface StartComboPayload {
  templateIds: string[];
}

/**
 * Payload cho API /exam-attempts/start-combo-random
 */
export interface StartComboRandomPayload {
  subjectIds: string[];
}

/**
 * Payload cho API /exam-attempts/{attemptId}/rate
 */
export interface RateAttemptPayload {
  rating: number;
  comment: string;
}

/**
 * Thông tin cơ bản của bài thi (dùng trong
 * response của /result)
 */
export interface ExamBaseInfo {
  id: string;
  title: string;
  description: string;
  subject: ExamSubjectInfo;
}

/**
 * Chi tiết câu hỏi trong kết quả của một lần thi
 * (dùng trong response của /result)
 */
export interface AttemptResultQuestion {
  examQuestionId: string;
  question: ExamQuestionDetail;
  orderNumber: number;
  points: number;
  // Thêm object studentAnswer dựa trên JSON bạn cung cấp
  studentAnswer: {
    studentAnswerId: string;
    selectedAnswerId: string | null;
    frqAnswerText: string | null;
    score: number;
    feedback: string | null;
    correctAnswer: {
      id: string;
      content: string;
      isCorrect: boolean;
      explanation: string | null;
    };
  };
  selectedAnswerId?: string;
  frqAnswerText?: string;
  isCorrect?: boolean;
  score: number;
}

/**
 * Chi tiết đầy đủ của một lần thi đã hoàn thành
 * (dùng trong response của /result)
 */
export interface AttemptResultDetail {
  attemptId: string; // ID của Attempt
  examId: string;
  title: string;
  subjects: ExamSubjectInfo[];
  status: string; // "IN_PROGRESS", "COMPLETED"
  score: number;
  passingScore: number;
  startTime: string;
  endTime: string;
  rating: number;
  doneBy: string;
  comment?: string;
  questions: AttemptResultQuestion[];
}

/**
 * Kiểu dữ liệu cho response của API /my-history
 * (Sử dụng lại ExamResult từ test.ts vì cấu trúc khớp)
 */
export type AttemptHistoryResponse = PageInfo<ExamResult>;

/**
 * Payload cho API /exam-attempts/{attemptId}/save-progress
 */
export interface SaveProgressPayload {
  answers: {
    examQuestionId: string;
    selectedAnswerId?: string | null; // Dùng cho MCQ
    frqAnswerText?: string | null;    // Dùng cho FRQ   
  }[];
  attemptSessionToken: string;
}

/**
 * Item chấm điểm trong payload manual-grade
 */
export interface ManualGradeItem {
  examQuestionId: string;
  score: number;
  feedback?: string;
}

/**
 * Payload cho API /exam-attempts/{attemptId}/manual-grade
 */
export interface ManualGradePayload {
  grades: ManualGradeItem[];
}

/**
 * Payload cho API /exam-attempts/{attemptId}/request-review
 */
export interface RequestReviewPayload {
  reason: string;
}

/**
 * Param cho API /exam-attempts/teacher/review-queue
 */
export interface ReviewQueueQueryParams {
  pageNo?: number;
  pageSize?: number;
  includePending?: boolean;
  includeReviewRequested?: boolean;
  sorts?: string[];
}

/**
 * Item trong danh sách hàng chờ chấm điểm (response của review-queue)
 */
export interface ReviewQueueItem {
  attemptId: string;
  examId: string;
  doneBy: string;
  score: number;
  startTime: string;
  endTime: string;
  status: string;
  rating: number;
}