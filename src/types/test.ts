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
  questions: QuestionBankItem[];
  teacherName: string;
  rating: number; // 1-5
  subject: string;
  attempts: number;
  parts: number;
  category?: string;
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
}

// Đại diện cho 1 quy tắc trong khuôn mẫu
export interface ExamRule {
  id: string; // Sẽ có khi get data
  topicName: string;
  difficultyName: 'Easy' | 'Medium' | 'Hard'; // Giả sử chỉ có 3 loại này
  questionType: 'mcq' | 'frq'; // Hoặc bất cứ type nào API hỗ trợ
  numberOfQuestions: number;
  points: number;
}

// Dùng khi tạo mới 1 quy tắc (không cần id)
export type CreateExamRulePayload = Omit<ExamRule, 'id'>;

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
  averageRating: number;
  totalRatings: number;
  totalTakers: number;
}

export interface MyExamTemplatePageData {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  totalElement: number;
  sortBy: string[];
  items: ExamTemplate[];
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
interface ExamSubjectInfo {
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
}

/**
 * (API Submit) Dữ liệu trả về sau khi nộp bài.
 */
export interface ExamResult {
  id: string; // Submission ID
  examId: string;
  userId: string;
  score: number;
  startAt: string; // ISO Date string
  endAt: string;   // ISO Date string
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