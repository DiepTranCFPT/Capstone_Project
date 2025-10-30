import React from 'react'
import { FiBook, FiClock, FiFileText } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { Exam } from '~/types/test';

interface ExamCardProps {
    exams: Exam;
    onStartExam?: (exam: Exam) => void;
}

const ExamCard: React.FC<ExamCardProps> = ({ exams, onStartExam }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex flex-col hover:shadow-xl transition-shadow duration-300 h-max">
            <h3 className="text-lg font-bold text-gray-800">{exams.title}</h3>

            <div className="flex items-center text-gray-600 text-xs mb-2">
                <img src="/path/to/placeholder-avatar.png" alt="Teacher Avatar" className="w-5 h-5 rounded-full mr-2" />
                <span>{exams.teacherName}</span>
            </div>
            <div className="flex items-center text-gray-600 text-xs mb-4">
                <span className="flex items-center mr-2">
                    {'⭐'.repeat(Math.floor(exams.rating))} ({exams.rating})
                </span>
                <span>- {exams.tokenCost} Token</span>
            </div>

            <div className="flex items-center text-gray-600 text-xs space-x-4 mb-4">
                <div className="flex items-center">
                    <FiFileText className="mr-1" />
                    <span>{exams.questions?.length || exams.totalQuestions} Sentences</span>
                </div>
                <div className="flex items-center">
                    <FiBook className="mr-1" />
                    <span>{exams.questions?.length || exams.totalQuestions} Number</span>
                </div>
                <div className="flex items-center">
                    <FiClock className="mr-1" />
                    <span>{exams.duration} Min</span>
                </div>
            </div>

            {/* Giả sử đây là progress bar và nút bấm */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-teal-500 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>

            <div className="mt-auto flex justify-between items-center">
                <Link
                    to={`/exam-details/${exams.id}`}
                    className="text-sm font-semibold text-teal-600 px-4 py-2 rounded-lg bg-teal-50 border border-teal-200 hover:bg-teal-100">
                    Xem Chi Tiết
                </Link>
                {onStartExam && (
                    <button
                        onClick={() => onStartExam(exams)}
                        className="text-sm font-semibold text-gray-700 px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 hover:bg-gray-200 hover:cursor-pointer"
                    >
                        Vào Thi
                    </button>
                )}
            </div>
        </div>
    );
}

export default ExamCard
