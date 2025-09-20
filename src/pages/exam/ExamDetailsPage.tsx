import React, { useState } from 'react';
// import { useParams, Link } from 'react-router-dom';
import { FiBookOpen, FiClipboard, FiUsers } from 'react-icons/fi';
import CommentSection from '~/components/exam/CommentSection';
import Section from '~/components/exam/Section';
import { useParams } from 'react-router-dom';
import PracticeTabContent from '~/components/exam/PracticeTabContent';
import FullTestTabContent from '~/components/exam/FullTestTabContent';
import Sidebar from '~/components/exam/SideBar';

const ExamDetailsPage: React.FC = () => {
    // Lấy ID từ URL, ví dụ: /exam-test/1
    const { examId } = useParams();
    const [activeTab, setActiveTab] = useState<'practice' | 'fullTest'>('practice');


    // Trong thực tế, bạn sẽ dùng examId để fetch dữ liệu từ API
    // Ở đây chúng ta dùng dữ liệu giả lập
    const examDetails = {
        title: "English Language Test",
        level: "Level B1",
        subject: "English",
        sentences: 40,
        attempts: 200,
    };

    const tabs = [
        { key: 'practice', label: 'Practice' },
        { key: 'fullTest', label: 'Full Test' },
        // { key: 'comment', label: 'Comment' },
    ];

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
                                <div className="flex items-center"><FiClipboard className="mr-2 text-teal-500" /> {examDetails.sentences} Sentences</div>
                                <div className="flex items-center"><FiUsers className="mr-2 text-teal-500" /> {examDetails.attempts} people attempt in previous 14 days</div>
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
                        <CommentSection />
                    </div>

                    {/* Right Sidebar */}
                    <Sidebar />
                </div>
            </main>
        </div>
    );
};

export default ExamDetailsPage;