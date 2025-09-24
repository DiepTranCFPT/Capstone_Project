import type { User } from "./auth";
import type { Exam } from "./test"

export interface Classroom {
    id: string;
    name: string;
    subject: string;
    studentCount: number;
    coverImage: string;
};

export interface StudentSubmission {
    id: string;
    student: Pick<User, 'id' | 'name' | 'avatar'>;
    exam: Pick<Exam, 'id' | 'title'>;
    submittedAt: string;
    status: 'pending_garading' | 'graded';
    score?: number;
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