import type { User } from "./auth";
import type { Exam } from "./test"

export interface Classroom {
    id: string;
    name: string;
    subject: string;
    studentCount: number;
    coverImage: string;
    classCode:string;
};

export interface StudentSubmission {
    id: string;
    student: Pick<User, 'id' | 'name' | 'avatar'>;
    exam: Pick<Exam, 'id' | 'title' | "duration" | "level" | "parts" | "questions">;
    submittedAt: string;
    status: 'pending_grading' | 'graded';
    score?: number;
    frqAnswers?: {
        questionId: string;
        questionText: string;
        answerText: string;
    }[];
}

export interface QuestionBankItem {
    id: string;
    text: string;
    type: 'mcq' | 'frq';
    subject: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    createdBy: string;
}

export interface StudentInClass {
    id: string;
    name: string;
    avatar: string;
    overallProgress: number;
    lastActive: string;
}

export interface Teacher {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  coursesAssigned: string;
  status: "Active" | "Inactive";
  createdAt: string;
  avatarUrl?: string;
}