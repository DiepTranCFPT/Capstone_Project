import type { QuestionBankItem } from "./question";

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
  id: number;
  title: string;
  description?: string;
  duration: number; // thời lượng (min)
  examTypeId: number; // corresponds to exam_type_id
  subjectId: number; // corresponds to subject_id
  teacherId: number; // corresponds to teacher_id

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
  id: number;
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
  duration: number;
  passingScore: number;
  subjectNames: string[];
  createdByName: string;
  questionContents: string[];
  isActive: boolean;
  createdAt: string; // "2025-11-01"
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
