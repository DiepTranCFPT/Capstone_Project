export interface Subject {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type NewSubject = Omit<Subject, "id" | "createdAt" | "updatedAt">;
