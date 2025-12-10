import { useState, useCallback } from 'react';
import { askAiStudentDashboard } from '~/services/aiService';
import type { AiStudentDashboardRequest } from '~/types/ai';

export const useAiStudentDashboard = () => {
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const askAi = useCallback(async (payload: AiStudentDashboardRequest) => {
        setIsLoading(true);
        setResponse('');
        setError(null);

        await askAiStudentDashboard(
            payload,
            (chunk) => {
                setResponse((prev) => prev + chunk);
            },
            (err) => {
                setError(err.message);
                setIsLoading(false);
            },
            () => {
                setIsLoading(false);
            }
        );
    }, []);

    const clearResponse = useCallback(() => {
        setResponse('');
        setError(null);
    }, []);

    return {
        response,
        isLoading,
        error,
        askAi,
        clearResponse
    };
};
