import type React from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiFileText, FiRotateCcw, FiPlayCircle, FiChevronDown } from 'react-icons/fi';
import { useState } from 'react';

const PracticeTabContent: React.FC<{ examId: string | undefined }> = ({ examId }) => {
    const navigate = useNavigate();
    const [showMCQOptions, setShowMCQOptions] = useState(false);

    const handleStartPractice = (practiceType: 'mcq' | 'frq', mode?: 'flashcard' | 'quiz') => {
        if (examId) {
            if (practiceType === 'mcq' && mode) {
                // Chuyển hướng đến trang làm bài với chế độ cụ thể
                navigate(`/do-test/${examId}/${practiceType}/${mode}`);
            } else {
                // Chuyển hướng đến trang làm bài, mang theo loại practice
                navigate(`/do-test/${examId}/${practiceType}`);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-white">Luyện Tập</h3>
                <p className="text-gray-300">Chọn hình thức luyện tập phù hợp với bạn</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Practice MCQ Card */}
                <div className="group relative">
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-teal-200/60 hover:border-teal-300/80 hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="relative">
                                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4 rounded-full border border-teal-400/30 shadow-lg">
                                    <FiFileText size={32} className="text-white" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-xl text-gray-800">Trắc nghiệm (MCQ)</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Luyện tập các câu hỏi trắc nghiệm để cải thiện tốc độ và độ chính xác
                                </p>
                            </div>

                            {/* MCQ Mode Selection */}
                            <div className="w-full space-y-3">
                                <button
                                    onClick={() => setShowMCQOptions(!showMCQOptions)}
                                    className="w-full flex items-center justify-between bg-teal-50/80 hover:bg-teal-100/90 border border-teal-200 hover:border-teal-300 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    <span>Chọn chế độ luyện tập</span>
                                    <FiChevronDown className={`transition-transform duration-200 ${showMCQOptions ? 'rotate-180' : ''}`} />
                                </button>

                                {showMCQOptions && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                                        <button
                                            onClick={() => {
                                                handleStartPractice('mcq', 'flashcard');
                                                setShowMCQOptions(false);
                                            }}
                                            className="w-full flex items-center space-x-3 bg-teal-50/60 hover:bg-teal-100/80 border border-teal-200/60 hover:border-teal-300 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
                                        >
                                            <FiRotateCcw className="text-teal-600 group-hover:text-teal-700" />
                                            <div className="text-left">
                                                <div className="font-semibold">Flash Card</div>
                                                <div className="text-xs text-gray-600">Nhấn để lật và xem đáp án</div>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => {
                                                handleStartPractice('mcq', 'quiz');
                                                setShowMCQOptions(false);
                                            }}
                                            className="w-full flex items-center space-x-3 bg-cyan-50/60 hover:bg-cyan-100/80 border border-cyan-200/60 hover:border-cyan-300 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
                                        >
                                            <FiPlayCircle className="text-cyan-600 group-hover:text-cyan-700" />
                                            <div className="text-left">
                                                <div className="font-semibold">Bài Quiz</div>
                                                <div className="text-xs text-gray-600">Làm bài trắc nghiệm thông thường</div>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Practice FRQ Card */}
                <div className="group relative">
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-indigo-200/60 hover:border-indigo-300/80 hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="relative">
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 rounded-full border border-indigo-400/30 shadow-lg">
                                    <FiEdit size={32} className="text-white" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-xl text-gray-800">Tự luận (FRQ)</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Rèn luyện kỹ năng viết và trả lời các câu hỏi mở để hiểu sâu hơn về chủ đề
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    if (examId) {
                                        navigate(`/practice-frq/${examId}`);
                                    }
                                }}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 border border-indigo-500/60 hover:border-indigo-400 shadow-lg hover:shadow-xl"
                            >
                                Bắt đầu luyện tập
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Info */}
            <div className="text-center">
                <p className="text-gray-400 text-sm">
                    💡 Mẹo: Không giới hạn thời gian - hãy dành thời gian suy nghĩ kỹ từng câu hỏi
                </p>
            </div>
        </div>
    );
};

export default PracticeTabContent
