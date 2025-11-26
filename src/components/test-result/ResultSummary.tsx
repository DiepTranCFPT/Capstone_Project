import React from 'react';
import { CheckCircleOutlined, CloseCircleOutlined, PercentageOutlined } from '@ant-design/icons';
import type { AttemptResultDetail } from '~/types/examAttempt';

interface ResultSummaryProps {
    isPractice: boolean;
    attemptResultDetail: AttemptResultDetail | null;
    onReviewRequest?: () => void;
}

const ResultSummary: React.FC<ResultSummaryProps> = ({ isPractice, attemptResultDetail, onReviewRequest }) => {
     const totalQuestions = attemptResultDetail?.questions.length || 0;
    
    // CẬP NHẬT: Tính toán số câu đúng dựa trên so sánh selectedAnswerId với correctAnswer.id hoặc score > 0
    const correct = attemptResultDetail?.questions.filter(q => {
        if (!q.studentAnswer) return false;
        if (q.studentAnswer.selectedAnswerId) {
            return q.studentAnswer.selectedAnswerId === q.studentAnswer.correctAnswer?.id;
        } else {
            return q.studentAnswer.score && q.studentAnswer.score > 0;
        }
    }).length || 0;
    
    const incorrect = totalQuestions - correct;
    const accuracy = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
    const score = attemptResultDetail?.score || 0;

    return (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
            {/* Warning for PENDING_GRADING status */}
            {attemptResultDetail?.status === 'PENDING_GRADING' && (
                <div className="mb-6 p-4 rounded-lg bg-orange-50 border border-orange-200 text-orange-800">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        <div>
                            <h4 className="font-semibold">This is not the final result</h4>
                            <p className="text-sm mt-1">Your exam is still being graded for FRQ questions. Results will be updated once grading is complete.</p>
                            <p className="text-sm mt-1"><strong>Note:</strong> Đây chưa phải là kết quả cuối cùng, bài thi vẫn đang trong quá trình chấm phần tự luận</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-4">
                <div>
                    <p className="text-gray-600">
                        {isPractice ? "Practice results" : "Full Test results"}: {attemptResultDetail?.title || "Exam"}
                    </p>
                    <div className="flex gap-2 mt-1">
                        {isPractice ? (
                            <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Practice</span>
                        ) : (
                            <>
                                <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">Full Test</span>
                                <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded">New Score</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onReviewRequest}
                        className="bg-blue-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Yêu cầu chấm lại
                    </button>
                    <button className="bg-orange-500 text-white font-bold px-6 py-2 rounded-lg hover:bg-orange-600">Retake</button>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t border-gray-300 pt-4">
                <div><p className="text-2xl font-bold">{score.toFixed(1)}</p><p className="text-sm text-gray-500">Score</p></div>
                <div className="flex items-center justify-center gap-2"><PercentageOutlined /><p className="text-2xl font-bold">{accuracy}%</p><p className="text-sm text-gray-500">Accuracy</p></div>
                <div className="flex items-center justify-center gap-2"><CheckCircleOutlined className="text-green-500" /><p className="text-2xl font-bold">{correct}</p><p className="text-sm text-gray-500">Correct</p></div>
                <div className="flex items-center justify-center gap-2"><CloseCircleOutlined className="text-red-500" /><p className="text-2xl font-bold">{incorrect}</p><p className="text-sm text-gray-500">Incorrect</p></div>
            </div>
        </div>
    );
};

export default ResultSummary;
