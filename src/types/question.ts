// Cấu trúc của mỗi lựa chọn (choice)
export interface QuestionOption {
  id?: string;
  text: string;
  isCorrect?: boolean;
}

// Đại diện cho 1 câu hỏi trong ngân hàng (API trả về)
export interface QuestionBankItem {
  id: string;
  text: string;
  subject: string;
  topic?: string;
  difficulty: "easy" | "medium" | "hard";
  type: "mcq" | "frq";
  createdBy: string;
  createdAt: string;
  options?: QuestionOption[];
  expectedAnswer?: string;
  tags?: string[];
  imageUrl?: string;
  audioUrl?: string;
  contextId?: string;
  questionContext?: QuestionContext;
}

// Dùng khi thêm câu hỏi thủ công (form modal)
export interface NewQuestion {
  text: string;
  subject: string;
  topic?: string;
  difficulty: "easy" | "medium" | "hard";
  type: "mcq" | "frq";
  tags?: string[];
  choices?: string[];
  correctIndex?: number | null;
  expectedAnswer?: string;
  imageUrl?: string;
  audioUrl?: string;
  contextId?: string;
  context?: CreateQuestionContextRequest;
}

// Form field types cho AddQuestionModal
export type QuestionFormFields = {
  text: string;
  subject: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  type: "multiple_choice" | "essay";
  choices?: string[];
  correctIndex?: number | null;
  expectedAnswer?: string;
  tags: string[];
};

// Cấu trúc của câu hỏi trắc nghiệm (MCQ)
export interface MCQ extends QuestionBankItem {
  type: "mcq";
  options: QuestionOption[];
}

// Cấu trúc của câu hỏi tự luận (FRQ)
export interface FRQ extends QuestionBankItem {
  type: "frq";
  expectedAnswer: string;
}

// Types for /questions-v2 API response
export interface Subject {
  id: string;
  name: string;
  description: string | null;
}

export interface Difficulty {
  id: string;
  name: string;
  description: string | null;
}

export interface Answer {
  id: string;
  content: string;
  isCorrect?: boolean;
  explanation?: string;
}

export interface QuestionV2 {
  id: string;
  content: string;
  type: "mcq" | "frq";
  subject: Subject;
  difficulty: Difficulty;
  createdBy: string;
  topic: string;
  answers: Answer[];
  imageUrl?: string;
  audioUrl?: string;
  questionContext?: QuestionContext;
}

export interface QuestionV2PaginationResponse {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  totalElement: number;
  sortBy: string | null;
  items: QuestionV2[];
}

export interface QuestionPaginationResponse {
  items: QuestionBankItem[];
  totalElement: number;
}

// Response type cho API import questions
export interface QuestionImportResponse {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  errorMessages: string[];
  successQuestionIds: string[];
}

// Response type cho API batch delete questions
export interface BatchDeleteQuestionsResponse {
  code: number;
  message: string;
  data: string;
}

// Types cho API /questions-v2/context
export interface QuestionContext {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  audioUrl: string;
  subjectId: string;
  subjectName: string;
}

export interface CreateQuestionContextRequest {
  title: string;
  content: string;
  imageUrl?: string;
  audioUrl?: string;
  subjectId: string;
}

export interface UpdateQuestionContextRequest {
  title: string;
  content: string;
  imageUrl?: string;
  audioUrl?: string;
  subjectId: string;
}

export interface QuestionContextResponse {
  code: number;
  message: string;
  data: QuestionContext;
}

// Types cho API /files/upload/questions
export interface FileUploadQuestionsResponse {
  code: number;
  message: string;
  data: string;
}

// Types cho API /questions-v2/context/me (lấy contexts của user hiện tại)
export interface MyContextPaginationResponse {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  totalElement: number;
  sortBy: string[];
  items: QuestionContext[];
}

// Types cho API /questions-v2/duplicates và /questions-v2/context/duplicates
export interface DuplicatesResponse {
  code: number;
  message: string;
  data: string[];
}
