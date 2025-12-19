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
                        let content = trimmedLine.slice(5).trimStart();

                        // Skip SSE completion signal
                        if (content === '[DONE]') {
                            continue;
                        }

                        // Try to parse as JSON (some SSE APIs send JSON objects)
                        try {
                            const jsonData = JSON.parse(content);
                            // Handle different JSON formats
                            if (jsonData.content) {
                                content = jsonData.content;
                            } else if (jsonData.text) {
                                content = jsonData.text;
                            } else if (jsonData.delta?.content) {
                                content = jsonData.delta.content;
                            } else if (typeof jsonData === 'string') {
                                content = jsonData;
                            }
                        } catch {
                            // Not JSON, use content as-is (plain text)
                        }

                        if (content) {
                            onChunk(content);
                        }
                    }
                }
            }
        });

        // Process any remaining content in buffer after stream ends
        if (buffer.trim()) {
            const trimmedLine = buffer.trim();
            if (trimmedLine.startsWith('data:')) {
                let content = trimmedLine.slice(5).trimStart();

                if (content !== '[DONE]') {
                    try {
                        const jsonData = JSON.parse(content);
                        if (jsonData.content) {
                            content = jsonData.content;
                        } else if (jsonData.text) {
                            content = jsonData.text;
                        } else if (jsonData.delta?.content) {
                            content = jsonData.delta.content;
                        } else if (typeof jsonData === 'string') {
                            content = jsonData;
                        }
                    } catch {
                        // Not JSON, use content as-is
                    }

                    if (content) {
                        onChunk(content);
                    }
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
                        let content = trimmedLine.slice(5).trimStart();

                        // Skip SSE completion signal
                        if (content === '[DONE]') {
                            continue;
                        }

                        // Try to parse as JSON (some SSE APIs send JSON objects)
                        try {
                            const jsonData = JSON.parse(content);
                            // Handle different JSON formats
                            if (jsonData.content) {
                                content = jsonData.content;
                            } else if (jsonData.text) {
                                content = jsonData.text;
                            } else if (jsonData.delta?.content) {
                                content = jsonData.delta.content;
                            } else if (typeof jsonData === 'string') {
                                content = jsonData;
                            }
                        } catch {
                            // Not JSON, use content as-is (plain text)
                        }

                        if (content) {
                            onChunk(content);
                        }
                    }
                }
            }
        });

        // Process any remaining content in buffer after stream ends
        if (buffer.trim()) {
            const trimmedLine = buffer.trim();
            if (trimmedLine.startsWith('data:')) {
                let content = trimmedLine.slice(5).trimStart();

                if (content !== '[DONE]') {
                    try {
                        const jsonData = JSON.parse(content);
                        if (jsonData.content) {
                            content = jsonData.content;
                        } else if (jsonData.text) {
                            content = jsonData.text;
                        } else if (jsonData.delta?.content) {
                            content = jsonData.delta.content;
                        } else if (typeof jsonData === 'string') {
                            content = jsonData;
                        }
                    } catch {
                        // Not JSON, use content as-is
                    }

                    if (content) {
                        onChunk(content);
                    }
                }
            }
        }

        onComplete();
    } catch (error) {
        onError(error instanceof Error ? error : new Error('Unknown error'));
    }
};

