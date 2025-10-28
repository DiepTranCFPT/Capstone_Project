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
  level: string;
  questions: number;
  parts: number;
  duration: number;
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
