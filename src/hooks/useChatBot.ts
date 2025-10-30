import { useState } from 'react';
import type { ChatMessage } from '../types/chatBot';
import { sendMessage } from '../services/chatBotService';
import { v4 as uuidv4 } from 'uuid';

export const useChatBot = (isAuthenticated: boolean) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      text,
      sender: 'user',
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    if (!isAuthenticated) {
      setIsLoading(true);
      // Simulate typing delay
      setTimeout(() => {
        const errorMessage: ChatMessage = {
          id: uuidv4(),
          text: 'Bạn cần đăng nhập để sử dụng chatbot.',
          sender: 'bot',
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
        setIsLoading(false);
      }, 500);
      return;
    }

    setIsLoading(true);

    try {
      const botResponse = await sendMessage(text);
      const botMessage: ChatMessage = {
        id: uuidv4(),
        text: botResponse,
        sender: 'bot',
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        text: 'Sorry, something went wrong. Please try again.',
        sender: 'bot',
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    handleSendMessage,
  };
};
