import type React from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiFileText } from 'react-icons/fi';

const PracticeTabContent: React.FC<{ examId: string | undefined }> = ({ examId }) => {
    const navigate = useNavigate();

    const handleStartPractice = (practiceType: 'mcq' | 'frq') => {
        if (examId) {
            // Chuyển hướng đến trang làm bài, mang theo loại practice
            navigate(`/do-test/${examId}/${practiceType}`);
        }
    };

    return (
        <div>
            <p className="font-semibold mb-4">Select the part you want to practice:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Practice MCQ Card */}
                <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center">
                    <FiFileText size={40} className="text-textTealColor mb-3" />
                    <h4 className="font-bold text-lg">Trắc nghiệm (MCQ)</h4>
                    <p className="text-sm text-gray-500 my-2">Luyện tập các câu hỏi trắc nghiệm để cải thiện tốc độ và độ chính xác.</p>
                    <button
                        onClick={() => handleStartPractice('mcq')}
                        className="mt-auto w-full bg-backgroundColor text-white font-bold py-2 rounded-lg hover:bg-teal-600 transition-colors">
                        Practice MCQ
                    </button>
                </div>
                {/* Practice FRQ Card */}
                <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center">
                    <FiEdit size={40} className="text-textTealColor mb-3" />
                    <h4 className="font-bold text-lg">Tự luận (FRQ)</h4>
                    <p className="text-sm text-gray-500 my-2">Rèn luyện kỹ năng viết và trả lời các câu hỏi mở để hiểu sâu hơn về chủ đề.</p>
                    <button
                        onClick={() => handleStartPractice('frq')}
                        className="mt-auto w-full bg-backgroundColor text-white font-bold py-2 rounded-lg hover:bg-teal-600 transition-colors">
                        Practice FRQ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PracticeTabContent
