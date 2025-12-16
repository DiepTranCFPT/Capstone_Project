import React from 'react'
import { FiBook, FiClock, FiFileText, FiLoader } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '~/hooks/useAuth';
import type { Exam } from '~/types/test';

interface ExamCardProps {
    exams: Exam;
    onStartExam?: (exam: Exam) => void;
    isLoading?: boolean;
    loadingExamId?: string;
}

const ExamCard: React.FC<ExamCardProps> = ({ exams, onStartExam, isLoading = false, loadingExamId }) => {
    const isCurrentExamLoading = isLoading && loadingExamId === exams.id;
    const { isAuthenticated } = useAuth();

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex flex-col hover:shadow-xl transition-shadow duration-300 h-max">
            <h3 className="text-lg font-bold text-gray-800">{exams.title}</h3>

            <div className="flex items-center text-gray-600 text-xs mb-2">
                {exams.teacherAvatarUrl ? (
                    <img
                        src={exams.teacherAvatarUrl}
                        alt={`${exams.teacherName} Avatar`}
                        className="w-5 h-5 rounded-full mr-2 object-cover"
                    />
                ) : (
                    <div className="w-5 h-5 rounded-full mr-2 bg-teal-100 flex items-center justify-center text-teal-600 text-xs font-semibold">
                        {exams.teacherName?.charAt(0)?.toUpperCase() || 'T'}
                    </div>
                )}
                <span>{exams.teacherName}</span>
            </div>
            <div className="flex items-center text-gray-600 text-xs mb-4">
                <span className="flex items-center mr-2">
                    {'⭐'.repeat(Math.floor(exams.rating))} ({exams.rating})
                </span>
                <span className='flex items-center gap-1 text-md text-gray-700'>- {exams.tokenCost === 0 ? 'Free' : `${exams.tokenCost.toLocaleString('vi-VN')}`}  (VNĐ)</span>
            </div>

            {/* Subject */}
            <div className="flex items-center justify-center mb-4 w-max">
                <span className="flex items-center text-xs text-gray-700 font-bold">{exams.subject}</span>
            </div>

            <div className="flex items-center text-gray-600 text-xs space-x-4 mb-4">
                <div className="flex items-center" title="Multiple Choice Questions">
                    <FiFileText className="mr-1" />
                    <span>{exams.mcqCount ?? 0} MCQ</span>
                </div>
                <div className="flex items-center" title="Free Response Questions">
                    <FiBook className="mr-1" />
                    <span>{exams.frqCount ?? 0} FRQ</span>
                </div>
                <div className="flex items-center" title="Duration">
                    <FiClock className="mr-1" />
                    <span>{exams.duration} Min</span>
                </div>
            </div>

            {/* Descriptons */}
            <div className="mb-4">
                <p className="text-xs text-gray-600">{exams.description}</p>
            </div>
            {/* Status */}
            <div className="flex items-center justify-center mb-4 w-max">
                <span className="flex items-center text-xs text-green-600 font-bold">{exams.status}</span>
            </div>


            {/* Giả sử đây là progress bar và nút bấm */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-teal-500 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>

            <div className="mt-auto flex justify-between items-center">
                <Link
                    to={`/exam-details/${exams.id}`}
                    className="text-sm font-semibold text-teal-600 px-4 py-2 rounded-lg bg-teal-50 border border-teal-200 hover:bg-teal-100">
                    Details
                </Link>
                {onStartExam && isAuthenticated && (
                    <button
                        onClick={() => onStartExam(exams)}
                        disabled={isCurrentExamLoading}
                        className={`text-sm font-semibold text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${isCurrentExamLoading
                                ? 'bg-teal-400 cursor-not-allowed'
                                : 'bg-teal-500 hover:bg-teal-600 hover:cursor-pointer'
                            }`}
                    >
                        {isCurrentExamLoading ? (
                            <>
                                <FiLoader className="animate-spin" />
                                Loading...
                            </>
                        ) : (
                            'Start Exam'
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

export default ExamCard
