import React from 'react';
import { FiBarChart2, FiUsers, FiTarget, FiCheckCircle } from 'react-icons/fi';
import { advancedData } from '~/data/mockTest';

const AdvancedReport: React.FC = () => {
    return (
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
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdvancedReport;