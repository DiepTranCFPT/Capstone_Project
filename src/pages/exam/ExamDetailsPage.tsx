import React, { useState, useEffect } from 'react';
import { FiBookOpen, FiClipboard, FiUsers, FiLoader, FiStar } from 'react-icons/fi';
import Section from '~/components/exam/Section';
import { useParams } from 'react-router-dom';
import FullTestTabContent from '~/components/exam/FullTestTabContent';
import { useExams } from '~/hooks/useExams';
import { useAuth } from '~/hooks/useAuth';
import { useExamTemplateRatings } from '~/hooks/useExamTemplateRatings';

const ExamDetailsPage: React.FC = () => {
    // Lấy ID từ URL, ví dụ: /exam-test/1
    const { examId } = useParams();
    const [activeTab, setActiveTab] = useState<'reviews' | 'fullTest'>('reviews');
    const { currentExam, loading, error, fetchExamById } = useExams();
    const { isAuthenticated } = useAuth();
    const { ratings, pagination, loading: ratingsLoading, changePage } = useExamTemplateRatings(examId || '');

    // Fetch exam details when component mounts or examId changes
    useEffect(() => {
        if (examId) {
            fetchExamById(examId);
        }
    }, [examId, fetchExamById]);

    // Convert API exam data to display format
    const examDetails = currentExam ? {
        title: currentExam.title,
        level: `Passing Score ${currentExam.passingScore || 'Unknown'}`, // Default level mapping
        subject: currentExam.subject.name,
        sentences: currentExam.rules?.reduce((sum: number, rule: { id: string; topic: string; difficulty: string; questionType: string; numberOfQuestions: number; points: number }) => sum + rule.numberOfQuestions, 0) || 0,
        totalTakers: currentExam.totalTakers || 0,
        duration: currentExam.duration,
        description: currentExam.description,
        teacherName: currentExam.createdBy,
        averageRating: currentExam.averageRating || 0,
        totalRatings: currentExam.totalRatings || 0
    } : null;

    const tabs = [
        { key: 'reviews', label: 'Reviews' },
        { key: 'fullTest', label: 'Full Test' },
    ];

    // Render star rating
    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        );
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isAuthenticated) {
        return (
            <div className="bg-slate-50">
                {/* Page Title Section */}
                <Section />

                {/* Login Required Message */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center py-20">
                        <h3 className="text-3xl font-bold text-gray-800 mb-4">
                            Please login to view
                        </h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            You need to login to access exams and features of the system.
                        </p>
                        <button
                            onClick={() => window.location.href = '/auth'}
                            className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            Login
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-slate-50">
                <Section />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex justify-center items-center py-12">
                        <FiLoader className="animate-spin text-teal-500" size={32} />
                        <span className="ml-2 text-gray-600">Loading exam details...</span>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-slate-50">
                <Section />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center py-12">
                        <p className="text-red-500 mb-4">{error}</p>
                        <button
                            onClick={() => examId && fetchExamById(examId)}
                            className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600"
                        >
                            Try Again
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    if (!examDetails) {
        return (
            <div className="bg-slate-50">
                <Section />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center py-12">
                        <p className="text-gray-500">Exam not found</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="bg-slate-50">
            {/* Breadcrumb Section */}
            <Section />
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row gap-8 items-start">

                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8 w-full">
                        {/* Exam Details Card */}
                        <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
                            <span className="text-xs font-bold text-teal-700 bg-teal-100 px-3 py-1 rounded-full">{examDetails.level}</span>
                            <h1 className="text-3xl font-bold text-gray-800 mt-3">{examDetails.title} – {examDetails.level}</h1>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-600 my-4">
                                <div className="flex items-center"><FiBookOpen className="mr-2 text-teal-500" /> {examDetails.subject}</div>
                                <div className="flex items-center"><FiClipboard className="mr-2 text-teal-500" /> {examDetails.sentences} Questions</div>
                                <div className="flex items-center"><FiUsers className="mr-2 text-teal-500" /> {examDetails.totalTakers} people attempted</div>
                                <div className="flex items-center">
                                    {renderStars(Math.round(examDetails.averageRating))}
                                    <span className="ml-2 text-sm">({examDetails.totalRatings} reviews)</span>
                                </div>
                            </div>
                            <div className="flex mb-4">
                                <span className="font-bold text-teal-700">Description:</span>
                                <div className="flex items-center text-gray-600 ml-2">{examDetails.description}</div>
                            </div>
                            <div className="border-b mt-6 mb-4 border-gray-200">
                                <nav className="flex space-x-4">
                                    {tabs.map(tab => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key as 'reviews' | 'fullTest')}
                                            className={`px-3 hover:cursor-pointer py-2 font-semibold ${activeTab === tab.key ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'reviews' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-800">Student Reviews</h3>

                                    {ratingsLoading ? (
                                        <div className="flex justify-center items-center py-8">
                                            <FiLoader className="animate-spin text-teal-500" size={24} />
                                            <span className="ml-2 text-gray-600">Loading reviews...</span>
                                        </div>
                                    ) : ratings.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                                            <div className="text-5xl mb-4">📝</div>
                                            <h4 className="text-lg font-semibold text-gray-700 mb-2">No reviews yet</h4>
                                            <p className="text-gray-500">Be the first to review this exam!</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-4">
                                                {ratings.map((rating, index) => (
                                                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                                        <div className="flex items-start gap-4">
                                                            {/* Avatar */}
                                                            <div className="flex-shrink-0">
                                                                {rating.rateBy.imgUrl ? (
                                                                    <img
                                                                        src={rating.rateBy.imgUrl}
                                                                        alt={`${rating.rateBy.firstName} ${rating.rateBy.lastName}`}
                                                                        className="w-12 h-12 rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-lg">
                                                                        {rating.rateBy.firstName.charAt(0)}{rating.rateBy.lastName.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Content */}
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <h4 className="font-semibold text-gray-800">
                                                                        {rating.rateBy.firstName} {rating.rateBy.lastName}
                                                                    </h4>
                                                                    <span className="text-sm text-gray-500">
                                                                        {formatDate(rating.ratingTime)}
                                                                    </span>
                                                                </div>
                                                                <div className="mb-2">
                                                                    {renderStars(rating.rating)}
                                                                </div>
                                                                {rating.comment && (
                                                                    <p className="text-gray-600">{rating.comment}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Pagination */}
                                            {pagination && pagination.totalPage > 1 && (
                                                <div className="flex justify-center gap-2 mt-6">
                                                    <button
                                                        onClick={() => changePage(pagination.pageNo - 1)}
                                                        disabled={pagination.pageNo === 0}
                                                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Previous
                                                    </button>
                                                    <span className="px-4 py-2 text-gray-600">
                                                        Page {pagination.pageNo + 1} of {pagination.totalPage}
                                                    </span>
                                                    <button
                                                        onClick={() => changePage(pagination.pageNo + 1)}
                                                        disabled={pagination.pageNo >= pagination.totalPage - 1}
                                                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                            {activeTab === 'fullTest' && <FullTestTabContent examId={examId} />}
                        </div>
                    </div>


                </div>
            </main>
        </div>
    );
};

export default ExamDetailsPage;

