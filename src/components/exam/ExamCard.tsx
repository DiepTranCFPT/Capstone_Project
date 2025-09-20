import React from 'react'
import { FiBook, FiClock, FiFileText } from 'react-icons/fi';
import { Link } from 'react-router-dom';

interface ExamCardProps {
    id: number;
    title: string;
    level: string;
    questions: number;
    parts: number;
    duration: number;
}

const ExamCard: React.FC<ExamCardProps> = ({ id, title, level, questions, parts, duration }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex flex-col hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500 mb-3">{level}</p>

            <div className="flex items-center text-gray-600 text-xs space-x-4 mb-4">
                <div className="flex items-center">
                    <FiFileText className="mr-1" />
                    <span>{parts} Sentences</span>
                </div>
                <div className="flex items-center">
                    <FiBook className="mr-1" />
                    <span>{questions} Number</span>
                </div>
                <div className="flex items-center">
                    <FiClock className="mr-1" />
                    <span>{duration} Min</span>
                </div>
            </div>

            {/* Giả sử đây là progress bar và nút bấm */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-teal-500 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>

            <div className="mt-auto flex justify-between items-center">
                <button className="text-sm font-semibold text-teal-600 px-4 py-2 rounded-lg bg-teal-50 border border-teal-200 hover:bg-teal-100">
                    Wight-B1
                </button>
                <Link to={`/exam-test/${id}`}>
                    <button className="text-sm font-semibold text-gray-700 px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 hover:bg-gray-200 hover:cursor-pointer">
                        Details
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default ExamCard