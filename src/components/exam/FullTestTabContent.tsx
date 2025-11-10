import type React from "react";
import { FiAlertTriangle, FiLoader } from 'react-icons/fi';
import { useEffect, useState } from "react";
import type { ApiExam } from "~/types/test";
import { useExams } from "~/hooks/useExams";
import { useExamAttempt } from "~/hooks/useExamAttempt";
import { useNavigate } from "react-router-dom";


const FullTestTabContent: React.FC<{ examId: string | undefined }> = ({ examId }) => {
    const { currentExam, loading, error, fetchExamById } = useExams();
    const { startSingleAttempt } = useExamAttempt();
    const navigation = useNavigate();
    const [isStartingExam, setIsStartingExam] = useState(false);
    // Fetch exam data when examId changes
    useEffect(() => {
        if (examId) {
            fetchExamById(examId);
        }
    }, [examId, fetchExamById]);

    const handleStartExamClick = async (exam: ApiExam) => {
        setIsStartingExam(true);

        try {
            const attempt = await startSingleAttempt({ templateId: exam.id });
            if (attempt) {
                // Store attempt data in localStorage for DoTestPage to use
                localStorage.setItem('activeExamAttempt', JSON.stringify(attempt));
                // Navigate to test page
                navigation(`/do-test/${exam.id}/full`);
            }
        } finally {
            setIsStartingExam(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <FiLoader className="animate-spin text-teal-500 mx-auto mb-4" size={32} />
                <p className="text-gray-600">Loading exam details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-red-500 mb-4">Error loading exam: {error}</div>
                <button
                    onClick={() => examId && fetchExamById(examId)}
                    className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-700 p-4 rounded-r-lg mb-5 flex items-start">
                <FiAlertTriangle className="h-5 w-5 mr-3 mt-1" />
                <div>
                    <p className="font-bold">Warning: </p>
                    <p>This is a full test including both Multiple Choice and Free Response sections. The timer will start immediately.</p>
                </div>
            </div>
            {currentExam && (
                <button
                    onClick={() => handleStartExamClick(currentExam)}
                    disabled={isStartingExam}
                    className="mt-4 bg-teal-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isStartingExam ? (
                        <>
                            <FiLoader className="animate-spin" size={16} />
                            Đang tải...
                        </>
                    ) : (
                        'Vào Thi'
                    )}
                </button>
            )}
        </div>
    );
};


export default FullTestTabContent;
