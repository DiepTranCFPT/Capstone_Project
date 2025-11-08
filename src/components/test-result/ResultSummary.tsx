import React from 'react';
import { FiCheckCircle, FiXCircle, FiPercent } from 'react-icons/fi';
import type { AttemptResultDetail } from '~/types/examAttempt';

interface ResultSummaryProps {
    isPractice: boolean;
    attemptResultDetail: AttemptResultDetail | null;
}

const ResultSummary: React.FC<ResultSummaryProps> = ({ isPractice, attemptResultDetail }) => {
    const totalQuestions = attemptResultDetail?.questions.length || 0;
    const correct = attemptResultDetail?.questions.filter(q => q.isCorrect).length || 0;
    const incorrect = totalQuestions - correct;
    const accuracy = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
    const score = attemptResultDetail?.score || 0;

    return (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
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
                <button className="bg-orange-500 text-white font-bold px-6 py-2 rounded-lg hover:bg-orange-600">Retake</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t border-gray-300 pt-4">
                <div><p className="text-2xl font-bold">{score.toFixed(1)}%</p><p className="text-sm text-gray-500">Score</p></div>
                <div className="flex items-center justify-center gap-2"><FiPercent /><p className="text-2xl font-bold">{accuracy}%</p><p className="text-sm text-gray-500">Accuracy</p></div>
                <div className="flex items-center justify-center gap-2"><FiCheckCircle className="text-green-500" /><p className="text-2xl font-bold">{correct}</p><p className="text-sm text-gray-500">Correct</p></div>
                <div className="flex items-center justify-center gap-2"><FiXCircle className="text-red-500" /><p className="text-2xl font-bold">{incorrect}</p><p className="text-sm text-gray-500">Incorrect</p></div>
            </div>
        </div>
    );
};

export default ResultSummary;
