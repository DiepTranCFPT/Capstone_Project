import React, { useState } from 'react';
import {
    BarChartOutlined,
    // UsergroupAddOutlined,
    // AimOutlined,
    CheckCircleOutlined,
    RobotOutlined,
    SendOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import type { AttemptResultDetail } from '~/types/examAttempt';
import { useAiExamAsk } from '~/hooks/useAiExamAsk';
import { useAuth } from '~/hooks/useAuth';
import ReactMarkdown from 'react-markdown';

// Helper function to format AI response with proper line breaks
const formatAiResponse = (text: string): string => {
    if (!text) return '';
    // Add line breaks before numbered headers like "1. **", "2. **", etc.
    return text.replace(/(\d+)\.\s*\*\*/g, '\n\n$1. **');
};

interface QuestionDetail {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
    feedback: string | null;
}

interface AdvancedReportProps {
    attemptResultDetail: AttemptResultDetail | null;
}

// Helper function để làm sạch nội dung câu trả lời (loại bỏ "(Correct)"/"(Incorrect)")
const cleanAnswerContent = (content: string | null | undefined): string => {
    if (!content) return '';
    return content.replace(/\s*\((Correct|Incorrect)\)\s*$/i, '').trim();
}

const AdvancedReport: React.FC<AdvancedReportProps> = ({ attemptResultDetail }) => {
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState<{ type: 'ai' | 'advisor'; question: QuestionDetail | null }>({ type: 'ai', question: null });
    const [studentQuestion, setStudentQuestion] = useState('');

    const { user } = useAuth();
    const { askAi, response: aiResponse, isLoading: isAiLoading, error: aiError, clearResponse } = useAiExamAsk();

    const openModal = (type: 'ai' | 'advisor', question: QuestionDetail) => {
        setModalContent({ type, question });
        setShowModal(true);
        setStudentQuestion('');
        clearResponse();
    };

    const closeModal = () => {
        setShowModal(false);
        setModalContent({ type: 'ai', question: null });
        setStudentQuestion('');
        clearResponse();
    };

    const handleAskAiSubmit = async () => {
        if (!modalContent.question || !attemptResultDetail || !user) return;

        await askAi({
            attemptId: attemptResultDetail.attemptId,
            questionContent: modalContent.question.question,
            studentAnswer: modalContent.question.userAnswer,
            studentAsking: studentQuestion,
            doneBy: user.email,
        });
    };

    // CẬP NHẬT: Tính toán performanceByTopic dựa trên `studentAnswer.score`
    const performanceByTopic = React.useMemo(() => {
        if (!attemptResultDetail?.questions) return [];
        const topicMap = new Map<string, { correct: number; total: number }>();
        attemptResultDetail.questions.forEach(q => {
            const topic = q.question.topic || 'Unknown';
            const current = topicMap.get(topic) || { correct: 0, total: 0 };
            current.total++;
            // Sử dụng score để xác định đúng/sai
            if (q.studentAnswer && q.studentAnswer.score > 0) current.correct++;
            topicMap.set(topic, current);
        });
        return Array.from(topicMap.entries()).map(([topic, { correct, total }]) => ({
            topic,
            accuracy: total > 0 ? Math.round((correct / total) * 100) : 0
        }));
    }, [attemptResultDetail]);

    // CẬP NHẬT: Tính toán detailedAnswers dựa trên `studentAnswer`
    const detailedAnswers = React.useMemo(() => {
        if (!attemptResultDetail?.questions) return [];
        return attemptResultDetail.questions.map((q) => {

            // 1. Lấy câu trả lời của học sinh dựa trên loại câu hỏi
            let userAnswer: string;
            if (q.question.type === 'frq') {
                // Cho FRQ, ưu tiên frqAnswerText
                userAnswer = q.studentAnswer?.frqAnswerText || 'No answer';
            } else {
                // Cho MCQ, sử dụng selectedAnswerId để tìm content
                let userAnswerContent = null;
                if (q.studentAnswer?.selectedAnswerId) {
                    userAnswerContent = q.question.answers.find(a => a.id === q.studentAnswer.selectedAnswerId)?.content;
                    // Nếu không tìm thấy bằng selectedAnswerId, thử tìm bằng content matching
                    if (!userAnswerContent && q.studentAnswer.selectedAnswerId) {
                        // Có thể selectedAnswerId là content của answer, thử tìm bằng content
                        userAnswerContent = q.question.answers.find(a => a.content === q.studentAnswer.selectedAnswerId)?.content;
                    }
                }
                userAnswer = userAnswerContent
                    ? cleanAnswerContent(userAnswerContent) // Làm sạch text
                    : (q.studentAnswer?.selectedAnswerId ? `Selected answer ID: ${q.studentAnswer.selectedAnswerId}` : 'No answer');
            }

            // 2. Lấy câu trả lời đúng
            const correctAnswer = q.studentAnswer?.correctAnswer?.content
                ? cleanAnswerContent(q.studentAnswer.correctAnswer.content) // Làm sạch text
                : (q.question.type === 'frq' ? 'FRQ - Check with instructor' : 'Unknown');

            // 3. Lấy giải thích
            const explanation = q.studentAnswer?.correctAnswer?.explanation || 'Explanation not available';

            // 4. Lấy feedback (nếu có)
            const feedback = q.studentAnswer?.feedback || null;

            return {
                question: q.question.content,
                userAnswer,
                correctAnswer,
                explanation,
                feedback
            };
        });
    }, [attemptResultDetail]);

    return (
        <>
            <div className="space-y-6 animate-fade-in">
                {/* Performance Analysis */}
                <div>
                    <h4 className="text-lg font-bold text-gray-800 flex items-center mb-3"><BarChartOutlined className="mr-2 text-teal-500" />Performance Analysis by Topic</h4>
                    <div className="space-y-2">
                        {performanceByTopic.map((item) => (
                            <div key={item.topic}>
                                <div className="flex justify-between text-sm font-medium text-gray-600">
                                    <span>{item.topic}</span>
                                    <span>{item.accuracy}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${item.accuracy}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Review & Summary */}
                {attemptResultDetail?.comment && (
                    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-100 shadow-md">
                        <h4 className="text-lg font-bold text-gray-800 flex items-center mb-4">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg mr-3 shadow-sm">
                                <FileTextOutlined className="text-white text-xl" />
                            </div>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                                Review & Summary
                            </span>
                        </h4>
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-5 shadow-sm border border-blue-100">
                            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                                <ReactMarkdown
                                    components={{
                                        p: ({ ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                                        ul: ({ ...props }) => <ul className="list-disc list-outside ml-5 mb-3 space-y-1" {...props} />,
                                        ol: ({ ...props }) => <ol className="list-decimal list-outside ml-5 mb-3 space-y-1" {...props} />,
                                        li: ({ ...props }) => <li className="pl-1" {...props} />,
                                        strong: ({ ...props }) => <strong className="font-bold text-gray-800" {...props} />,
                                        em: ({ ...props }) => <em className="italic text-gray-600" {...props} />,
                                        code: ({ ...props }) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-purple-600 border border-gray-200" {...props} />,
                                    }}
                                >
                                    {attemptResultDetail.comment}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}

                {/* Detailed Answers */}
                <div>
                    <h4 className="text-lg font-bold text-gray-800 flex items-center mb-3"><CheckCircleOutlined className="mr-2 text-teal-500" />Detailed Answers</h4>
                    <div className="space-y-4">
                        {detailedAnswers.map((ans, i) => (
                            <div key={i} className="p-4 border rounded-lg bg-gray-50">
                                <p className="font-semibold">{i + 1}. {ans.question}</p>

                                {/* CẬP NHẬT: Hiển thị "No answer" nếu không có câu trả lời */}
                                <p className={`text-sm ${ans.userAnswer === 'No answer' ? 'text-gray-500 italic' : (ans.userAnswer === ans.correctAnswer ? 'text-green-600 font-bold' : 'text-red-600 font-bold')}`}>
                                    Your answer: {ans.userAnswer}
                                </p>

                                {/* Chỉ hiển thị đáp án đúng nếu trả lời sai và không phải là "No answer" */}
                                {ans.userAnswer !== ans.correctAnswer && ans.userAnswer !== 'No answer' && (
                                    <p className="text-sm">Correct answer: <span className="text-green-600 font-bold">{ans.correctAnswer}</span></p>
                                )}

                                {/* Hiển thị đáp án đúng nếu không trả lời */}
                                {ans.userAnswer === 'No answer' && (
                                    <p className="text-sm">Correct answer: <span className="text-green-600 font-bold">{ans.correctAnswer}</span></p>
                                )}

                                {/* Hiển thị feedback nếu có */}
                                {ans.feedback && (
                                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <span className="font-semibold">Feedback:</span> {ans.feedback}
                                        </p>
                                    </div>
                                )}

                                <p className="text-sm mt-2 pt-2 border-t text-gray-700"><em>Explanation: {ans.explanation}</em></p>
                                <div className="flex space-x-2 mt-2">
                                    <button
                                        onClick={() => openModal('ai', ans)}
                                        className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center"
                                    >
                                        <RobotOutlined className="mr-1" /> Ask AI
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showModal && modalContent.question && (
                <div className="fixed inset-0 bg-gray-50 bg-opacity-60 backdrop-blur-sm overflow-y-auto h-full w-full flex justify-center items-center z-50 transition-opacity duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl mx-auto w-full max-h-[85vh] flex flex-col transform transition-all duration-300 scale-100">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-white to-gray-50 rounded-t-2xl">
                            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                                {modalContent.type === 'ai' && (
                                    <>
                                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                            <RobotOutlined className="text-blue-600 text-xl" />
                                        </div>
                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
                                            AI Assistant
                                        </span>
                                    </>
                                )}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                            {/* Context Question */}
                            <div className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Context Question</p>
                                <p className="text-gray-700 text-base leading-relaxed font-medium">{modalContent.question.question}</p>
                            </div>

                            {modalContent.type === 'ai' ? (
                                <div className="flex flex-col space-y-6">
                                    {/* Input Section */}
                                    <div>
                                        <label htmlFor="aiQuestion" className="block text-sm font-semibold text-gray-700 mb-3">
                                            What would you like to know?
                                        </label>
                                        <div className="relative flex items-center">
                                            <input
                                                id="aiQuestion"
                                                className="w-full pl-5 pr-14 py-4 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all duration-200 shadow-sm text-gray-700 placeholder-gray-400"
                                                placeholder="Ask for an explanation, hint, or similar example..."
                                                value={studentQuestion}
                                                onChange={(e) => setStudentQuestion(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !isAiLoading) {
                                                        handleAskAiSubmit();
                                                    }
                                                }}
                                                disabled={isAiLoading}
                                            />
                                            <button
                                                onClick={handleAskAiSubmit}
                                                disabled={isAiLoading || !studentQuestion.trim()}
                                                className={`absolute right-2 p-2 rounded-lg transition-all duration-200 ${isAiLoading || !studentQuestion.trim()
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                                                    }`}
                                            >
                                                {isAiLoading ? (
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <SendOutlined className="text-lg" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Response Section */}
                                    {(aiResponse || isAiLoading || aiError) && (
                                        <div className={`rounded-xl border overflow-hidden transition-all duration-300 ${aiError ? 'bg-red-50 border-red-100' : 'bg-white border-blue-100 shadow-lg ring-1 ring-blue-50'}`}>
                                            {aiError ? (
                                                <div className="p-6 flex items-start text-red-600">
                                                    <span className="mr-3 text-xl">⚠️</span>
                                                    <div>
                                                        <p className="font-bold mb-1">Something went wrong</p>
                                                        <p className="text-sm opacity-90">{aiError}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <div className="px-6 py-3 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between">
                                                        <div className="flex items-center text-blue-700 font-semibold text-sm">
                                                            <RobotOutlined className="mr-2" />
                                                            AI Response
                                                        </div>
                                                        {isAiLoading && (
                                                            <span className="flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="p-6 bg-white">
                                                        <div className="prose prose-blue prose-sm max-w-none text-gray-600 leading-relaxed">
                                                            <ReactMarkdown
                                                                components={{
                                                                    p: ({ ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                                                                    ul: ({ ...props }) => <ul className="list-disc list-outside ml-5 mb-3 space-y-1" {...props} />,
                                                                    ol: ({ ...props }) => <ol className="list-decimal list-outside ml-5 mb-3 space-y-1" {...props} />,
                                                                    li: ({ ...props }) => <li className="pl-1" {...props} />,
                                                                    strong: ({ ...props }) => <strong className="font-bold text-gray-800" {...props} />,
                                                                    code: ({ ...props }) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-pink-600 border border-gray-200" {...props} />,
                                                                    blockquote: ({ ...props }) => <blockquote className="border-l-4 border-blue-200 pl-4 italic text-gray-500 my-4" {...props} />,
                                                                }}
                                                            >
                                                                {formatAiResponse(aiResponse)}
                                                            </ReactMarkdown>
                                                            {isAiLoading && (
                                                                <div className="flex space-x-1 mt-2 h-4 items-center">
                                                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="mb-4">
                                    <label htmlFor="advisorQuestion" className="block text-sm font-semibold text-gray-700 mb-2">Your question for the Advisor:</label>
                                    <textarea
                                        id="advisorQuestion"
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-50 focus:border-purple-500 transition-all shadow-sm"
                                        rows={5}
                                        placeholder="Type your question here..."
                                    ></textarea>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex justify-end space-x-3">
                            <button
                                onClick={closeModal}
                                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-white hover:border-gray-400 hover:shadow-sm transition-all duration-200"
                            >
                                Close
                            </button>
                            {modalContent.type === 'advisor' && (
                                <button
                                    onClick={() => {
                                        console.log("Sending question to advisor for:", modalContent.question?.question);
                                        alert("Question sent to advisor!");
                                        closeModal();
                                    }}
                                    className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    Send to Advisor
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdvancedReport;
