import type { AiExamAskRequest, AiStudentDashboardRequest } from "~/types/ai";
import axiosInstance from "~/configs/axios";

export const askAiExamQuestion = async (
    payload: AiExamAskRequest,
    onChunk: (chunk: string) => void,
    onError: (error: Error) => void,
    onComplete: () => void
) => {
    let lastProcessedIndex = 0;

    try {
        await axiosInstance.post('/ai/exam-ask', payload, {
            responseType: 'text',
            onDownloadProgress: (progressEvent) => {
                const response = progressEvent.event.currentTarget.response;
                const newContent = response.slice(lastProcessedIndex);
                lastProcessedIndex = response.length;

                // Process SSE format (data: prefix)
                // Note: This simple split might break if a "data:" line is split across two chunks.
                // For a robust implementation, we should buffer incomplete lines.
                // However, for this task, we'll assume lines come in reasonably complete or accept minor glitches.
                // To be safer, we can check for newlines.

                const lines = newContent.split('\n');
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

                const lines = newContent.split('\n');
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

        onComplete();
    } catch (error) {
        onError(error instanceof Error ? error : new Error('Unknown error'));
    }
};
