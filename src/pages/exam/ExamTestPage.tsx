import React, { useState, useEffect, useMemo, useRef } from 'react';
import ExamCard from '~/components/exam/ExamCard';
import TokenConfirmationModal from '~/components/common/TokenConfirmationModal';
import { FiSearch, FiLoader } from 'react-icons/fi';
import Section from '~/components/exam/Section';
import { useBrowseExamTemplates } from '~/hooks/useExamBrowser';
import { useSubjects } from '~/hooks/useSubjects';
import { useTeachersList } from '~/hooks/useTeachersList';
import { useExamAttempt } from '~/hooks/useExamAttempt';
// import { useAuth } from '~/hooks/useAuth';
import type { Exam, ExamTemplate } from '~/types/test';
import { useNavigate } from 'react-router-dom';

// Subjects will be fetched from API

const ExamTestPage: React.FC = () => {
    const { templates, loading: examsLoading, error: examsError, applyFilters } = useBrowseExamTemplates();
    const { subjects, loading: subjectsLoading } = useSubjects();
    const { teachers, loading: teachersLoading } = useTeachersList({ pageNo: 0, pageSize: 100 });
    const { startSingleAttempt, startComboAttempt, startComboRandomAttempt } = useExamAttempt();
    // const { isAuthenticated } = useAuth();
    const navigation = useNavigate();
    // Create a lookup map from teacher email to teacher info
    const teacherLookup = useMemo(() => {
        const map = new Map<string, { name: string; imgUrl?: string }>();
        teachers.forEach(teacher => {
            const fullName = `${teacher.firstName} ${teacher.lastName}`.trim();
            map.set(teacher.email, { name: fullName, imgUrl: teacher.imgUrl });
        });
        return map;
    }, [teachers]);

    // Convert ExamTemplate to Exam format for compatibility
    const convertExamTemplateToExam = (template: ExamTemplate): Exam => {
        // Calculate MCQ and FRQ counts from rules
        const mcqCount = template.rules?.reduce((sum: number, rule) =>
            rule.questionType === 'mcq' ? sum + rule.numberOfQuestions : sum, 0) || 0;
        const frqCount = template.rules?.reduce((sum: number, rule) =>
            rule.questionType === 'frq' ? sum + rule.numberOfQuestions : sum, 0) || 0;

        // Get teacher info from lookup (createdBy is email)
        const teacherInfo = teacherLookup.get(template.createdBy);

        return {
            id: template.id,
            title: template.title,
            description: template.description,
            duration: template.duration,
            examTypeId: '1', // Default value
            subjectId: template.subject.id,
            teacherId: template.createdBy, // Use createdBy as teacherId
            totalQuestions: template.rules?.reduce((sum: number, rule) => sum + rule.numberOfQuestions, 0) || 0,
            maxAttempts: 3, // Default value
            status: template.isActive ? 'Published' : 'Draft',
            createdAt: template.createdAt || new Date().toISOString(),
            updatedAt: template.createdAt || new Date().toISOString(),
            tokenCost: template.tokenCost || 0, // Default value
            // questions: [],
            teacherName: teacherInfo?.name || template.createdBy, // Use full name if available
            teacherAvatarUrl: teacherInfo?.imgUrl, // Teacher's avatar from lookup
            rating: template.averageRating,
            subject: template.subject.name,
            attempts: template.totalTakers,
            // parts: 1, // Default value
            category: template.subject.name,
            mcqCount,
            frqCount
        };
    };

    // Use useMemo to recalculate exams when templates or teacherLookup change
    const exams = useMemo(() =>
        templates.map(convertExamTemplateToExam),
        [templates, teacherLookup]);

    const [selectedCategory, setSelectedCategory] = useState("All");
    const [activeMainTab, setActiveMainTab] = useState<'individual' | 'combined'>('individual');
    const [activeSubTab, setActiveSubTab] = useState<'selfSelected' | 'platformSelected'>('selfSelected');
    const [selectedRatingFilter, setSelectedRatingFilter] = useState<string>('');
    const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
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
    const [isStartingCombinedTest, setIsStartingCombinedTest] = useState(false);
    const [isStartingPlatformTest, setIsStartingPlatformTest] = useState(false);
    const [isStartingSingleTest, setIsStartingSingleTest] = useState(false);
    const [loadingExamId, setLoadingExamId] = useState<string | null>(null);

    const handlePlatformSubjectToggle = (subject: string) => {
        setSelectedSubjectsForPlatform(prev =>
            prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
        );
    };


    // Removed selectedBlock - now selecting subjects directly

    const [showTokenConfirmation, setShowTokenConfirmation] = useState(false);
    const [pendingAction, setPendingAction] = useState<{
        type: 'single' | 'combined' | 'platform';
        exam?: Exam;
        exams?: Exam[];
        subjects?: string[];
    } | null>(null);

    // Create stable filter object (for API)
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

    // Client-side filtering by title only
    const filteredExams = useMemo(() => {
        if (!searchQuery.trim()) {
            return exams;
        }
        const query = searchQuery.trim().toLowerCase();
        return exams.filter(exam =>
            exam.title.toLowerCase().includes(query)
        );
    }, [exams, searchQuery]);

    // Apply filters when they change
    const prevFiltersRef = useRef(currentFilters);
    useEffect(() => {
        // Only apply filters if they actually changed
        if (JSON.stringify(prevFiltersRef.current) !== JSON.stringify(currentFilters)) {
            applyFilters(currentFilters);
            prevFiltersRef.current = currentFilters;
        }
    }, [currentFilters, applyFilters]);

    const handleStartExamClick = async (exam: Exam) => {
        // Show confirmation modal first
        setPendingAction({ type: 'single', exam });
        setShowTokenConfirmation(true);
    };

    const handleStartCombinedExamClick = async (exams: Exam[]) => {
        // Show confirmation modal first
        setPendingAction({ type: 'combined', exams });
        setShowTokenConfirmation(true);
    };

    const handleStartPlatformCombinedExamClick = async (selectedSubjects: string[]) => {
        // Show confirmation modal first
        setPendingAction({ type: 'platform', subjects: selectedSubjects });
        setShowTokenConfirmation(true);
    };



    const handleConfirm = async () => {
        setShowTokenConfirmation(false);

        if (!pendingAction) return;

        // Execute the pending action based on type
        if (pendingAction.type === 'single' && pendingAction.exam) {
            const exam = pendingAction.exam;
            setIsStartingSingleTest(true);
            setLoadingExamId(exam.id);

            try {
                // Check if there's an existing active attempt for this exam
                const existingAttemptKey = `exam_attempt_${exam.id}`;
                const existingAttemptStr = localStorage.getItem(existingAttemptKey);
                let attempt = null;

                if (existingAttemptStr) {
                    const existingAttempt = JSON.parse(existingAttemptStr);
                    // Check if the attempt still has time remaining
                    const savedProgress = localStorage.getItem('examProgress');
                    if (savedProgress) {
                        const progress = JSON.parse(savedProgress);
                        if (progress.remainingTime > 0 && progress.examId === exam.id) {
                            // Continue existing attempt
                            localStorage.setItem('activeExamAttempt', JSON.stringify(existingAttempt));
                            window.location.href = `/do-test/${exam.id}/full`;
                            setPendingAction(null);
                            return;
                        }
                    }
                }

                // Create new attempt for individual exam
                attempt = await startSingleAttempt({ templateId: exam.id });
                if (attempt) {
                    // Store attempt data for continuation
                    localStorage.setItem('activeExamAttempt', JSON.stringify(attempt));
                    localStorage.setItem(existingAttemptKey, JSON.stringify(attempt));
                    window.location.href = `/do-test/${exam.id}/full`;
                }
            } catch (error) {
                console.error('Failed to start single test:', error);
            } finally {
                setIsStartingSingleTest(false);
                setLoadingExamId(null);
            }
        } else if (pendingAction.type === 'combined' && pendingAction.exams) {
            setIsStartingCombinedTest(true);

            // Extract templateIds from selected exams
            const templateIds = pendingAction.exams.map(exam => exam.id);

            try {
                // Start the combined attempt
                const attempt = await startComboAttempt({ templateIds });

                if (attempt) {
                    // Store attempt data in localStorage for DoTestPage to use
                    localStorage.setItem('activeExamAttempt', JSON.stringify(attempt));
                    // Navigate to the combined test page
                    navigation(`/do-test/combo/${attempt.examAttemptId}`);
                }
            } catch (error) {
                console.error('Failed to start combined test:', error);
                // Handle error - could show toast notification
            } finally {
                setIsStartingCombinedTest(false);
            }
        } else if (pendingAction.type === 'platform' && pendingAction.subjects) {
            setIsStartingPlatformTest(true);

            // Extract subjectIds from selected subjects
            const subjectIds = subjects
                .filter(subject => pendingAction.subjects!.includes(subject.name))
                .map(subject => subject.id);

            try {
                // Start the platform-selected combined attempt
                const attempt = await startComboRandomAttempt({ subjectIds });

                if (attempt) {
                    // Store attempt data in localStorage for DoTestPage to use
                    localStorage.setItem('activeExamAttempt', JSON.stringify(attempt));
                    // Navigate to the combined test page
                    navigation(`/do-test/combo/${attempt.examAttemptId}`);
                }
            } catch (error) {
                console.error('Failed to start platform combined test:', error);
                // Handle error - could show toast notification
            } finally {
                setIsStartingPlatformTest(false);
            }
        }

        setPendingAction(null);
    };

    const handleCancel = () => {
        setShowTokenConfirmation(false);
        setPendingAction(null);
    };

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
                                    Individual Exam
                                </button>
                                <button
                                    onClick={() => setActiveMainTab('combined')}
                                    className={`${activeMainTab === 'combined'
                                        ? 'border-teal-500 text-teal-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                >
                                    Combined Exam
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
                                                onClick={() => setSelectedCategory(subject.id)}
                                                className={`px-5 py-2 text-sm font-medium rounded-full transition-colors duration-300 ${selectedCategory === subject.id
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
                                        disabled={teachersLoading}
                                    >
                                        <option value="">{teachersLoading ? 'Loading teachers...' : 'All Teachers'}</option>
                                        {teachers.map((teacher) => (
                                            <option key={teacher.id} value={teacher.id}>
                                                {teacher.firstName} {teacher.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {/* Search Bar */}
                                <div className="relative mb-8">
                                    <input
                                        type="text"
                                        placeholder="Enter exam title to search"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                                    />
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            ✕
                                        </button>
                                    )}
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
                                            Self Selected
                                        </button>
                                        <button
                                            onClick={() => setActiveSubTab('platformSelected')}
                                            className={`${activeSubTab === 'platformSelected'
                                                ? 'border-teal-500 text-teal-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                        >
                                            Platform Selected
                                        </button>
                                    </nav>
                                </div>

                                {activeSubTab === 'selfSelected' && (
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-semibold text-gray-700">Self Selected</h3>
                                        <div className="mb-4">
                                            <h4 className="text-lg font-semibold mb-2">Select subjects</h4>
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
                                                disabled={isStartingCombinedTest}
                                                className="bg-teal-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {isStartingCombinedTest ? (
                                                    <>
                                                        <FiLoader className="animate-spin" size={16} />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    'Start Combined Test'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeSubTab === 'platformSelected' && (
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-semibold text-gray-700">Platform Selected</h3>
                                        <div className="mb-4">
                                            <h4 className="text-lg font-semibold mb-2">Select subjects</h4>
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
                                                disabled={isStartingPlatformTest}
                                                className="bg-teal-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-600 ml-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {isStartingPlatformTest ? (
                                                    <>
                                                        <FiLoader className="animate-spin" size={16} />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    'Start Platform Combined Exam'
                                                )}
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
                                ) : filteredExams.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-5xl mb-4">🔍</div>
                                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No exams found</h3>
                                        <p className="text-gray-500">
                                            {searchQuery ? `No exams matching "${searchQuery}"` : 'No exams available'}
                                        </p>
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="mt-4 text-teal-600 hover:text-teal-700 font-medium"
                                            >
                                                Clear search
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredExams.map((exam: Exam) => (
                                            <ExamCard
                                                exams={exam}
                                                key={exam.id}
                                                onStartExam={handleStartExamClick}
                                                isLoading={isStartingSingleTest}
                                                loadingExamId={loadingExamId ?? undefined}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    )}
                </div>
            </main>


            <TokenConfirmationModal
                isOpen={showTokenConfirmation}
                exam={pendingAction?.type === 'single' ? (pendingAction.exam ?? null) : null}
                combinedExam={
                    pendingAction?.type === 'combined' && pendingAction.exams
                        ? { exams: pendingAction.exams, totalCost: pendingAction.exams.reduce((sum, e) => sum + e.tokenCost, 0) }
                        : pendingAction?.type === 'platform' && pendingAction.subjects
                            ? { exams: [], totalCost: 0 } // For platform combined, we don't know exact cost until generated
                            : null
                }
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </div>
    );
};

export default ExamTestPage;
