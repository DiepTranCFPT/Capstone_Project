import type React from "react";
// import { useNavigate } from "react-router-dom";
import { FiAlertTriangle } from 'react-icons/fi';
import TokenConfirmationModal from "../common/TokenConfirmationModal";
import { useState } from "react";
import type { Exam } from "~/types/test";
import { exams } from "~/data/mockTest";


const FullTestTabContent: React.FC<{ examId: string | undefined }> = ({ examId }) => {
    // const navigate = useNavigate();
    const exam = exams.find(e => e.id === examId || '0') || null;
    const [showTokenConfirmation, setShowTokenConfirmation] = useState(false);
    const [examToStart, setExamToStart] = useState<Exam | null>(null);
    const [combinedExamToStart, setCombinedExamToStart] = useState<{ exams: Exam[]; totalCost: number } | null>(null);

    const handleStartExamClick = (exam: Exam) => {
            setExamToStart(exam);
            setCombinedExamToStart(null); // Clear combined exam state
            setShowTokenConfirmation(true);
        };

    const handleConfirm = () => {
        if (examToStart) {
            console.log(`Deducting ${examToStart.tokenCost} tokens for individual exam ${examToStart.title}`);
            // Simulate token deduction API call here
            // If successful, navigate to the test page
            window.location.href = `/do-test/${examToStart.id}/full`;
        } else if (combinedExamToStart) {
            console.log(`Deducting ${combinedExamToStart.totalCost} tokens for combined test`);
            // Simulate token deduction API call here
            // For now, just log and close modal
            // Combined exams navigation could be added later
        }
        setShowTokenConfirmation(false);
    };

    const handleCancel = () => setShowTokenConfirmation(false);

    return (
        <div>
            <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-700 p-4 rounded-r-lg mb-5 flex items-start">
                <FiAlertTriangle className="h-5 w-5 mr-3 mt-1" />
                <div>
                    <p className="font-bold">Warning: </p>
                    <p>This is a full test including both Multiple Choice and Free Response sections. The timer will start immediately.</p>
                </div>
            </div>
            {exam && (
                <button onClick={() => handleStartExamClick(exam)} className="mt-4 bg-teal-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-teal-600 transition-colors">
                    Vào Thi
                </button>
            )}

            <TokenConfirmationModal
                isOpen={showTokenConfirmation}
                exam={examToStart}
                combinedExam={combinedExamToStart}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </div>
    );
};


export default FullTestTabContent;
