import React, { useState, useMemo } from "react";
import { Button, Checkbox, Input, Card, Tag, Select, Pagination, Switch } from "antd";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import type { QuestionBankItem } from "~/types/question";
import type { CreateExamPayload } from "~/types/test";
import { useQuestionBank } from "~/hooks/useQuestionBank";
import { useAuth } from "~/hooks/useAuth";
import { useExams } from "~/hooks/useExams";
import { useSubjects } from "~/hooks/useSubjects";

const ItemType = "QUESTION";

interface DraggableQuestionProps {
  question: QuestionBankItem;
  index: number;
  moveQuestion: (dragIndex: number, hoverIndex: number) => void;
}

const DraggableQuestion: React.FC<DraggableQuestionProps> = ({
  question,
  index,
  moveQuestion,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [, drop] = useDrop<{ index: number }>({
    accept: ItemType,
    hover(item) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveQuestion(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1, marginBottom: '6px' }}>
      <Card className="cursor-move">{question.text}</Card>
    </div>
  );
};

const CreateExamPage: React.FC = () => {
  const { user } = useAuth();
  const { questions: questionBank, loading } = useQuestionBank(user?.id);
  const { createNewExam, loading: savingExam } = useExams();
  const { subjects } = useSubjects();
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionBankItem[]>([]);

  // Exam form states
  const [examTitle, setExamTitle] = useState<string>('');
  const [examDescription, setExamDescription] = useState<string>('');
  const [examDuration, setExamDuration] = useState<number>(60);
  const [passingScore, setPassingScore] = useState<number>(70);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Error states for inline validation
  const [titleError, setTitleError] = useState<string>('');
  const [durationError, setDurationError] = useState<string>('');
  const [passingScoreError, setPassingScoreError] = useState<string>('');
  const [subjectsError, setSubjectsError] = useState<string>('');
  const [questionsError, setQuestionsError] = useState<string>('');

  // Filter states
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10); // 10 questions per page

  const filteredQuestions = useMemo(() => {
    return questionBank.filter(q => {
      if (selectedSubjectFilter !== 'all' && q.subject !== selectedSubjectFilter) return false;
      if (selectedDifficultyFilter !== 'all' && q.difficulty !== selectedDifficultyFilter) return false;
      if (selectedTypeFilter !== 'all' && q.type !== selectedTypeFilter) return false;
      return true;
    });
  }, [questionBank, selectedSubjectFilter, selectedDifficultyFilter, selectedTypeFilter]);

  const totalQuestions = filteredQuestions.length;
  const paginatedQuestions = filteredQuestions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const clearFilters = () => {
    setSelectedSubjectFilter('all');
    setSelectedDifficultyFilter('all');
    setSelectedTypeFilter('all');
    setCurrentPage(1);
  };

  const handleSelectQuestion = (question: QuestionBankItem, checked: boolean) => {
    if (checked) {
      setSelectedQuestions((prev) => [...prev, question]);
    } else {
      setSelectedQuestions((prev) => prev.filter((q) => q.id !== question.id));
    }
  };

  const moveQuestion = (dragIndex: number, hoverIndex: number) => {
    const dragged = selectedQuestions[dragIndex];
    const newSelected = [...selectedQuestions];
    newSelected.splice(dragIndex, 1);
    newSelected.splice(hoverIndex, 0, dragged);
    setSelectedQuestions(newSelected);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSaveExam = async () => {
    // Clear previous errors
    setTitleError('');
    setDurationError('');
    setPassingScoreError('');
    setSubjectsError('');
    setQuestionsError('');

    // Validation with inline errors
    let hasErrors = false;

    if (!examTitle.trim()) {
      setTitleError('Exam title is required');
      hasErrors = true;
    }
    if (examDuration <= 0) {
      setDurationError('Duration must be greater than 0');
      hasErrors = true;
    }
    if (passingScore < 0 || passingScore > 100) {
      setPassingScoreError('Passing score must be between 0 and 100');
      hasErrors = true;
    }
    if (selectedSubjects.length === 0) {
      setSubjectsError('At least one subject must be selected');
      hasErrors = true;
    }
    if (selectedQuestions.length === 0) {
      setQuestionsError('At least one question must be selected');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    try {
      const examData: CreateExamPayload = {
        title: examTitle.trim(),
        description: examDescription.trim(),
        duration: examDuration,
        passingScore: passingScore,
        subjectNames: selectedSubjects,
        questionContents: selectedQuestions.map(q => q.id),
        createdByName: user ? `${user.firstName} ${user.lastName}`.trim() : 'Unknown Teacher',
        isActive: isActive,
      };

      await createNewExam(examData);

      // Reset form on success
      setExamTitle('');
      setExamDescription('');
      setExamDuration(60);
      setPassingScore(70);
      setSelectedSubjects([]);
      setIsActive(true);
      setSelectedQuestions([]);

      // Clear errors
      setTitleError('');
      setDurationError('');
      setPassingScoreError('');
      setSubjectsError('');
      setQuestionsError('');
    } catch (error) {
      // Error handling is done in the hook
      console.error('Save exam error:', error);
    }
  };




  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Create New Exam</h1>
        <div className="flex gap-3">

          <Button
            type="primary"
            size="large"
            loading={savingExam}
            onClick={handleSaveExam}
          >
            Save Exam
          </Button>
        </div>
      </div>

      {/* Question Bank */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Question Bank</h2>

          {/* Filter Controls */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex flex-wrap gap-4">
            <Select value={selectedSubjectFilter} onChange={setSelectedSubjectFilter} style={{ width: 120 }}>
              <Select.Option value="all">All Subjects</Select.Option>
              {subjects.map((subject) => (
                <Select.Option key={subject.id} value={subject.name}>
                  {subject.name}
                </Select.Option>
              ))}
            </Select>

            <Select value={selectedDifficultyFilter} onChange={setSelectedDifficultyFilter} style={{ width: 120 }}>
              <Select.Option value="all">All Difficulties</Select.Option>
              <Select.Option value="easy">Easy</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="hard">Hard</Select.Option>
            </Select>

            <Select value={selectedTypeFilter} onChange={setSelectedTypeFilter} style={{ width: 120 }}>
              <Select.Option value="all">All Types</Select.Option>
              <Select.Option value="mcq">MCQ</Select.Option>
              <Select.Option value="frq">FRQ</Select.Option>
            </Select>

            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="h-[400px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <p>Loading questions...</p>
                </div>
              ) : paginatedQuestions.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <p>No questions found</p>
                </div>
              ) : (
                paginatedQuestions.map((q) => (
                  <div key={q.id} className="flex items-start gap-3 p-2 border-b border-gray-200">
                    <Checkbox onChange={(e) => handleSelectQuestion(q, e.target.checked)} />
                    <div className="flex-1">
                      <p className="font-medium">{q.text}</p>
                      {q.type === 'mcq' && q.options && q.options.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          <div className="flex flex-wrap gap-1">
                            {q.options.map((option, idx) => (
                              <span key={idx} className={`px-2 py-1 rounded text-xs ${
                                option.isCorrect ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {idx + 1}. {option.text}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Tag color="blue">{q.subject}</Tag>
                        <Tag color="purple">{q.difficulty}</Tag>
                        <Tag color={q.type === 'mcq' ? 'cyan' : 'green'}>{q.type.toUpperCase()}</Tag>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Pagination
              current={currentPage}
              total={totalQuestions}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
              style={{ marginTop: '16px', textAlign: 'center' }}
            />
          </div>
        </div>

        {/* Exam Builder */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Exam Builder</h2>
          <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Title *</label>
              <Input
                placeholder="Enter exam title"
                value={examTitle}
                onChange={(e) => {
                  setExamTitle(e.target.value);
                  if (titleError) setTitleError('');
                }}
                status={titleError ? 'error' : ''}
              />
              {titleError && <div className="text-red-500 text-sm mt-1">{titleError}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Input.TextArea
                placeholder="Enter exam description"
                rows={3}
                value={examDescription}
                onChange={(e) => setExamDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
                <Input
                  type="number"
                  placeholder="60"
                  min={1}
                  value={examDuration}
                  onChange={(e) => {
                    setExamDuration(Number(e.target.value));
                    if (durationError) setDurationError('');
                  }}
                  status={durationError ? 'error' : ''}
                />
                {durationError && <div className="text-red-500 text-sm mt-1">{durationError}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%) *</label>
                <Input
                  type="number"
                  placeholder="70"
                  min={0}
                  max={100}
                  value={passingScore}
                  onChange={(e) => {
                    setPassingScore(Number(e.target.value));
                    if (passingScoreError) setPassingScoreError('');
                  }}
                  status={passingScoreError ? 'error' : ''}
                />
                {passingScoreError && <div className="text-red-500 text-sm mt-1">{passingScoreError}</div>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subjects *</label>
              <Select
                mode="multiple"
                placeholder="Select subjects"
                value={selectedSubjects}
                onChange={(value) => {
                  setSelectedSubjects(value);
                  if (subjectsError) setSubjectsError('');
                }}
                style={{ width: '100%' }}
                status={subjectsError ? 'error' : ''}
              >
                {subjects.map((subject) => (
                  <Select.Option key={subject.id} value={subject.id}>
                    {subject.name}
                  </Select.Option>
                ))}
              </Select>
              {subjectsError && <div className="text-red-500 text-sm mt-1">{subjectsError}</div>}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={isActive}
                onChange={setIsActive}
              />
              <label className="text-sm font-medium text-gray-700">Active</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Questions ({selectedQuestions.length}) *
              </label>
              <div className={`border p-2 rounded-md min-h-[300px] ${questionsError ? 'border-red-500' : 'border-gray-400'}`}>
                {selectedQuestions.map((q, i) => (
                  <DraggableQuestion
                    key={q.id}
                    index={i}
                    question={q}
                    moveQuestion={moveQuestion}
                  />
                ))}
                {selectedQuestions.length === 0 && (
                  <p className="text-gray-400 text-center p-10">
                    Select questions from the left to add them here.
                  </p>
                )}
              </div>
              {questionsError && <div className="text-red-500 text-sm mt-1">{questionsError}</div>}
            </div>
          </div>
        </div>
      </div>

    </DndProvider>
  );
};

export default CreateExamPage;
