import React, { useState } from 'react';
import { BarChartOutlined, UsergroupAddOutlined, AimOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { AttemptResultDetail } from '~/types/examAttempt';

interface QuestionDetail {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
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

    const openModal = (type: 'ai' | 'advisor', question: QuestionDetail) => {
        setModalContent({ type, question });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalContent({ type: 'ai', question: null });
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

    // Comparison data
    const comparison = {
        userScore: attemptResultDetail?.score || 0,
        averageScore: 70 // Placeholder
    };

    // Suggestions
    const suggestions = [
        "Consider elaborating on the historical context.",
        "Your conclusion could be stronger.",
        "Check for minor grammatical errors in the second paragraph.",
    ];

    // CẬP NHẬT: Tính toán detailedAnswers dựa trên `studentAnswer`
    const detailedAnswers = React.useMemo(() => {
        if (!attemptResultDetail?.questions) return [];
        return attemptResultDetail.questions.map((q) => {
            
            // 1. Lấy câu trả lời của học sinh
            const userAnswerContent = q.studentAnswer?.selectedAnswerId
                ? q.question.answers.find(a => a.id === q.studentAnswer.selectedAnswerId)?.content
                : null;
            
            const userAnswer = userAnswerContent
                ? cleanAnswerContent(userAnswerContent) // Làm sạch text
                : (q.studentAnswer?.frqAnswerText || 'No answer'); // Fallback cho FRQ hoặc không trả lời

            // 2. Lấy câu trả lời đúng
            const correctAnswer = q.studentAnswer?.correctAnswer?.content
                ? cleanAnswerContent(q.studentAnswer.correctAnswer.content) // Làm sạch text
                : (q.question.type === 'frq' ? 'FRQ - Check with instructor' : 'Unknown');
            
            // 3. Lấy giải thích
            const explanation = q.studentAnswer?.correctAnswer?.explanation || 'Explanation not available';

            return {
                question: q.question.content,
                userAnswer,
                correctAnswer,
                explanation
            };
        });
    }, [attemptResultDetail]);

    return (
        <>
            <div className="space-y-6 animate-fade-in">
            {/* Performance Analysis */}
            <div>
                <h4 className="text-lg font-bold text-gray-800 flex items-center mb-3"><BarChartOutlined className="mr-2 text-teal-500" />Phân tích hiệu suất theo chủ đề</h4>
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

            {/* Comparison */}
            <div>
                <h4 className="text-lg font-bold text-gray-800 flex items-center mb-3"><UsergroupAddOutlined className="mr-2 text-teal-500" />So sánh kết quả</h4>
                <p className="text-gray-600">Điểm của bạn so với điểm trung bình của những người dùng khác.</p>
                <div className="flex items-baseline justify-center gap-4 mt-2 p-4 bg-gray-50 rounded-lg">
                    <div><span className="text-3xl font-bold text-teal-600">{comparison.userScore.toFixed(1)}%</span><p className="text-sm">Điểm của bạn</p></div>
                    <div className="text-gray-400">vs</div>
                    <div><span className="text-3xl font-bold text-gray-500">{comparison.averageScore}%</span><p className="text-sm">Trung bình</p></div>
                </div>
            </div>

            {/* Suggestions */}
            <div>
                <h4 className="text-lg font-bold text-gray-800 flex items-center mb-3"><AimOutlined className="mr-2 text-teal-500" />Chủ đề cần cải thiện</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
            </div>
            {/* Detailed Answers */}
            <div>
                <h4 className="text-lg font-bold text-gray-800 flex items-center mb-3"><CheckCircleOutlined className="mr-2 text-teal-500" />Đáp án và giải thích chi tiết</h4>
                <div className="space-y-4">
                    {detailedAnswers.map((ans, i) => (
                        <div key={i} className="p-4 border rounded-lg bg-gray-50">
                            <p className="font-semibold">{i + 1}. {ans.question}</p>
                            
                            {/* CẬP NHẬT: Hiển thị "No answer" nếu không có câu trả lời */}
                            <p className={`text-sm ${ans.userAnswer === 'No answer' ? 'text-gray-500 italic' : (ans.userAnswer === ans.correctAnswer ? 'text-green-600 font-bold' : 'text-red-600 font-bold')}`}>
                                Bạn chọn: {ans.userAnswer}
                            </p>
                            
                            {/* Chỉ hiển thị đáp án đúng nếu trả lời sai và không phải là "No answer" */}
                            {ans.userAnswer !== ans.correctAnswer && ans.userAnswer !== 'No answer' && (
                                <p className="text-sm">Đáp án đúng: <span className="text-green-600 font-bold">{ans.correctAnswer}</span></p>
                            )}
                            
                            {/* Hiển thị đáp án đúng nếu không trả lời */}
                            {ans.userAnswer === 'No answer' && (
                                <p className="text-sm">Đáp án đúng: <span className="text-green-600 font-bold">{ans.correctAnswer}</span></p>
                            )}
                            
                            <p className="text-sm mt-2 pt-2 border-t text-gray-700"><em>Giải thích: {ans.explanation}</em></p>
                            <div className="flex space-x-2 mt-2">
                                <button
                                    onClick={() => openModal('ai', ans)}
                                    className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200"
                                >
                                    Hỏi AI
                                </button>
                                <button
                                    onClick={() => openModal('advisor', ans)}
                                    className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-800 hover:bg-purple-200"
                                >
                                    Hỏi Advisor
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        {showModal && modalContent.question && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
                <div className="bg-white p-8 rounded-lg shadow-xl max-w-md mx-auto">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                        {modalContent.type === 'ai' ? 'AI Feedback' : 'Ask Advisor'}
                    </h3>
                    <p className="text-gray-700 mb-4">
                        Question: {modalContent.question.question}
                    </p>
                    {modalContent.type === 'ai' ? (
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                            <p className="font-semibold text-blue-800">AI's Suggestion:</p>
                            <p className="text-blue-700">This is a placeholder for AI's detailed feedback on the question. It would analyze the user's answer, the correct answer, and the explanation to provide personalized insights.</p>
                        </div>
                    ) : (
                        <div className="mb-4">
                            <label htmlFor="advisorQuestion" className="block text-sm font-medium text-gray-700 mb-2">Your question for the Advisor:</label>
                            <textarea
                                id="advisorQuestion"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                rows={4}
                                placeholder="Type your question here..."
                            ></textarea>
                        </div>
                    )}
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={closeModal}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
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
                                className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600"
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