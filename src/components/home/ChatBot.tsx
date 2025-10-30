import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useChatBot } from '../../hooks/useChatBot';
import { useAuth } from '../../hooks/useAuth';

// Close icon component
const CloseIcon: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
    title="Close Chat"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);

// Typing indicator
const TypingIndicator: React.FC = () => (
  <div className="flex justify-start mb-2">
    <div className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-2 max-w-xs">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
);

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated } = useAuth();
  const { messages, isLoading, handleSendMessage } = useChatBot(isAuthenticated);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
    setInputValue('');
  };

  return (
    <div className="fixed bottom-4 right-4 w-90 h-[28rem] bg-gradient-to-br from-[#3CBCB2]/5 to-[#3CBCB2]/10 rounded-2xl shadow-2xl border border-gray-200 flex flex-col transform transition-all duration-300 hover:shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#3CBCB2] to-[#2C9C95] text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L19 6.6C18.8 6 18.5 5.4 18.1 4.9L19 3L17 1L15.4 2.1C14.9 1.7 14.3 1.4 13.7 1.2L13.4 0H10.6L10.3 1.2C9.7 1.4 9.1 1.7 8.6 2.1L7 1L5 3L5.9 4.9C5.5 5.4 5.2 6 5 6.6L3 7V9L4.1 9.4C4.3 10 4.6 10.6 5 11.1L4 13L6 15L7.6 13.9C8.1 14.3 8.7 14.6 9.3 14.8L9.6 16H12.4L12.7 14.8C13.3 14.6 13.9 14.3 14.4 13.9L16 15L18 13L17.1 11.1C17.5 10.6 17.8 10 18 9.4L19.9 9H21ZM12 8C10.3 8 9 9.3 9 11C9 12.7 10.3 14 12 14C13.7 14 15 12.7 15 11C15 9.3 13.7 8 12 8Z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">EduChat</h2>
        </div>
        <CloseIcon onClick={onClose} />
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-4xl mb-2">👋</div>
            <p className="text-sm mb-4">Xin chào! Tôi có thể giúp gì cho bạn?</p>

          </div>
        )}
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.sender === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-[#3CBCB2]/10 flex items-center justify-center mr-2 flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#3CBCB2]">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L19 6.6C18.8 6 18.5 5.4 18.1 4.9L19 3L17 1L15.4 2.1C14.9 1.7 14.3 1.4 13.7 1.2L13.4 0H10.6L10.3 1.2C9.7 1.4 9.1 1.7 8.6 2.1L7 1L5 3L5.9 4.9C5.5 5.4 5.2 6 5 6.6L3 7V9L4.1 9.4C4.3 10 4.6 10.6 5 11.1L4 13L6 15L7.6 13.9C8.1 14.3 8.7 14.6 9.3 14.8L9.6 16H12.4L12.7 14.8C13.3 14.6 13.9 14.3 14.4 13.9L16 15L18 13L17.1 11.1C17.5 10.6 17.8 10 18 9.4L19.9 9H21ZM12 8C10.3 8 9 9.3 9 11C9 12.7 10.3 14 12 14C13.7 14 15 12.7 15 11C15 9.3 13.7 8 12 8Z" />
                </svg>
              </div>
            )}
            <div className={`max-w-xs px-4 py-2 rounded-2xl shadow-sm ${message.sender === 'user'
              ? 'bg-gradient-to-r from-[#3CBCB2] to-[#2C9C95] text-white rounded-br-sm'
              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
              } animate-fade-in`}>
              <div className="text-sm leading-relaxed">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold text-[#3CBCB2]">{children}</strong>,
                    ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mt-2">{children}</ul>,
                    li: ({ children }) => <li className="ml-4">{children}</li>,
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <div className="relative px-2 pb-2 mx-auto">     
        <div ref={suggestionsRef} className="flex flex-row space-x-2 overflow-x-auto scroll-hide px-6">
          <button
            className="px-3 py-1 bg-[#3CBCB2]/10 text-[#3CBCB2] rounded-full border border-[#3CBCB2]/30 hover:bg-[#3CBCB2]/20 transition-all duration-300 text-xs font-medium whitespace-nowrap animate-slide-in-right"
            style={{ animationDelay: '0.2s' }}
            onClick={() => handleSendMessage("Điểm tối đa của AP là bao nhiêu?")}
          >
            Điểm tối đa của AP ?
          </button>
          <button
            className="px-3 py-1 bg-[#3CBCB2]/10 text-[#3CBCB2] rounded-full border border-[#3CBCB2]/30 hover:bg-[#3CBCB2]/20 transition-all duration-300 text-xs font-medium whitespace-nowrap animate-slide-in-right"
            style={{ animationDelay: '0.1s' }}
            onClick={() => handleSendMessage("Các môn thi AP phổ biến")}
          >
            Môn thi AP phổ biến ?
          </button>         
        </div>        
      </div>

      {/* Input */}
      <div className="p-4 bg-white/50 backdrop-blur-sm rounded-b-2xl border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#3CBCB2] focus:border-transparent transition-all placeholder-gray-400"
            placeholder="Nhập tin nhắn của bạn..."
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-[#3CBCB2] to-[#2C9C95] hover:from-[#2C9C95] hover:to-[#208B7C] text-white rounded-full font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={isLoading || !inputValue.trim()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;
