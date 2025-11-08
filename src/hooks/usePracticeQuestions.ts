import { useState, useCallback, useEffect } from "react";
import type { QuestionV2 } from "~/types/question";
import { useQuestionBankV2 } from "./useQuestionBankV2";

// Transform API QuestionV2 to component Question format
interface PracticeQuestion {
    id: number;
    text: string;
    options: { id: string; text: string }[];
    correctAnswer: string;
}

export const usePracticeQuestions = (practiceType?: 'mcq' | 'frq') => {
    const { questions: apiQuestions, loading, total, totalPages, pageNo, setPageNo, pageSize, setPageSize, fetchQuestions } = useQuestionBankV2(practiceType);
    const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([]);

    // Transform API questions to practice format
    const transformQuestions = useCallback((questions: QuestionV2[]): PracticeQuestion[] => {
        // Filter questions by type if practiceType is specified
        const filteredQuestions = practiceType ? questions.filter(q => q.type === practiceType) : questions;

        return filteredQuestions
            .map((q, index) => {
                // Find the correct answer by looking for "(Correct)" in the content
                const correctAnswerIndex = q.answers.findIndex(answer =>
                    answer.content && answer.content.toLowerCase().includes('(correct)')
                );

                // Extract the clean answer text (remove the "(Correct)" or "(Incorrect)" part)
                const options = q.answers.map((answer, answerIndex) => {
                    const cleanText = answer.content ? answer.content.replace(/\s*\((Correct|Incorrect)\)\s*$/i, '').trim() : '';
                    return {
                        id: String.fromCharCode(97 + answerIndex), // 'a', 'b', 'c', 'd'
                        text: cleanText
                    };
                });

                return {
                    id: index,
                    text: q.content,
                    options: options,
                    correctAnswer: String.fromCharCode(97 + Math.max(0, correctAnswerIndex)), // 'a', 'b', 'c', 'd'
                };
            });
    }, [practiceType]);

    useEffect(() => {
        if (apiQuestions.length > 0) {
            const transformed = transformQuestions(apiQuestions);
            console.log('API Questions:', apiQuestions);
            console.log('Transformed Questions:', transformed);
            setPracticeQuestions(transformed);
        } else {
            console.log('No API questions available');
        }
    }, [apiQuestions, transformQuestions]);

    const shuffleQuestions = useCallback(() => {
        const shuffled = [...practiceQuestions].sort(() => Math.random() - 0.5);
        setPracticeQuestions(shuffled);
    }, [practiceQuestions]);

    return {
        questions: practiceQuestions,
        loading,
        total,
        totalPages,
        pageNo,
        setPageNo,
        pageSize,
        setPageSize,
        fetchQuestions,
        shuffleQuestions,
    };
};
