import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Spin } from 'antd';
import { FaRobot, FaUser, FaPaperPlane } from 'react-icons/fa';
import { useAiStudentDashboard } from '~/hooks/useAiStudentDashboard';

// Simple markdown parser for AI responses
const parseMarkdown = (text: string) => {
    // Split by numbered list items (1. 2. 3. etc.)
    const parts = text.split(/(\d+\.\s*\*\*[^*]+\*\*:?)/g);

    return (
        <div className="space-y-2">
            {parts.map((part, index) => {
                // Check if it's a numbered header like "1. **Focus on Algebra:**"
                const headerMatch = part.match(/^(\d+)\.\s*\*\*([^*]+)\*\*:?$/);
                if (headerMatch) {
                    return (
                        <div key={index} className="flex items-start gap-3 mt-4 mb-1 first:mt-0">
                            <span className="flex-shrink-0 w-7 h-7 bg-backgroundColor text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                                {headerMatch[1]}
                            </span>
                            <span className="font-semibold text-gray-800 pt-0.5">{headerMatch[2]}</span>
                        </div>
                    );
                }

                // Handle inline bold (**text**)
                const boldParts = part.split(/\*\*([^*]+)\*\*/g);
                const formattedContent = boldParts.map((segment, i) => {
                    if (i % 2 === 1) {
                        return <strong key={i} className="text-teal-600 font-semibold">{segment}</strong>;
                    }
                    return segment;
                });

                if (part.trim()) {
                    return (
                        <p key={index} className="text-gray-600 leading-relaxed ml-10">
                            {formattedContent}
                        </p>
                    );
                }
                return null;
            })}
        </div>
    );
};

const AITutorPage: React.FC = () => {
    const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'ai' }[]>([]);
    const [inputValue, setInputValue] = useState('');
    const { response, isLoading, error, askAi, clearResponse } = useAiStudentDashboard();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, response]);

    // Update AI message when streaming response changes
    useEffect(() => {
        if (response) {
            setMessages((prev) => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.sender === 'ai') {
                    return [...prev.slice(0, -1), { text: response, sender: 'ai' as const }];
                } else {
                    return [...prev, { text: response, sender: 'ai' as const }];
                }
            });
        }
    }, [response]);

    // Handle error
    useEffect(() => {
        if (error) {
            setMessages((prev) => [...prev, { text: `Error: ${error}`, sender: 'ai' as const }]);
        }
    }, [error]);

    const handleSendMessage = async () => {
        if (inputValue.trim() === '' || isLoading) return;

        const userMessage = inputValue.trim();
        setMessages((prev) => [...prev, { text: userMessage, sender: 'user' as const }]);
        setInputValue('');
        clearResponse();

        await askAi({ message: userMessage });
    };

    // Suggested questions
    const suggestedQuestions = [
        'What do I need to do?',
        'How can I improve my score?',
        'What topics should I focus on?'
    ];

    const handleSuggestedQuestion = (question: string) => {
        if (isLoading) return;
        setInputValue(question);
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 border border-gray-100">
                {/* Header */}
                <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                    <div className="w-12 h-12 bg-backgroundColor rounded-xl flex items-center justify-center shadow-lg">
                        <FaRobot className="text-2xl text-white" />
                    </div>
                    <div className="ml-4">
                        <h1 className="text-2xl font-bold text-gray-800">AI Support</h1>
                        <p className="text-sm text-gray-500">Your personal learning assistant</p>
                    </div>
                </div>

                {/* Suggested questions */}
                {messages.length === 0 && (
                    <div className="mb-6">
                        <p className="text-sm text-gray-500 mb-3">Try asking:</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestedQuestions.map((question, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestedQuestion(question)}
                                    className="px-4 py-2 bg-white border-2 border-teal-200 text-teal-600 rounded-full text-sm font-medium hover:bg-teal-50 hover:border-teal-400 transition-all duration-200 shadow-sm hover:shadow"
                                >
                                    {question}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chat area */}
                <div className="rounded-xl p-4 h-[450px] overflow-y-auto mb-4 bg-white border border-gray-200 shadow-inner">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <FaRobot className="text-6xl mb-4 text-gray-300" />
                            <p className="text-lg">Ask me anything about your learning!</p>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                        >
                            {msg.sender === 'ai' && (
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center mr-3">
                                    <FaRobot className="text-white text-sm" />
                                </div>
                            )}
                            <div
                                className={`rounded-2xl px-5 py-3 max-w-[75%] shadow-sm ${msg.sender === 'user'
                                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-br-md'
                                    : 'bg-gray-50 text-gray-700 border border-gray-200 rounded-bl-md'
                                    }`}
                            >
                                {msg.sender === 'ai' ? (
                                    <div className="leading-relaxed">{parseMarkdown(msg.text)}</div>
                                ) : (
                                    <span>{msg.text}</span>
                                )}
                            </div>
                            {msg.sender === 'user' && (
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center ml-3">
                                    <FaUser className="text-white text-sm" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && !response && (
                        <div className="flex justify-start mb-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center mr-3">
                                <FaRobot className="text-white text-sm" />
                            </div>
                            <div className="rounded-2xl px-5 py-3 bg-gray-50 text-gray-700 border border-gray-200 rounded-bl-md">
                                <div className="flex items-center gap-2">
                                    <Spin size="small" />
                                    <span className="text-gray-500">Thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="flex gap-3">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onPressEnter={handleSendMessage}
                        placeholder="Type your question here..."
                        className="flex-grow !rounded-xl !py-3 !px-4 !border-2 !border-gray-200 hover:!border-teal-300 focus:!border-teal-500 transition-colors"
                        disabled={isLoading}
                        size="large"
                    />
                    <Button
                        type="primary"
                        onClick={handleSendMessage}
                        loading={isLoading}
                        disabled={isLoading || inputValue.trim() === ''}
                        className="!rounded-xl !h-auto !px-6 !bg-backgroundColor hover:!from-teal-600 hover:!to-teal-700 !border-0 !shadow-lg hover:!shadow-xl transition-all"
                        size="large"
                        icon={!isLoading && <FaPaperPlane />}
                    >
                        Send
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AITutorPage;
