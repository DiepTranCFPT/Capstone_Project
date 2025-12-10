import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Spin } from 'antd';
import { FaRobot } from 'react-icons/fa';
import { useAiStudentDashboard } from '~/hooks/useAiStudentDashboard';

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
                    // Update last AI message with streaming content
                    return [...prev.slice(0, -1), { text: response, sender: 'ai' as const }];
                } else {
                    // Add new AI message
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

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-6">
                    <FaRobot className="text-3xl text-teal-500 mr-4" />
                    <h1 className="text-3xl font-bold text-gray-800">AI Tutor</h1>
                </div>

                <div className="border rounded-lg p-4 h-96 overflow-y-auto mb-4 bg-gray-50">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                            <div className={`rounded-lg px-4 py-2 max-w-[80%] ${msg.sender === 'user' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && !response && (
                        <div className="flex justify-start mb-4">
                            <div className="rounded-lg px-4 py-2 bg-gray-200 text-gray-800">
                                <Spin size="small" /> Đang suy nghĩ...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="flex">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onPressEnter={handleSendMessage}
                        placeholder="Nhập câu hỏi của bạn..."
                        className="flex-grow"
                        disabled={isLoading}
                    />
                    <Button
                        type="primary"
                        onClick={handleSendMessage}
                        className="ml-2"
                        loading={isLoading}
                        disabled={isLoading || inputValue.trim() === ''}
                    >
                        Gửi
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AITutorPage;
