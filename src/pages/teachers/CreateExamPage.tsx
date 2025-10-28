import React, { useState, useContext } from "react";
import { Button, Checkbox, Input, Card, Tag } from "antd";
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
    <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card className="mb-2 cursor-move">{question.text}</Card>
    </div>
  );
};

const CreateExamPage: React.FC = () => {
  const { questionBank } = useContext(QuestionBankContext)!;
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionBankItem[]>([]);

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
          <div className="bg-white p-4 rounded-lg shadow-sm h-[600px] overflow-y-auto">
            {questionBank.map((q) => (
              <div key={q.id} className="flex items-start gap-3 p-2 border-b">
                <Checkbox onChange={(e) => handleSelectQuestion(q, e.target.checked)} />
                <div>
                  <p>{q.text}</p>
                  <div className="flex gap-2 mt-1">
                    <Tag color="blue">{q.subject}</Tag>
                    <Tag color="purple">{q.difficulty}</Tag>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Exam Builder</h2>
          <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col gap-3">
            <Input placeholder="Exam Title" />
            <Input type="number" placeholder="Duration (in minutes)" />
            <div className="border p-2 rounded-md min-h-[450px]">
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
