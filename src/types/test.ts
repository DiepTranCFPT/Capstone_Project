import type { QuestionBankItem } from "./question";
import type { ApiResponse } from "./api";
export type { QuestionBankItem } from "./question";

export interface Test {
  id: string;
  title: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  questions: QuestionBankItem[];
  duration?: number; // thời lượng bài thi (phút)
  totalMarks?: number; // tổng điểm
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  duration: number; // thời lượng (min)
  examTypeId: string; // corresponds to exam_type_id
  subjectId: string; // corresponds to subject_id
  teacherId: string; // corresponds to teacher_id

  totalQuestions: number; // corresponds to total_questions
  maxAttempts: number; // corresponds to max_attempts
  status: string;
  createdAt: string; // corresponds to created_at
  updatedAt: string; // corresponds to updated_at
  tokenCost: number; // corresponds to token_cost
  // Additional frontend fields not in DB
  // questions: QuestionBankItem[];
  teacherName: string;
  rating: number; // 1-5
  subject: string;
  attempts: number;
  // parts: number;
  category?: string;
  mcqCount?: number; // Number of multiple choice questions
  frqCount?: number; // Number of free response questions
  teacherAvatarUrl?: string; // Teacher's avatar URL
}

export interface CompletedTest {
  id: string;
  title: string;
  date: string;
  score: number;
  mcqTime: number;
  frqTime: number;
  apScore: number;
  progress: number;
}

export interface ApiExam {
  id: string;
  title: string;
  description: string;
  subject: {
    id: string;
    name: string;
    description: string;
  };
  duration: number;
  passingScore: number;
  isActive: boolean;
  createdBy: string;
  createdAt?: string;
  rules: {
    id: string;
    topic: string;
    difficulty: string;
    questionType: string;
    numberOfQuestions: number;
    points: number;
  }[];
  tokenCost: number;
  averageRating: number;
  totalRatings: number;
  totalTakers: number;
}

export interface CreateExamPayload {
  title: string;
  description: string;
  duration: number;
  passingScore: number;
  subjectNames: string[]; // Send subject IDs
  questionContents: string[]; // API expects questionContents
  createdByName: string; // Include createdByName
  isActive: boolean;
  tokenCost: number;
}

// Đại diện cho 1 quy tắc trong khuôn mẫu
export interface ExamRule {
  id: string; // Sẽ có khi get data
  topicName: string;
  difficultyName: 'Easy' | 'Medium' | 'Hard'; // Giả sử chỉ có 3 loại này
  questionType: 'mcq' | 'frq'; // Hoặc bất cứ type nào API hỗ trợ
  numberOfQuestions: number;
  points: number;
  percentage?: number;
}

// Dùng khi tạo mới 1 quy tắc (không cần id)
export interface CreateExamRulePayload {
  topicName: string;
  difficultyName: 'Easy' | 'Medium' | 'Hard';
  questionType: 'mcq' | 'frq';
  numberOfQuestions: number;
  points: number;
  percentage?: number; // Frontend-only field
}

export interface ExamTemplateSubject {
  id: string;
  name: string;
  description: string;
}
// Đại diện cho 1 khuôn mẫu đề thi
export interface ExamTemplate {
  id: string;
  title: string;
  description: string;
  subject: ExamTemplateSubject;
  duration: number;
  passingScore: number;
  isActive: boolean;
  createdBy: string;
  createdAt?: string;
  rules: ExamRule[]; // API trả về
  tokenCost: number;
  averageRating: number;
  totalRatings: number;
  totalTakers: number;
  totalQuestions?: number; // Frontend-only: tổng số câu hỏi mong muốn (để tính percentage)
  scoreMapping?: ScoreMapping; // Mapping điểm sang mức (AP Score, Grade...)
}

export interface MyExamTemplatePageData {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  totalElement: number;
  sortBy: string[];
  items: ExamTemplate[];
  scoreMapping?: ScoreMapping;
}

// Dùng khi tạo mới 1 khuôn mẫu
// API POST /exam-templates nhận cả mảng rules khi tạo
export interface CreateExamTemplatePayload {
  title: string;
  description: string;
  duration: number;
  passingScore: number;
  isActive: boolean;
  subjectId: string; // API của bạn có vẻ dùng subjectNames
  rules: CreateExamRulePayload[];
  tokenCost: number;
  scoreMapping?: ScoreMapping;
}

export interface PageInfo<T> {
  pageNo: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}

// Dùng khi cập nhật thông tin chung (không bao gồm rules)
export type UpdateExamTemplatePayload = Omit<CreateExamTemplatePayload, 'rules' | 'subjectNames'>;


/**
 * (API Start) Thông tin cơ bản về môn học hoặc chủ đề.
 */
export interface ExamSubjectInfo {
  id: string;
  name: string;
  description: string;
}

/**
 * (API Start) Một lựa chọn trả lời cho câu hỏi.
 */
export interface ExamAnswer {
  id: string;
  content: string;
}

/**
 * (API Start) Chi tiết của một câu hỏi (object lồng nhau).
 */
export interface ExamQuestionDetail {
  id: string;
  content: string;
  type: string; // "mcq" | "frq"
  subject: ExamSubjectInfo;
  difficulty: ExamSubjectInfo; // Giả sử difficulty có cấu trúc tương tự subject
  createdBy: string;
  topic: string;
  answers: ExamAnswer[]; // Danh sách các lựa chọn trả lời
}

/**
 * (API Start) Một câu hỏi trong bài thi đang làm.
 */
export interface ActiveExamQuestion {
  examQuestionId: string; // ID duy nhất của câu hỏi trong lần thi này
  question: ExamQuestionDetail;
  orderNumber: number;
  points: number;
  savedAnswer?: {  // ✅ Thêm field này
    studentAnswerId: string;
    selectedAnswerId?: string | null;
    frqAnswerText?: string | null;
    score: string | null;
    feedback: string | null;
    correctAnswer: string | null;
  } | null;
}

/**
 * (API Start) Dữ liệu chính của bài thi khi bắt đầu.
 */
export interface ActiveExam {
  id: string; // Exam ID
  title: string;
  subject: ExamSubjectInfo;
  examAttemptId: string; // ID của lần làm bài này
  durationInMinute: number;
  passingScore: number;
  belongTo: string;
  attemptSessionToken: string;
  questions: ActiveExamQuestion[];
}

// 2. Types cho API /exam-test/submit/{attemptId}

/**
 * (API Submit) Payload cho một câu trả lời.
 */
export interface ExamSubmissionAnswer {
  examQuestionId: string;
  selectedAnswerId?: string; // Dùng cho MCQ
  frqAnswerText?: string;     // Dùng cho FRQ
}

/**
 * (API Submit) Payload để nộp bài.
 */
export interface SubmitExamPayload {
  answers: ExamSubmissionAnswer[];
  attemptSessionToken: string;
}

/**
 * (API Submit) Dữ liệu trả về sau khi nộp bài.
 */
export interface ExamResult {
  id?: string; // Submission ID (optional for backward compatibility)
  attemptId: string;
  examId: string;
  userId?: string;
  doneBy?: string;
  subject?: string;
  title?: string;
  score: number;
  passingScore?: number;
  startTime: string; // ISO Date string
  endTime: string | null;   // ISO Date string
  status?: 'COMPLETED' | 'PENDING_GRADING' | 'IN_PROGRESS';
  comment?: string | null;
  rating?: number | null;
  isLate?: boolean | null;
}

export type MyExamTemplateResponse = ApiResponse<MyExamTemplatePageData>;

//types cho api của học sinh xem danh sách bài thi
export interface BrowseExamTemplateParams {
  subject?: string;
  teacherId?: string;
  minRating?: number;
  pageNo?: number;
  pageSize?: number;
  sorts?: string[];
}

// Types for GET /exam-templates/ratings/{id} API
export interface ExamRatingUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  imgUrl: string;
  dob: string;
}

export interface ExamRatingItem {
  rating: number;
  comment: string;
  rateBy: ExamRatingUser;
  ratingTime: string;
}

export interface ExamRatingsPaginationData {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  totalElement: number;
  sortBy: string[];
  items: ExamRatingItem[];
}

export interface ExamRatingsResponse {
  code: number;
  message: string;
  data: ExamRatingsPaginationData;
}

export interface ExamRatingsQueryParams {
  pageNo?: number;
  pageSize?: number;
  sorts?: string[];
}



export interface ScoreRange {
  min: number;
  max: number;
}

// Mapping từ tên mức điểm ("1", "2", "A", "B"...) sang khoảng điểm
export type ScoreMapping = Record<string, ScoreRange>;