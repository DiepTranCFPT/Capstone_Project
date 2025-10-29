import React, { useState } from 'react';
import { FiBarChart2, FiUsers, FiTarget, FiCheckCircle } from 'react-icons/fi';
import { advancedData } from '~/data/mockTest';

interface QuestionDetail {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
}

const AdvancedReport: React.FC = () => {
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

    return (
        <>
            <div className="space-y-6 animate-fade-in">
            {/* Performance Analysis */}
            <div>
                <h4 className="text-lg font-bold text-gray-800 flex items-center mb-3"><FiBarChart2 className="mr-2 text-teal-500" />Phân tích hiệu suất theo chủ đề</h4>
                <div className="space-y-2">
                    {advancedData.performanceByTopic.map(item => (
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
                <h4 className="text-lg font-bold text-gray-800 flex items-center mb-3"><FiUsers className="mr-2 text-teal-500" />So sánh kết quả</h4>
                <p className="text-gray-600">Điểm của bạn so với điểm trung bình của những người dùng khác.</p>
                <div className="flex items-baseline justify-center gap-4 mt-2 p-4 bg-gray-50 rounded-lg">
                    <div><span className="text-3xl font-bold text-teal-600">{advancedData.comparison.userScore}%</span><p className="text-sm">Điểm của bạn</p></div>
                    <div className="text-gray-400">vs</div>
                    <div><span className="text-3xl font-bold text-gray-500">{advancedData.comparison.averageScore}%</span><p className="text-sm">Trung bình</p></div>
                </div>
            </div>

            {/* Suggestions */}
            <div>
                <h4 className="text-lg font-bold text-gray-800 flex items-center mb-3"><FiTarget className="mr-2 text-teal-500" />Chủ đề cần cải thiện</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {advancedData.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
            </div>
            {/* Detailed Answers */}
            <div>
                <h4 className="text-lg font-bold text-gray-800 flex items-center mb-3"><FiCheckCircle className="mr-2 text-teal-500" />Đáp án và giải thích chi tiết</h4>
                <div className="space-y-4">
                    {advancedData.detailedAnswers.map((ans, i) => (
                        <div key={i} className="p-4 border rounded-lg bg-gray-50">
                            <p className="font-semibold">{ans.question}</p>
                            <p className="text-sm">Bạn chọn: <span className={ans.userAnswer === ans.correctAnswer ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{ans.userAnswer}</span></p>
                            <p className="text-sm">Đáp án đúng: <span className="text-green-600 font-bold">{ans.correctAnswer}</span></p>
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
