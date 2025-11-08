import React, { useState, useEffect, useMemo, useRef } from 'react';
import ExamCard from '~/components/exam/ExamCard';
import StatCard from '~/components/exam/StatCard';
import TokenConfirmationModal from '~/components/common/TokenConfirmationModal';
import { FiSearch, FiAward, FiUsers, FiClipboard, FiFileText, FiLoader } from 'react-icons/fi';
import Section from '~/components/exam/Section';
import { useBrowseExamTemplates } from '~/hooks/useExamBrowser';
import { useSubjects } from '~/hooks/useSubjects';
import { useExamAttempt } from '~/hooks/useExamAttempt';
import { useAuth } from '~/hooks/useAuth';
import type { Exam, ExamTemplate } from '~/types/test';
import { useNavigate } from 'react-router-dom';

// Subjects will be fetched from API

const ExamTestPage: React.FC = () => {
    const { templates, loading: examsLoading, error: examsError, applyFilters } = useBrowseExamTemplates();
    const { subjects, loading: subjectsLoading } = useSubjects();
    const { startComboAttempt, startComboRandomAttempt } = useExamAttempt();
    const { isAuthenticated } = useAuth();
    const navigation = useNavigate();
    // Convert ExamTemplate to Exam format for compatibility
    const convertExamTemplateToExam = (template: ExamTemplate): Exam => ({
        id: template.id,
        title: template.title,
        description: template.description,
        duration: template.duration,
        examTypeId: '1', // Default value
        subjectId: template.subject.id,
        teacherId: template.createdBy, // Use createdBy as teacherId
        totalQuestions: template.rules?.reduce((sum: number, rule) => sum + rule.numberOfQuestions, 0) || 0,
        maxAttempts: 3, // Default value
        status: template.isActive ? 'published' : 'draft',
        createdAt: template.createdAt || new Date().toISOString(),
        updatedAt: template.createdAt || new Date().toISOString(),
        tokenCost: 10, // Default value
        questions: [],
        teacherName: template.createdBy,
        rating: template.averageRating,
        subject: template.subject.name,
        attempts: template.totalTakers,
        parts: 1, // Default value
        category: template.subject.name
    });

    const exams = templates.map(convertExamTemplateToExam);

    const [selectedCategory, setSelectedCategory] = useState("All");
    const [activeMainTab, setActiveMainTab] = useState<'individual' | 'combined'>('individual');
    const [activeSubTab, setActiveSubTab] = useState<'selfSelected' | 'platformSelected'>('selfSelected');
    const [selectedRatingFilter, setSelectedRatingFilter] = useState<string>('');
    const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>('');
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


// Removed selectedBlock - now selecting subjects directly

    const [showTokenConfirmation, setShowTokenConfirmation] = useState(false);

    // Create stable filter object
    const currentFilters = useMemo(() => {
        const filters: { subject?: string; minRating?: number; teacherId?: string } = {};
        if (selectedCategory !== "All") {
            filters.subject = selectedCategory;
        }
        if (selectedRatingFilter) {
            filters.minRating = parseFloat(selectedRatingFilter);
        }
        if (selectedTeacherFilter) {
            filters.teacherId = selectedTeacherFilter;
        }
        return filters;
    }, [selectedCategory, selectedRatingFilter, selectedTeacherFilter]);

    // Apply filters when they change
    const prevFiltersRef = useRef(currentFilters);
    useEffect(() => {
        // Only apply filters if they actually changed
        if (JSON.stringify(prevFiltersRef.current) !== JSON.stringify(currentFilters)) {
            applyFilters(currentFilters);
            prevFiltersRef.current = currentFilters;
        }
    }, [currentFilters, applyFilters]);

    const handleStartExamClick = (exam: Exam) => {
        // Comment out token confirmation - directly navigate to test
        // setExamToStart(exam);
        // setCombinedExamToStart(null); // Clear combined exam state
        // setShowTokenConfirmation(true);
        window.location.href = `/do-test/${exam.id}/full`;
    };

    const handleStartCombinedExamClick = async (exams: Exam[]) => {
        // Extract templateIds from selected exams
        const templateIds = exams.map(exam => exam.id);

        try {
            // Start the combined attempt
            const attempt = await startComboAttempt({ templateIds });

            if (attempt) {
                // Store attempt data in localStorage for DoTestPage to use
                localStorage.setItem('activeExamAttempt', JSON.stringify(attempt));
                // Navigate to the combined test page
                navigation( `/do-test/combo/${attempt.examAttemptId}`);
            }
        } catch (error) {
            console.error('Failed to start combined test:', error);
            // Handle error - could show toast notification
        }
    };

    const handleStartPlatformCombinedExamClick = async (selectedSubjects: string[]) => {
        // Extract subjectIds from selected subjects
        const subjectIds = subjects
            .filter(subject => selectedSubjects.includes(subject.name))
            .map(subject => subject.id);

        try {
            // Start the platform-selected combined attempt
            const attempt = await startComboRandomAttempt({ subjectIds });

            if (attempt) {
                // Store attempt data in localStorage for DoTestPage to use
                localStorage.setItem('activeExamAttempt', JSON.stringify(attempt));
                // Navigate to the combined test page
                navigation( `/do-test/combo/${attempt.examAttemptId}`);
            }
        } catch (error) {
            console.error('Failed to start platform combined test:', error);
            // Handle error - could show toast notification
        }
    };



    const handleConfirm = () => {
        setShowTokenConfirmation(false);
    };

    const handleCancel = () => setShowTokenConfirmation(false);

    if (!isAuthenticated) {
        return (
            <div className="bg-slate-50">
                {/* Page Title Section */}
                <Section />

                {/* Login Required Message */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center py-20">
                        <div className="text-6xl mb-6">🔒</div>
                        <h3 className="text-3xl font-bold text-gray-800 mb-4">
                            Vui lòng đăng nhập để xem
                        </h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Bạn cần đăng nhập để truy cập vào các bài thi và tính năng của hệ thống.
                        </p>
                        <button
                            onClick={() => window.location.href = '/auth'}
                            className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            Đăng nhập
                        </button>
                    </div>
                </main>
            </div>
        );
    }

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

                                {/* Subject Filter Buttons */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <button
                                        onClick={() => setSelectedCategory("All")}
                                        className={`px-5 py-2 text-sm font-medium rounded-full transition-colors duration-300 ${selectedCategory === "All"
                                            ? 'bg-teal-500 text-white'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                                            }`}
                                    >
                                        All
                                    </button>
                                    {subjectsLoading ? (
                                        <div className="flex justify-center items-center py-4">
                                            <FiLoader className="animate-spin text-teal-500" size={20} />
                                            <span className="ml-2 text-gray-600">Loading subjects...</span>
                                        </div>
                                    ) : (
                                        subjects.map((subject) => (
                                            <button
                                                key={subject.id}
                                                onClick={() => setSelectedCategory(subject.name)}
                                                className={`px-5 py-2 text-sm font-medium rounded-full transition-colors duration-300 ${selectedCategory === subject.name
                                                    ? 'bg-teal-500 text-white'
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {subject.name}
                                            </button>
                                        ))
                                    )}
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
                                        value={selectedTeacherFilter}
                                        onChange={(e) => setSelectedTeacherFilter(e.target.value)}
                                        className="px-5 py-2 text-sm font-medium rounded-full border border-gray-300 bg-white text-gray-700 focus:ring-teal-500 focus:border-teal-500"
                                    >
                                        <option value="">All Teachers</option>
                                        <option value="John Smith">John Smith</option>
                                        <option value="Jane Smith">Jane Smith</option>
                                        <option value="Bob Johnson">Bob Johnson</option>
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
                                            <h4 className="text-lg font-semibold mb-2">Chọn môn học (Select subjects)</h4>
                                            {subjectsLoading ? (
                                                <div className="flex justify-center items-center py-4">
                                                    <FiLoader className="animate-spin text-teal-500" size={20} />
                                                    <span className="ml-2 text-gray-600">Loading subjects...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {subjects.map((subject) => (
                                                        <label key={subject.id} className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedSubjectsForCombined.includes(subject.name)}
                                                                onChange={() => handleSubjectToggle(subject.name)}
                                                                className="form-checkbox h-4 w-4 text-teal-600 transition duration-150 ease-in-out"
                                                            />
                                                            <span>{subject.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
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
                                                onClick={() => handleStartCombinedExamClick(selectedExamsForCombined)}
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
                                            <h4 className="text-lg font-semibold mb-2">Chọn môn học (Select subjects)</h4>
                                            {subjectsLoading ? (
                                                <div className="flex justify-center items-center py-4">
                                                    <FiLoader className="animate-spin text-teal-500" size={20} />
                                                    <span className="ml-2 text-gray-600">Loading subjects...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {subjects.map((subject) => (
                                                        <label key={subject.id} className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedSubjectsForPlatform.includes(subject.name)}
                                                                onChange={() => handlePlatformSubjectToggle(subject.name)}
                                                                className="form-checkbox h-4 w-4 text-teal-600 transition duration-150 ease-in-out"
                                                            />
                                                            <span>{subject.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-6 p-4 bg-teal-50 rounded-lg flex justify-between items-center">
                                            <button
                                                onClick={() => handleStartPlatformCombinedExamClick(selectedSubjectsForPlatform)}
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
                            <div className="w-full">
                                {examsLoading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <FiLoader className="animate-spin text-teal-500" size={32} />
                                        <span className="ml-2 text-gray-600">Loading exams...</span>
                                    </div>
                                ) : examsError ? (
                                    <div className="text-center py-12">
                                        <p className="text-red-500 mb-4">{examsError}</p>
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {exams.map((exam: Exam) => (
                                            <ExamCard exams={exam} key={exam.id} onStartExam={handleStartExamClick} />
                                        ))}
                                    </div>
                                )}
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
                exam={null}
                combinedExam={null}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </div>
    );
};

export default ExamTestPage;
