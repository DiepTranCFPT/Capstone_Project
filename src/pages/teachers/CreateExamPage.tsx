import React, { useState, useContext, useMemo } from "react";
import { Button, Checkbox, Input, Card, Tag, Select, Pagination } from "antd";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import type { QuestionBankItem } from "~/types/question";
import { QuestionBankContext } from "~/context/QuestionBankContext";

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
  const { questionBank } = useContext(QuestionBankContext)!;
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionBankItem[]>([]);

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

  
  

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Create New Exam</h1>
        <div className="flex gap-3">
          
          <Button type="primary" size="large">
            Save Exam
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Question Bank</h2>

          {/* Filter Controls */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex flex-wrap gap-4">
            <Select value={selectedSubjectFilter} onChange={setSelectedSubjectFilter} style={{ width: 120 }}>
              <Select.Option value="all">All Subjects</Select.Option>
              <Select.Option value="Biology">Biology</Select.Option>
              <Select.Option value="Mathematics">Mathematics</Select.Option>
              <Select.Option value="Physics">Physics</Select.Option>
              <Select.Option value="History">History</Select.Option>
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
              {paginatedQuestions.map((q) => (
                <div key={q.id} className="flex items-start gap-3 p-2 border-b border-gray-200">
                  <Checkbox onChange={(e) => handleSelectQuestion(q, e.target.checked)} />
                  <div>
                    <p>{q.text}</p>
                    <div className="flex gap-2 mt-1">
                      <Tag color="blue">{q.subject}</Tag>
                      <Tag color="purple">{q.difficulty}</Tag>
                      <Tag color={q.type === 'mcq' ? 'cyan' : 'green'}>{q.type.toUpperCase()}</Tag>
                    </div>
                  </div>
                </div>
              ))}
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

        <div>
          <h2 className="text-xl font-semibold mb-4">Exam Builder</h2>
          <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col gap-3">
            <Input placeholder="Exam Title" />
            <Input type="number" placeholder="Duration (in minutes)" />
            <div className="border border-gray-400 p-2 rounded-md min-h-[450px]">
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
          </div>
        </div>
      </div>
    
    </DndProvider>
  );
};

export default CreateExamPage;
