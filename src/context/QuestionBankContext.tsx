import { createContext } from 'react';
import type { QuestionBankItem } from '~/types/question';

export interface QuestionBankContextType {
    questionBank: QuestionBankItem[];
    addQuestion: (question: QuestionBankItem) => void;
    updateQuestion: (id: string, question: QuestionBankItem) => void;
    deleteQuestion: (id: string) => void;
}

export const QuestionBankContext = createContext<QuestionBankContextType | null>(null);
