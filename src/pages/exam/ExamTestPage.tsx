import React, { useState } from 'react';
import ExamCard from '~/components/exam/ExamCard';
import StatCard from '~/components/exam/StatCard';
import TokenConfirmationModal from '~/components/common/TokenConfirmationModal';
import { FiSearch, FiAward, FiUsers, FiClipboard, FiFileText } from 'react-icons/fi';
import Section from '~/components/exam/Section';
import { exams } from '~/data/mockTest';
import type { Exam } from '~/types/test';

const categories = ["All", "Math", "History", "Art", "Biology", "Chemistry", "Physics", "English", "Music"];

const subjectBlocks: Record<string, string[]> = {
    'Math': ['Math'],
    'Natural Science': ['Biology', 'Chemistry', 'Physics'],
    'Social Sciences': ['English', 'History', 'Art', 'Music']
};

const ExamTestPage: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [activeMainTab, setActiveMainTab] = useState<'individual' | 'combined'>('individual');
    const [activeSubTab, setActiveSubTab] = useState<'selfSelected' | 'platformSelected'>('selfSelected');
    const [selectedRatingFilter, setSelectedRatingFilter] = useState<string>('');
    const [selectedAttemptsFilter, setSelectedAttemptsFilter] = useState<string>('');
    const [selectedSubjectsForCombined, setSelectedSubjectsForCombined] = useState<string[]>([]);
    const [selectedExamsForCombined, setSelectedExamsForCombined] = useState<Exam[]>([]);

    const handleSubjectToggle = (subject: string) => {
        setSelectedSubjectsForCombined(prev => {
            if (prev.includes(subject)) {
                // If subject is deselected, remove it and any selected exam for that subject
                setSelectedExamsForCombined(prevExams => prevExams.filter(exam => exam.subject !== subject));
                return prev.filter(s => s !== subject);
            } else {
                return [...prev, subject];
            }
        });
    };

    const handleExamSelectionForCombined = (subject: string, exam: Exam) => {
        setSelectedExamsForCombined(prev => {
            // Remove any existing exam for this subject and add the new one
            const filtered = prev.filter(e => e.subject !== subject);
            return [...filtered, exam];
        });
    };

    const totalCombinedTokenCost = selectedExamsForCombined.reduce((sum, exam) => sum + exam.tokenCost, 0);

    const [selectedSubjectsForPlatform, setSelectedSubjectsForPlatform] = useState<string[]>([]);

    const handlePlatformSubjectToggle = (subject: string) => {
        setSelectedSubjectsForPlatform(prev =>
            prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
        );
    };

    const [selectedBlock, setSelectedBlock] = useState<string>('');

    const [showTokenConfirmation, setShowTokenConfirmation] = useState(false);
    const [examToStart, setExamToStart] = useState<Exam | null>(null);
    const [combinedExamToStart, setCombinedExamToStart] = useState<{ exams: Exam[]; totalCost: number } | null>(null);

    const handleStartExamClick = (exam: Exam) => {
        setExamToStart(exam);
        setCombinedExamToStart(null); // Clear combined exam state
        setShowTokenConfirmation(true);
    };

    const handleStartCombinedExamClick = (exams: Exam[], totalCost: number) => {
        setCombinedExamToStart({ exams, totalCost });
        setExamToStart(null); // Clear individual exam state
        setShowTokenConfirmation(true);
    };

    const filteredExams = exams.filter(exam => {
        const categoryMatch = selectedCategory === "All" || exam.subject === selectedCategory;
        const ratingMatch = selectedRatingFilter === '' || exam.rating >= parseFloat(selectedRatingFilter);
        // Assuming exam.attempts exists and is a number
        const attemptsMatch = selectedAttemptsFilter === '' || (exam.attempts && exam.attempts >= parseInt(selectedAttemptsFilter));
        return categoryMatch && ratingMatch && attemptsMatch;
    });

    const handleConfirm = () => {
        if (examToStart) {
            console.log(`Deducting ${examToStart.tokenCost} tokens for individual exam ${examToStart.title}`);
            // Simulate token deduction API call here
            // If successful, navigate to the test page
            window.location.href = `/do-test/${examToStart.id}/full`;
        } else if (combinedExamToStart) {
            console.log(`Deducting ${combinedExamToStart.totalCost} tokens for combined test`);
            // Simulate token deduction API call here
            // For now, just log and close modal
            // Combined exams navigation could be added later
        }
        setShowTokenConfirmation(false);
    };

    const handleCancel = () => setShowTokenConfirmation(false);

    return (
        <div className="bg-slate-50">
            {/* Page Title Section */}
            <Section />

            {/* Main Content Section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="">

                    {/* Exams Library */}
                    <div className="lg:col-span-2">
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                <button
                                    onClick={() => setActiveMainTab('individual')}
                                    className={`${activeMainTab === 'individual'
                                        ? 'border-teal-500 text-teal-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                >
                                    Thi Lẻ
                                </button>
                                <button
                                    onClick={() => setActiveMainTab('combined')}
                                    className={`${activeMainTab === 'combined'
                                        ? 'border-teal-500 text-teal-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                >
                                    Thi Tổ hợp
                                </button>
                            </nav>
                        </div>

                        {activeMainTab === 'individual' && (
                            <>
                                <h2 className="text-3xl font-bold text-gray-800 mb-4">Exams Library</h2>

                                {/* Filter Buttons */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-5 py-2 text-sm font-medium rounded-full transition-colors duration-300 ${selectedCategory === cat
                                                ? 'bg-teal-500 text-white'
                                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>


                                {/* New Filters */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <select
                                        value={selectedRatingFilter}
                                        onChange={(e) => setSelectedRatingFilter(e.target.value)}
                                        className="px-5 py-2 text-sm font-medium rounded-full border border-gray-300 bg-white text-gray-700 focus:ring-teal-500 focus:border-teal-500"
                                    >
                                        <option value="">All Ratings</option>
                                        <option value="4">4 Stars & Up</option>
                                        <option value="3">3 Stars & Up</option>
                                    </select>
                                    <select
                                        value={selectedAttemptsFilter}
                                        onChange={(e) => setSelectedAttemptsFilter(e.target.value)}
                                        className="px-5 py-2 text-sm font-medium rounded-full border border-gray-300 bg-white text-gray-700 focus:ring-teal-500 focus:border-teal-500"
                                    >
                                        <option value="">All Attempts</option>
                                        <option value="100">100+ Attempts</option>
                                        <option value="500">500+ Attempts</option>
                                    </select>
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
                            </>
                        )}

                        {activeMainTab === 'combined' && (
                            <>
                                <h2 className="text-3xl font-bold text-gray-800 mb-4">Combined Tests</h2>
                                <div className="border-b border-gray-200 mb-6">
                                    <nav className="-mb-px flex space-x-8" aria-label="SubTabs">
                                        <button
                                            onClick={() => setActiveSubTab('selfSelected')}
                                            className={`${activeSubTab === 'selfSelected'
                                                ? 'border-teal-500 text-teal-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                        >
                                            Tự Chọn
                                        </button>
                                        <button
                                            onClick={() => setActiveSubTab('platformSelected')}
                                            className={`${activeSubTab === 'platformSelected'
                                                ? 'border-teal-500 text-teal-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                        >
                                            Nền Tảng Chọn
                                        </button>
                                    </nav>
                                </div>

                                {activeSubTab === 'selfSelected' && (
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-semibold text-gray-700">Tự Chọn (Self-Selected)</h3>
                                        <div className="mb-4">
                                            <h4 className="text-lg font-semibold mb-2">Chọn tổ hợp môn (Select subject combination)</h4>
                                            <select
                                                value={selectedBlock}
                                                onChange={(e) => {
                                                    setSelectedBlock(e.target.value);
                                                    setSelectedSubjectsForCombined([]);
                                                    setSelectedExamsForCombined([]);
                                                }}
                                                className="px-5 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 focus:ring-teal-500 focus:border-teal-500"
                                            >
                                                <option value="">Chọn một tổ hợp (Select a combination)</option>
                                                {Object.keys(subjectBlocks).map((block) => (
                                                    <option key={block} value={block}>{block}</option>
                                                ))}
                                            </select>
                                            {/* Search Bar */}
                                            <div className="relative my-4">
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
                                        {selectedBlock && (
                                            <div className="flex flex-wrap gap-2">
                                                {subjectBlocks[selectedBlock].map((cat) => (
                                                    <label key={cat} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedSubjectsForCombined.includes(cat)}
                                                            onChange={() => handleSubjectToggle(cat)}
                                                            className="form-checkbox h-4 w-4 text-teal-600 transition duration-150 ease-in-out"
                                                        />
                                                        <span>{cat}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        {selectedSubjectsForCombined.length > 0 && (
                                            <div className="space-y-4">
                                                {selectedSubjectsForCombined.map(subject => (
                                                    <div key={subject} className="border border-gray-300 p-4 rounded-lg">
                                                        <h4 className="text-xl font-semibold mb-3">{subject} Exams</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {exams.filter(exam => exam.subject === subject).map(exam => (
                                                                <div
                                                                    key={exam.id}
                                                                    className={`border p-3 rounded-lg cursor-pointer ${selectedExamsForCombined.some(e => e.id === exam.id) ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-200'}`}
                                                                    onClick={() => handleExamSelectionForCombined(subject, exam)}
                                                                >
                                                                    <p className="font-semibold">{exam.title}</p>
                                                                    <p className="text-sm text-gray-600">Teacher: {exam.teacherName}</p>
                                                                    <p className="text-sm text-gray-600">Rating: {exam.rating}</p>
                                                                    <p className="text-sm text-gray-600">Cost: {exam.tokenCost} Tokens</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-lg flex justify-between items-center">
                                            <p className="text-lg font-bold text-teal-800">Total Token Cost: {totalCombinedTokenCost} Tokens</p>
                                            <button
                                                onClick={() => handleStartCombinedExamClick(selectedExamsForCombined, totalCombinedTokenCost)}
                                                className="bg-teal-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-600"
                                            >
                                                Start Combined Test
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeSubTab === 'platformSelected' && (
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-semibold text-gray-700">Nền Tảng Chọn (Platform Selected)</h3>
                                        <div className="mb-4">
                                            <h4 className="text-lg font-semibold mb-2">Chọn tổ hợp môn (Select subject combination)</h4>
                                            <select
                                                value={selectedBlock}
                                                onChange={(e) => {
                                                    setSelectedBlock(e.target.value);
                                                    setSelectedSubjectsForPlatform([]);
                                                }}
                                                className="px-5 py-2 text-sm font-medium rounded-full border border-gray-300 bg-white text-gray-700 focus:ring-teal-500 focus:border-teal-500"
                                            >
                                                <option value="">Chọn một tổ hợp (Select a combination)</option>
                                                {Object.keys(subjectBlocks).map((block) => (
                                                    <option key={block} value={block}>{block}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {selectedBlock && (
                                            <div className="flex flex-wrap gap-2">
                                                {subjectBlocks[selectedBlock].map((cat) => (
                                                    <label key={cat} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedSubjectsForPlatform.includes(cat)}
                                                            onChange={() => handlePlatformSubjectToggle(cat)}
                                                            className="form-checkbox h-4 w-4 text-teal-600 transition duration-150 ease-in-out"
                                                        />
                                                        <span>{cat}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                        <div className="mt-6 p-4 bg-teal-50 rounded-lg flex justify-between items-center">
                                            <button
                                                onClick={() => {
                                                    const selected: Exam[] = [];
                                                    selectedSubjectsForPlatform.forEach(subject => {
                                                        const availableExams = exams.filter(exam => exam.subject === subject);
                                                        if (availableExams.length > 0) {
                                                            const randomIndex = Math.floor(Math.random() * availableExams.length);
                                                            selected.push(availableExams[randomIndex]);
                                                        }
                                                    });
                                                    const totalCost = selected.reduce((sum, exam) => sum + exam.tokenCost, 0);
                                                    handleStartCombinedExamClick(selected, totalCost);
                                                }}
                                                className="bg-teal-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-600 ml-auto"
                                            >
                                                Bắt đầu Thi Tổ hợp
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}




                    </div>
                    {activeMainTab === 'individual' && (
                        <div className='flex sm:flex-row flex-col gap-8'>
                            {/* Left Side: Exams Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-6 w-full">
                                {filteredExams.map((exam) => (
                                    <ExamCard exams={exam} key={exam.id} onStartExam={handleStartExamClick} />
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
                    )}
                </div>
            </main>

            <TokenConfirmationModal
                isOpen={showTokenConfirmation}
                exam={examToStart}
                combinedExam={combinedExamToStart}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </div>
    );
};

export default ExamTestPage;
