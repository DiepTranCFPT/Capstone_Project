import React, { useState } from 'react';
import { FiInfo } from 'react-icons/fi';
import Sidebar from '~/components/exam/SideBar';
import ResultSummary from '~/components/test-result/ResultSummary';
import AdvancedReport from '~/components/test-result/AdvancedReport';
import { useParams } from 'react-router-dom';

const TestResultPage: React.FC = () => {
    const [isAdvancedUnlocked, setIsAdvancedUnlocked] = useState(false);
    const { submissionId } = useParams<{ submissionId: string }>();

    const testType = submissionId?.split('-')[2];

    const isPracticeTest = testType === 'mcq' || testType === 'frq';

    const handleUnlock = () => {
        console.log("Unlocking with 1 token...");
        setIsAdvancedUnlocked(true);
    };

    return (
        <div className="bg-slate-50 py-12">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-8">Result Exam Test</h1>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-full md:w-2/3 lg:w-3/4 space-y-8">
                        <ResultSummary isPractice={isPracticeTest} />

                        {/* Answer Review Section */}
                        {/* {!isPracticeTest && ( */}
                        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
                            <h3 className="font-bold text-xl mb-4">Answering Review</h3>

                            {isAdvancedUnlocked ? (
                                <AdvancedReport />
                            ) : (
                                <>
                                    {/* Báo cáo cơ bản */}
                                    <div className="border-b border-gray-300 pb-4 mb-4">
                                        <p className="mb-2">1. The cat is sleeping ______ the table.</p>
                                        <div className="flex items-center space-x-4">
                                            <span>Đáp án của bạn: <span className="font-semibold text-red-600">in (Sai)</span></span>
                                            <span>Đáp án đúng: <span className="font-semibold text-green-600">on</span></span>
                                        </div>
                                    </div>
                                    <div className="border-b border-gray-300 pb-4 mb-4">
                                        <p className="mb-2">2. She _______ to the store every day.</p>
                                        <div className="flex items-center space-x-4">
                                            <span>Đáp án của bạn: <span className="font-semibold text-green-600">goes (Đúng)</span></span>
                                        </div>
                                    </div>

                                    {/* Hướng dẫn mở khóa */}
                                    {!isPracticeTest && (
                                        <div className="mt-8 p-4 rounded-lg bg-teal-50 text-teal-800 flex items-center">
                                            <FiInfo size={24} className="mr-4 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-bold">Xem báo cáo chi tiết!</h4>
                                                <p className="text-sm">Nhấn nút "Unlock Advanced Report" ở sidebar bên phải để xem phân tích sâu hơn về kết quả của bạn.</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Sidebar được truyền props */}
                    <Sidebar
                        isUnlockable={!isAdvancedUnlocked}
                        onUnlock={handleUnlock}
                    />
                </div>
            </main>
        </div>
    );
};

export default TestResultPage;