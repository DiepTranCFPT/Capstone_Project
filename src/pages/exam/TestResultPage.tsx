import React, { useState } from 'react';
import { FiInfo } from 'react-icons/fi';
import Sidebar from '~/components/exam/SideBar';
import ResultSummary from '~/components/test-result/ResultSummary';
import AdvancedReport from '~/components/test-result/AdvancedReport';
import { useParams } from 'react-router-dom';
import AIFeedbackCard from '~/components/common/AIFeedbackCard';

const TestResultPage: React.FC = () => {
    const [isAdvancedUnlocked, setIsAdvancedUnlocked] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmitReview = () => {
        console.log("Submitting review:", { rating, comment, submissionId });
        // Here you would typically send this data to an API
        alert("Review submitted successfully!");
        setRating(0);
        setComment('');
    };
    // Mock state to simulate that an FRQ was analyzed
    const [isAiAnalyzed] = useState(true); 
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
                    <div className="w-full md:w-2/d lg:w-3/4 space-y-8">
                        <ResultSummary isPractice={isPracticeTest} />

                        {isAiAnalyzed && (
                            <AIFeedbackCard
                                feedback={{
                                    score: 7,
                                    suggestions: [
                                        "Consider elaborating on the historical context.",
                                        "Your conclusion could be stronger.",
                                        "Check for minor grammatical errors in the second paragraph.",
                                    ],
                                }}
                            />
                        )}

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

                        {/* Rating and Comment Section */}
                        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
                            <h3 className="font-bold text-xl mb-4">Rate and Comment</h3>
                            <div className="flex items-center mb-4">
                                <span className="mr-2 text-gray-700">Your Rating:</span>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`w-6 h-6 cursor-pointer ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <textarea
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 mb-4"
                                rows={4}
                                placeholder="Write your comment here..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            ></textarea>
                            <button
                                onClick={handleSubmitReview}
                                className="bg-teal-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-600"
                            >
                                Submit Review
                            </button>
                        </div>
                    </div>

                    {/* Sidebar được truyền props */}
                    {!isPracticeTest && (
                        <Sidebar
                            isUnlockable={!isAdvancedUnlocked}
                            onUnlock={handleUnlock}
                        />
                    )}

                </div>
            </main>
        </div>
    );
};

export default TestResultPage;
