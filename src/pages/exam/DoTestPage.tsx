import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Timer from '~/components/do-test/Timer';
import QuestionCard from '~/components/do-test/QuestionCard';
import FRQCard from '~/components/do-test/FRQCard';
import { mockFRQ, mockMCQ } from '~/data/mockTest';


const DoTestPage: React.FC = () => {
    const { examId, testType } = useParams<{ examId: string, testType: 'full' | 'mcq' | 'frq' }>();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState<'mcq' | 'frq'>(testType === 'frq' ? 'frq' : 'mcq');
    const [showConFirmed, setShowConFirmed] = useState(false);
    const [isSubmit, setIsSubmit] = useState(false);
    const [isCancel, setIsCancel] = useState(false);
    const handleSubmit = () => {
        const submissionId = `mock-${examId}-${testType}`;
        navigate(`/test-result/${submissionId}`);
    };

    const handleCancel = () => {
        // setShowConFirmed(true);
        navigate(`/exam-test/${examId}`);
    };

    const handleConfirmSubmit = () => {
        setShowConFirmed(true);
        setIsSubmit(true);
    };

    const handleConfirmCancel = () => {
        setShowConFirmed(true);
        setIsCancel(true);
    };


    const totalQuestions = (testType === 'mcq' ? mockMCQ.length : testType === 'frq' ? mockFRQ.length : mockMCQ.length + mockFRQ.length);


    return (
        <div className="flex h-screen bg-gray-100">
            {/* Left Sidebar */}
            <aside className="w-72 bg-white p-6 flex flex-col shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-2">English Test</h2>
                <div className="flex items-center justify-between mb-6">
                    <span className="font-semibold">Time Left:</span>
                    <Timer initialMinutes={60} onTimeUp={handleSubmit} />
                </div>

                {/* Navigation Sections */}
                {testType === 'full' && (
                    <div className="flex border rounded-lg p-1 bg-gray-100 mb-4">
                        <button onClick={() => setActiveSection('mcq')} className={`flex-1 p-2 rounded-md text-sm font-semibold ${activeSection === 'mcq' ? 'bg-white shadow' : ''}`}>Trắc nghiệm</button>
                        <button onClick={() => setActiveSection('frq')} className={`flex-1 p-2 rounded-md text-sm font-semibold ${activeSection === 'frq' ? 'bg-white shadow' : ''}`}>Tự luận</button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">
                    <h3 className="font-semibold mb-3">Questions ({totalQuestions})</h3>
                    <div className="grid grid-cols-5 gap-2">
                        {[...Array(totalQuestions)].map((_, index) => (
                            <button key={index} className="w-8 h-8 rounded-md border text-sm hover:bg-gray-200 focus:bg-backgroundColor focus:text-white">
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
                <div className='flex gap-3'>
                    <button onClick={handleConfirmSubmit} className="w-full bg-backgroundColor text-white font-bold py-3 rounded-lg hover:bg-teal-600 mt-6">
                        Submit
                    </button>
                    <button onClick={handleConfirmCancel} className="w-full bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 mt-6">
                        Cancel
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Conditional Rendering based on testType and activeSection */}
                    {(testType === 'full' && activeSection === 'mcq') || testType === 'mcq' ? (
                        <>
                            <h2 className="text-2xl font-bold text-gray-700">Phần 1: Trắc nghiệm</h2>
                            {mockMCQ.map((q, index) => <QuestionCard key={q.id} question={q} questionNumber={index + 1} />)}
                        </>
                    ) : null}

                    {(testType === 'full' && activeSection === 'frq') || testType === 'frq' ? (
                        <>
                            <h2 className="text-2xl font-bold text-gray-700">Phần 2: Tự luận</h2>
                            {mockFRQ.map((q, index) => <FRQCard key={q.id} question={q} questionNumber={mockMCQ.length + index + 1} />)}
                        </>
                    ) : null}
                </div>
            </main>

            {showConFirmed && (
                <div className="fixed top-0 left-0 w-full h-full z-10">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-100 op p-6 rounded-lg shadow-lg border border-gray-200">
                        <p className="text-lg font-semibold mb-4">{isSubmit ? 'Are you sure you want to submit?' : 'Are you sure you want to cancel?'}</p>
                        <div className="flex justify-center">
                            <button onClick={() => setShowConFirmed(false)} className="mr-4 bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 hover:cursor-pointer">Cancel</button>
                            
                            {isCancel && <button onClick={handleCancel} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 hover:cursor-pointer">Confirm</button>}
                            {isSubmit && <button onClick={handleSubmit} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 hover:cursor-pointer">Confirm</button>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoTestPage;