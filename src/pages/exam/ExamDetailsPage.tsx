import React, { useState, useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';
import { FiBookOpen, FiClipboard, FiUsers, FiLoader } from 'react-icons/fi';
import CommentSection from '~/components/exam/CommentSection';
import Section from '~/components/exam/Section';
import { useParams } from 'react-router-dom';
import PracticeTabContent from '~/components/exam/PracticeTabContent';
import FullTestTabContent from '~/components/exam/FullTestTabContent';
import Sidebar from '~/components/exam/SideBar';
import { useAuth } from '~/hooks/useAuth';
import { useExams } from '~/hooks/useExams';

const ExamDetailsPage: React.FC = () => {
    // Lấy ID từ URL, ví dụ: /exam-test/1
    const { examId } = useParams();
    const [activeTab, setActiveTab] = useState<'practice' | 'fullTest'>('practice');
    const { isAuthenticated } = useAuth();
    const { currentExam, loading, error, fetchExamById } = useExams();

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
        teacherName: currentExam.createdBy
    } : null;

    const tabs = [
        { key: 'practice', label: 'Practice' },
        { key: 'fullTest', label: 'Full Test' },
        // { key: 'comment', label: 'Comment' },
    ];

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
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-600 mt-4">
                                <div className="flex items-center"><FiBookOpen className="mr-2 text-teal-500" /> {examDetails.subject}</div>
                                <div className="flex items-center"><FiClipboard className="mr-2 text-teal-500" /> {examDetails.sentences} Questions</div>
                                <div className="flex items-center"><FiUsers className="mr-2 text-teal-500" /> {examDetails.totalTakers} people attempted</div>
                            </div>
                            <div className="border-b mt-6 mb-4 border-gray-200">
                                <nav className="flex space-x-4">
                                    {tabs.map(tab => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key as 'practice' | 'fullTest')}
                                            className={`px-3 hover:cursor-pointer py-2 font-semibold ${activeTab === tab.key ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'practice' && <PracticeTabContent examId={examId} />}
                            {activeTab === 'fullTest' && <FullTestTabContent examId={examId} />}
                            {/* {activeTab === 'comment' && <CommentSection />} */}
                        </div>

                        {/* Comment Section */}
                        {/* <CommentSection /> */}
                    </div>

                    {/* Right Sidebar */}
                    {isAuthenticated && (
                        <Sidebar />
                    )
                    }

                </div>
            </main>
        </div>
    );
};

export default ExamDetailsPage;
