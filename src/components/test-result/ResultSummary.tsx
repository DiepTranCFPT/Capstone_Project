import React from 'react';
import { FiCheckCircle, FiXCircle, FiPercent } from 'react-icons/fi';

const ResultSummary: React.FC = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <p className="text-gray-600">Practice results: IELTS's Development Vocabulary 1</p>
                    <div className="flex gap-2 mt-1">
                        <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">Full Test</span>
                        <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded">New Score</span>
                    </div>
                </div>
                <button className="bg-orange-500 text-white font-bold px-6 py-2 rounded-lg hover:bg-orange-600">Retake</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t border-gray-300 pt-4">
                <div><p className="text-2xl font-bold">8/10</p><p className="text-sm text-gray-500">Score</p></div>
                <div className="flex items-center justify-center gap-2"><FiPercent /><p className="text-2xl font-bold">80%</p><p className="text-sm text-gray-500">Accuracy</p></div>
                <div className="flex items-center justify-center gap-2"><FiCheckCircle className="text-green-500" /><p className="text-2xl font-bold">8</p><p className="text-sm text-gray-500">Correct</p></div>
                <div className="flex items-center justify-center gap-2"><FiXCircle className="text-red-500" /><p className="text-2xl font-bold">2</p><p className="text-sm text-gray-500">Incorrect</p></div>
            </div>
        </div>
    );
};

export default ResultSummary;