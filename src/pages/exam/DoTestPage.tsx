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
        navigate(`/exam-details/${examId}`);
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
        <div className="flex h-screen bg-teal-50/80">
            {/* Left Sidebar */}
            <aside className="w-72 bg-white/95 backdrop-blur-sm p-6 flex flex-col shadow-xl border-r border-teal-200/50">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">📚 English Test</h2>
                    <div className="h-1 w-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></div>
                </div>

                <div className="bg-teal-50/60 rounded-xl p-4 mb-6 border border-teal-200/50">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">⏱️ Thời gian còn lại:</span>
                        <Timer initialMinutes={60} onTimeUp={handleSubmit} />
                    </div>
                </div>

                {/* Navigation Sections */}
                {testType === 'full' && (
                    <div className="bg-teal-50/60 rounded-xl p-2 mb-6 border border-teal-200/50">
                        <div className="flex rounded-lg bg-white/80 p-1 shadow-sm">
                            <button
                                onClick={() => setActiveSection('mcq')}
                                className={`flex-1 p-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    activeSection === 'mcq'
                                        ? 'bg-teal-600 text-white shadow-md'
                                        : 'text-gray-600 hover:text-teal-700 hover:bg-teal-50/50'
                                }`}
                            >
                                📝 Trắc nghiệm
                            </button>
                            <button
                                onClick={() => setActiveSection('frq')}
                                className={`flex-1 p-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    activeSection === 'frq'
                                        ? 'bg-teal-600 text-white shadow-md'
                                        : 'text-gray-600 hover:text-teal-700 hover:bg-teal-50/50'
                                }`}
                            >
                                ✍️ Tự luận
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">
                    <div className="bg-white/60 rounded-xl p-4 mb-6 border border-teal-200/50">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                            <span className="mr-2">📋</span>
                            Câu hỏi ({totalQuestions})
                        </h3>
                        <div className="grid grid-cols-5 gap-2">
                            {[...Array(totalQuestions)].map((_, index) => (
                                <button
                                    key={index}
                                    className="w-10 h-10 rounded-lg border-2 text-sm font-medium hover:bg-teal-100 hover:border-teal-300 focus:bg-teal-600 focus:text-white focus:border-teal-600 transition-all duration-200 bg-white/80 border-gray-200 text-gray-700"
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className='flex gap-3 mt-6'>
                    <button
                        onClick={handleConfirmSubmit}
                        className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-4 rounded-xl transition-all duration-200 border border-teal-500/60 hover:border-teal-400 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Nộp bài
                    </button>
                    <button
                        onClick={handleConfirmCancel}
                        className="w-full bg-red-500 hover:to-red-700 text-white font-bold py-4 rounded-xl transition-all duration-200 border border-red-400/60 hover:border-red-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Hủy
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto bg-white/40">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Conditional Rendering based on testType and activeSection */}
                    {(testType === 'full' && activeSection === 'mcq') || testType === 'mcq' ? (
                        <>
                            <div className="bg-white/80 rounded-2xl p-6 border border-teal-200/50 shadow-lg">
                                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                    <span className="mr-3">📝</span>
                                    Phần 1: Trắc nghiệm
                                </h2>
                                <div className="space-y-6">
                                    {mockMCQ.map((q, index) => (
                                        <QuestionCard key={q.id} question={{
                                            id: String(q.id),
                                            text: q.text,
                                            subject: "English",
                                            difficulty: "medium",
                                            type: "mcq",
                                            createdBy: "system",
                                            createdAt: new Date().toISOString(),
                                            options: q.options.map(o => ({ id: o.id, text: o.text }))
                                        }} questionNumber={index + 1} />
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : null}

                    {(testType === 'full' && activeSection === 'frq') || testType === 'frq' ? (
                        <>
                            <div className="bg-white/80 rounded-2xl p-6 border border-indigo-200/50 shadow-lg">
                                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                    <span className="mr-3">✍️</span>
                                    Phần 2: Tự luận
                                </h2>
                                <div className="space-y-6">
                                    {mockFRQ.map((q, index) => (
                                        <FRQCard key={q.id} question={{
                                            id: String(q.id),
                                            text: q.text,
                                            subject: "English",
                                            difficulty: "hard",
                                            type: "frq",
                                            createdBy: "system",
                                            createdAt: new Date().toISOString(),
                                            expectedAnswer: "Sample answer"
                                        }} questionNumber={mockMCQ.length + index + 1} />
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            </main>

            {showConFirmed && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-teal-200/50 max-w-md mx-4">
                        <div className="text-center">
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                                isSubmit ? 'bg-teal-100' : 'bg-red-100'
                            }`}>
                                <span className="text-2xl">
                                    {isSubmit ? '✅' : '❌'}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">
                                {isSubmit ? 'Xác nhận nộp bài' : 'Xác nhận hủy'}
                            </h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                {isSubmit
                                    ? 'Bạn có chắc chắn muốn nộp bài? Hành động này không thể hoàn tác.'
                                    : 'Bạn có chắc chắn muốn hủy bài thi? Tất cả tiến độ sẽ bị mất.'
                                }
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setShowConFirmed(false)}
                                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 border border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md"
                                >
                                    Hủy bỏ
                                </button>

                                {isCancel ? (
                                    <button
                                        onClick={handleCancel}
                                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg transition-all duration-200 border border-red-400/60 hover:border-red-300 shadow-lg hover:shadow-xl"
                                    >
                                        Xác nhận hủy
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-200 border border-teal-500/60 hover:border-teal-400 shadow-lg hover:shadow-xl"
                                    >
                                        Xác nhận nộp
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoTestPage;
