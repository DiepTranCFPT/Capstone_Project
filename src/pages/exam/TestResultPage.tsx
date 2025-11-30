import React, { useState, useEffect } from 'react';
import { FiInfo, FiLoader } from 'react-icons/fi';
import { Modal, Input, Button } from 'antd';
import Sidebar from '~/components/exam/SideBar';
import ResultSummary from '~/components/test-result/ResultSummary';
import AdvancedReport from '~/components/test-result/AdvancedReport';
import { useParams } from 'react-router-dom';
import { useExamAttempt } from '~/hooks/useExamAttempt';
import { toast } from '~/components/common/Toast';

const TestResultPage: React.FC = () => {
    const [isAdvancedUnlocked, setIsAdvancedUnlocked] = useState(true);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submittedRating, setSubmittedRating] = useState<number | null>(null);
    const [submittedComment, setSubmittedComment] = useState('');
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewReason, setReviewReason] = useState('');

    const { submissionId } = useParams<{ submissionId: string }>();
    const { fetchAttemptResult, rateAttempt, requestReview, loading, attemptResultDetail } = useExamAttempt();

    const testType = submissionId?.split('-')[2];
    const isPracticeTest = testType === 'mcq' || testType === 'frq';

    useEffect(() => {
        if (submissionId) {
            fetchAttemptResult(submissionId).catch(err => {
                console.error('Failed to fetch result:', err);
                toast.error('Failed to load result data');
            });
        }
    }, [submissionId, fetchAttemptResult]);

    const handleSubmitReview = async () => {
        if (!submissionId || rating === 0) {
            toast.error('Please provide a rating');
            return;
        }

        try {
            await rateAttempt(submissionId, { rating, comment });
            // Store submitted values for display
            setSubmittedRating(rating);
            setSubmittedComment(comment);
            setRating(0);
            setComment('');
        } catch (err) {
            console.error('Failed to submit review:', err);
            toast.error('Failed to submit review');
        }
    };

    const handleUnlock = () => {
        console.log("Unlocking with 1 token...");
        setIsAdvancedUnlocked(true);
    };

    const handleReviewRequest = () => {
        setIsReviewModalOpen(true);
    };

    const handleSubmitReviewRequest = async () => {
        if (!submissionId || !reviewReason.trim()) {
            toast.error('Please provide a reason for review request');
            return;
        }

        try {
            await requestReview(submissionId, { reason: reviewReason.trim() });
            setIsReviewModalOpen(false);
            setReviewReason('');
        } catch (err) {
            console.error('Failed to submit review request:', err);
        }
    };

    const handleCancelReviewRequest = () => {
        setIsReviewModalOpen(false);
        setReviewReason('');
    };

    if (loading) {
        return (
            <div className="bg-slate-50 py-12">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center py-20">
                        <FiLoader className="animate-spin text-teal-500 mr-4" size={24} />
                        <span className="text-lg text-gray-600">Loading result data...</span>
                    </div>
                </main>
            </div>
        );
    }

    if (!attemptResultDetail) {
        return (
            <div className="bg-slate-50 py-12">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center py-20">
                        <FiInfo className="text-teal-500 mr-4" size={24} />
                        <span className="text-lg text-gray-600">No result data available.</span>
                    </div>
                </main>
            </div>
        );
    };

    return (
        <div className="bg-slate-50 py-12">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-8">Result Exam Test</h1>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-full md:w-2/d lg:w-3/4 space-y-8">
                        <ResultSummary
                            isPractice={isPracticeTest}
                            attemptResultDetail={attemptResultDetail}
                            onReviewRequest={handleReviewRequest}
                        />

                        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
                            <h3 className="font-bold text-xl mb-4">Answering Review</h3>
                            {isAdvancedUnlocked ? (
                                <AdvancedReport attemptResultDetail={attemptResultDetail} />
                            ) : (
                                <>
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

                        {/* Submitted Rating and Comment Display */}
                        {(submittedRating || (attemptResultDetail && attemptResultDetail.rating > 0)) && (
                            <div className="bg-white p-6 rounded-lg shadow border border-gray-300 mb-6">
                                <h3 className="font-bold text-xl mb-4">Your Submitted Rating</h3>
                                <div className="mb-4">
                                    <span className="mr-2 text-gray-700 font-semibold">Rating:</span>
                                    <div className="flex items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg
                                                key={star}
                                                className={`w-6 h-6 ${star <= (submittedRating || attemptResultDetail?.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                        <span className="ml-2 text-gray-700">({submittedRating || attemptResultDetail?.rating || 0} stars)</span>
                                    </div>
                                </div>
                                {(submittedComment.trim() || (attemptResultDetail && attemptResultDetail.rating > 0)) && (
                                    <div>
                                        <span className="text-gray-700 font-semibold">Comment:</span>
                                        <p className="mt-2 p-3 bg-gray-50 rounded-lg text-gray-600 whitespace-pre-wrap">
                                            {submittedComment || 'Thank you for your feedback!'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Rating and Comment Section */}
                        {!submittedRating && (attemptResultDetail && attemptResultDetail.rating === null) && (
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
                        )}


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
            {/* Review Request Modal */}
            <Modal
                title="Yêu cầu phúc khảo"
                visible={isReviewModalOpen}
                onCancel={handleCancelReviewRequest}
                footer={[
                    <Button key="back" onClick={handleCancelReviewRequest}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" loading={loading} onClick={handleSubmitReviewRequest}>
                        Gửi Yêu Cầu
                    </Button>,
                ]}
            >
                <Input.TextArea
                    rows={4}
                    placeholder="Vui lòng nhập lý do bạn muốn phúc khảo..."
                    value={reviewReason}
                    onChange={(e) => setReviewReason(e.target.value)}
                />
            </Modal>
        </div>
    );
};

export default TestResultPage;
