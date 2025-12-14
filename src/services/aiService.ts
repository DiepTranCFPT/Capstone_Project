import type { AiExamAskRequest, AiStudentDashboardRequest } from "~/types/ai";
import axiosInstance from "~/configs/axios";

export const askAiExamQuestion = async (
    payload: AiExamAskRequest,
    onChunk: (chunk: string) => void,
    onError: (error: Error) => void,
    onComplete: () => void
) => {
    let lastProcessedIndex = 0;
    let buffer = ''; // Buffer for incomplete lines

    try {
        await axiosInstance.post('/ai/exam-ask', payload, {
            responseType: 'text',
            onDownloadProgress: (progressEvent) => {
                const response = progressEvent.event.currentTarget.response;
                const newContent = response.slice(lastProcessedIndex);
                lastProcessedIndex = response.length;

                // Combine buffer with new content to handle split lines
                const textToProcess = buffer + newContent;

                // Split by newlines, but keep the last part in buffer if incomplete
                const lines = textToProcess.split('\n');

                // The last element might be incomplete (no trailing newline), keep it in buffer
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith('data:')) {
                        // Remove 'data:' prefix and any leading whitespace after it
                        const content = trimmedLine.slice(5).trimStart();
                        // Add space between words if content is not empty
                        if (content) {
                            onChunk(content + ' ');
                        }
                    }
                }
            }
        });

        // Process any remaining content in buffer after stream ends
        if (buffer.trim()) {
            const trimmedLine = buffer.trim();
            if (trimmedLine.startsWith('data:')) {
                const content = trimmedLine.slice(5).trimStart();
                if (content) {
                    onChunk(content + ' ');
                }
            }
        }

        onComplete();
    } catch (error) {
        onError(error instanceof Error ? error : new Error('Unknown error'));
    }
};

export const askAiStudentDashboard = async (
    payload: AiStudentDashboardRequest,
    onChunk: (chunk: string) => void,
    onError: (error: Error) => void,
    onComplete: () => void
) => {
    let lastProcessedIndex = 0;
    let buffer = ''; // Buffer for incomplete lines

    try {
        await axiosInstance.post('/ai/students/dashboard', payload.message, {
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'text',
            onDownloadProgress: (progressEvent) => {
                const response = progressEvent.event.currentTarget.response;
                const newContent = response.slice(lastProcessedIndex);
                lastProcessedIndex = response.length;

                // Combine buffer with new content to handle split lines
                const textToProcess = buffer + newContent;

                // Split by newlines, but keep the last part in buffer if incomplete
                const lines = textToProcess.split('\n');

                // The last element might be incomplete (no trailing newline), keep it in buffer
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith('data:')) {
                        // Remove 'data:' prefix and any leading whitespace after it
                        const content = trimmedLine.slice(5).trimStart();
                        // Add space between words if content is not empty
                        if (content) {
                            onChunk(content + ' ');
                        }
                    }
                }
            }
        });

        // Process any remaining content in buffer after stream ends
        if (buffer.trim()) {
            const trimmedLine = buffer.trim();
            if (trimmedLine.startsWith('data:')) {
                const content = trimmedLine.slice(5).trimStart();
                if (content) {
                    onChunk(content + ' ');
                }
            }
        }

        onComplete();
    } catch (error) {
        onError(error instanceof Error ? error : new Error('Unknown error'));
    }
};
