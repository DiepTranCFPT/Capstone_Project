import type { QuestionBankItem } from "./question";

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
