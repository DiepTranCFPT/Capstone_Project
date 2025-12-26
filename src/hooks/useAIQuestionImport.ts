import { useState, useCallback } from "react";
import { generateQuestionsFromText } from "~/services/aiService";
import QuestionService from "~/services/QuestionService";
import type { AIGeneratedQuestion } from "~/types/aiQuestionImport";
import { toast } from "~/components/common/Toast";

export interface UseAIQuestionImportReturn {
    // States
    isGenerating: boolean;
    isCreating: boolean;
    generatedQuestions: AIGeneratedQuestion[];
    createdCount: number;
    error: string | null;

    // Actions
    generateQuestions: (subjectId: string, text: string, topicName?: string) => Promise<boolean>;
    createQuestions: (questions: AIGeneratedQuestion[]) => Promise<boolean>;
    updateQuestion: (index: number, updates: Partial<AIGeneratedQuestion>) => void;
    reset: () => void;
}

export const useAIQuestionImport = (): UseAIQuestionImportReturn => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [generatedQuestions, setGeneratedQuestions] = useState<AIGeneratedQuestion[]>([]);
    const [createdCount, setCreatedCount] = useState(0);
    const [error, setError] = useState<string | null>(null);

    /**
     * Generate questions from text using AI
     * @param subjectId - The subject ID for the questions
     * @param text - Raw text containing questions (correct answers marked with *)
     * @param topicName - Optional topic name to apply to all generated questions
     * @returns true if successful, false otherwise
     */
    const generateQuestions = useCallback(async (subjectId: string, text: string, topicName?: string): Promise<boolean> => {
        if (!subjectId) {
            toast.error("Please select a subject first!");
            return false;
        }
        if (!text.trim()) {
            toast.error("Please enter question content!");
            return false;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const questions = await generateQuestionsFromText(subjectId, text, topicName);

            // Check if we got valid questions array
            if (questions && Array.isArray(questions) && questions.length > 0) {
                setGeneratedQuestions(questions);
                toast.success(`AI has generated ${questions.length} question(s) successfully!`);
                return true;
            } else {
                toast.warning("AI could not find any questions in your input.");
                return false;
            }
        } catch (err) {
            console.error("Generate questions error:", err);
            const errorMessage = err instanceof Error ? err.message : "An error occurred while generating questions.";
            setError(errorMessage);
            toast.error("An error occurred while generating questions. Please try again!");
            return false;
        } finally {
            setIsGenerating(false);
        }
    }, []);

    /**
     * Batch create questions to the question bank
     * @param questions - Array of questions to create
     * @returns true if successful, false otherwise
     */
    const createQuestions = useCallback(async (questions: AIGeneratedQuestion[]): Promise<boolean> => {
        if (!questions || questions.length === 0) {
            toast.error("No questions to create!");
            return false;
        }

        setIsCreating(true);
        setError(null);

        try {
            const response = await QuestionService.batchCreate(questions);

            if (response.data.code === 1000) {
                const count = response.data.data?.length || questions.length;
                setCreatedCount(count);
                toast.success(`Successfully created ${count} question(s)!`);
                return true;
            } else {
                const errorMessage = response.data.message || "An error occurred while creating questions.";
                setError(errorMessage);
                toast.error(errorMessage);
                return false;
            }
        } catch (err) {
            console.error("Create questions error:", err);
            const errorMessage = err instanceof Error ? err.message : "An error occurred while creating questions.";
            setError(errorMessage);
            toast.error("An error occurred while creating questions. Please try again!");
            return false;
        } finally {
            setIsCreating(false);
        }
    }, []);

    /**
     * Update a specific question's fields
     * @param index - Index of the question to update
     * @param updates - Partial updates to apply
     */
    const updateQuestion = useCallback((index: number, updates: Partial<AIGeneratedQuestion>) => {
        setGeneratedQuestions((prev) => {
            const newQuestions = [...prev];
            if (index >= 0 && index < newQuestions.length) {
                newQuestions[index] = { ...newQuestions[index], ...updates };
            }
            return newQuestions;
        });
    }, []);

    /**
     * Reset all states
     */
    const reset = useCallback(() => {
        setGeneratedQuestions([]);
        setCreatedCount(0);
        setError(null);
    }, []);

    return {
        isGenerating,
        isCreating,
        generatedQuestions,
        createdCount,
        error,
        generateQuestions,
        createQuestions,
        updateQuestion,
        reset,
    };
};

export default useAIQuestionImport;
