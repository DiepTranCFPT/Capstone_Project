export interface QuestionTopic {
  id: string;
  name: string;
  description?: string | null;
  subject?: string; // API returns "subject" as string
  subjectId?: string;
  subjectName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type NewQuestionTopic = Omit<QuestionTopic, "id" | "createdAt" | "updatedAt">;

