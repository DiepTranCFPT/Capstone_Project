import React from 'react';
import ExamCard from '~/components/exam/ExamCard';
import StatCard from '~/components/exam/StatCard';
import { FiSearch, FiAward, FiUsers, FiClipboard, FiFileText } from 'react-icons/fi';
import Section from '~/components/exam/Section';
import { exams } from '~/data/mockTest';

const categories = ["All", "Math", "History", "Art", "Biology", "Chemistry", "Physics", "English", "Music"];

const ExamTestPage: React.FC = () => {
    return (
        <div className="bg-slate-50">
            {/* Page Title Section */}
            <Section />

            {/* Main Content Section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="">

                    {/* Exams Library */}
                    <div className="lg:col-span-2">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Exams Library</h2>

                        {/* Filter Buttons */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {categories.map((cat, index) => (
                                <button
                                    key={cat}
                                    className={`px-5 py-2 text-sm font-medium rounded-full transition-colors duration-300 ${index === 0
                                        ? 'bg-teal-500 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Search Bar */}
                        <div className="relative mb-8">
                            <input
                                type="text"
                                placeholder="Enter key word to search"
                                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-teal-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-600 hover:cursor-pointer">
                                Search
                            </button>
                        </div>


                    </div>
                    <div className='flex sm:flex-row flex-col gap-8'>
                        {/* Left Side: Exams Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-6 w-full">
                            {exams.map((exam, index) => (
                                <ExamCard key={index} {...exam} />
                            ))}
                        </div>

                        {/* Right Side: Stats */}
                        <aside className="space-y-6">
                            <StatCard icon={FiAward} value="4521+" label="Full Length Mock Tests" />
                            <StatCard icon={FiUsers} value="1485+" label="Sectional Tests" />
                            <StatCard icon={FiClipboard} value="4521+" label="Active Students" />
                            <StatCard icon={FiFileText} value="4521+" label="Full Length Mock Tests" />
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ExamTestPage;