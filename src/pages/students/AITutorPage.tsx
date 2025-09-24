import React, { useState } from 'react';
import { Button, Input } from 'antd';
import { FaRobot } from 'react-icons/fa';
import { useAuth } from '~/hooks/useAuth';

const AITutorPage: React.FC = () => {
    const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'ai' }[]>([]);
    const [inputValue, setInputValue] = useState('');
    const { user, spendTokens } = useAuth();

    const handleSendMessage = () => {
        if (inputValue.trim() === '') return;

        if (user && user.tokenBalance > 0) {
            spendTokens(1);
            const newMessages = [...messages, { text: inputValue, sender: 'user' as const }];
            setMessages(newMessages);
            setInputValue('');

            // Simulate AI response
            setTimeout(() => {
                setMessages([...newMessages, { text: 'This is a simulated AI response.', sender: 'ai' as const }]);
            }, 1000);
        } else {
            alert("You don't have enough tokens to ask a question.");
        }
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
                            <div className={`rounded-lg px-4 py-2 ${msg.sender === 'user' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onPressEnter={handleSendMessage}
                        placeholder="Ask a question (1 Token)"
                        className="flex-grow"
                    />
                    <Button type="primary" onClick={handleSendMessage} className="ml-2">
                        Send
                    </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">You have {user?.tokenBalance} tokens remaining.</p>
            </div>
        </div>
    );
};

export default AITutorPage;
