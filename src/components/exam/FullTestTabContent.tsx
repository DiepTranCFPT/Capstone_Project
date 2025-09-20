import type React from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertTriangle } from 'react-icons/fi';


const FullTestTabContent: React.FC<{ examId: string | undefined }> = ({ examId }) => {
    const navigate = useNavigate();
    const handleStartTest = () => {
        if (examId) {
            // Chuyển hướng với loại là 'full'
            navigate(`/do-test/${examId}/full`);
        }
    };

    return (
        <div>
            <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-700 p-4 rounded-r-lg mb-5 flex items-start">
                <FiAlertTriangle className="h-5 w-5 mr-3 mt-1" />
                <div>
                    <p className="font-bold">Warning: </p>
                    <p>This is a full test including both Multiple Choice and Free Response sections. The timer will start immediately.</p>
                </div>
            </div>
            <button onClick={handleStartTest} className="mt-4 bg-teal-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-teal-600 transition-colors">
                Start Full Test
            </button>
        </div>
    );
};


export default FullTestTabContent;