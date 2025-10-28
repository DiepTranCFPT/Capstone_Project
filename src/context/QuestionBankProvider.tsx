import React, { useState } from 'react';
import { QuestionBankContext } from './QuestionBankContext';
import type { QuestionBankItem } from '~/types/question';
import { mockQuestionBank } from '~/data/teacher';

interface QuestionBankProviderProps {
    children: React.ReactNode;
}

export const QuestionBankProvider: React.FC<QuestionBankProviderProps> = ({ children }) => {
    const [questionBank, setQuestionBank] = useState<QuestionBankItem[]>(mockQuestionBank);

    const addQuestion = (question: QuestionBankItem) => {
        setQuestionBank(prev => [question, ...prev]);
    };

    const updateQuestion = (id: string, updatedQuestion: QuestionBankItem) => {
        setQuestionBank(prev => prev.map(q => q.id === id ? updatedQuestion : q));
    };

    const deleteQuestion = (id: string) => {
        setQuestionBank(prev => prev.filter(q => q.id !== id));
    };

    return (
        <QuestionBankContext.Provider value={{
            questionBank,
            addQuestion,
            updateQuestion,
            deleteQuestion,
        }}>
            {children}
        </QuestionBankContext.Provider>
    );
};

export default QuestionBankProvider;
