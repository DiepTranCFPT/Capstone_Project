import React, { useState, useEffect } from "react";
import { Modal, Input, Select, Radio, Button, Space } from "antd";
import type { NewQuestion, QuestionBankItem } from "~/types/question";

const { TextArea } = Input;
const { Option } = Select;

interface AddQuestionModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (data: NewQuestion) => void;
  editingQuestion?: QuestionBankItem | null;
}

const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  open,
  onCancel,
  onSubmit,
  editingQuestion,
}) => {
  const [formData, setFormData] = useState<NewQuestion>({
    text: "",
    subject: "",
    difficulty: "medium",
    type: "mcq",
    choices: ["", "", "", ""],
    correctIndex: 0,
    tags: [],
  });

  useEffect(() => {
    if (editingQuestion) {
      const choices = editingQuestion.type === "mcq" ? editingQuestion.options?.map(opt => opt.text) || ["", "", "", ""] : [];
      const correctIndex = editingQuestion.type === "mcq" ? editingQuestion.options?.findIndex(opt => opt.isCorrect) || 0 : 0;
      setFormData({
        text: editingQuestion.text,
        subject: editingQuestion.subject,
        difficulty: editingQuestion.difficulty,
        type: editingQuestion.type,
        choices: choices.length ? choices : ["", "", "", ""],
        correctIndex: correctIndex,
        expectedAnswer: editingQuestion.expectedAnswer,
        tags: editingQuestion.tags || [],
      });
    } else {
      setFormData({
        text: "",
        subject: "",
        difficulty: "medium",
        type: "mcq",
        choices: ["", "", "", ""],
        correctIndex: 0,
        tags: [],
      });
    }
  }, [editingQuestion]);

  const handleChange = <K extends keyof NewQuestion>(
    key: K,
    value: NewQuestion[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...(formData.choices ?? [])];
    newChoices[index] = value;
    setFormData((prev) => ({ ...prev, choices: newChoices }));
  };

  const addChoice = () => {
    setFormData((prev) => ({
      ...prev,
      choices: [...(prev.choices ?? []), ""],
    }));
  };

  const handleSubmit = () => {
    if (!formData.text.trim()) return;
    onSubmit(formData);
    // Reset form
    setFormData({
      text: "",
      subject: "",
      difficulty: "medium",
      type: "mcq",
      choices: ["", "", "", ""],
      correctIndex: 0,
      tags: [],
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={editingQuestion ? "Edit Question" : "Add New Question"}
      footer={null}
      width={700}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {/* Question Text */}
        <div>
          <label className="font-medium">Question Text</label>
          <TextArea
            rows={3}
            placeholder="Enter question text"
            value={formData.text}
            onChange={(e) => handleChange("text", e.target.value)}
          />
        </div>

        {/* Subject */}
        <div>
          <label className="font-medium">Subject</label>
          <Input
            placeholder="e.g. Math, History"
            value={formData.subject}
            onChange={(e) => handleChange("subject", e.target.value)}
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="font-medium">Difficulty</label>
          <Select
            value={formData.difficulty}
            onChange={(v) => handleChange("difficulty", v)}
            style={{ width: "100%" }}
          >
            <Option value="easy">Easy</Option>
            <Option value="medium">Medium</Option>
            <Option value="hard">Hard</Option>
          </Select>
        </div>

        {/* Tags */}
        <div>
          <label className="font-medium">Tags</label>
          <Select
            mode="tags"
            placeholder="Add tags (optional)"
            value={formData.tags}
            onChange={(v) => handleChange("tags", v)}
            style={{ width: "100%" }}
          />
        </div>

        {/* Question Type */}
        <div>
          <label className="font-medium">Question Type</label>
          <Radio.Group
            value={formData.type}
            onChange={(e) => handleChange("type", e.target.value)}
          >
            <Radio value="mcq">Multiple Choice</Radio>
            <Radio value="frq">Essay</Radio>
          </Radio.Group>
        </div>

        {/* Choices (for MCQ) */}
        {formData.type === "mcq" ? (
          <div className="space-y-2">
            <p className="font-medium">Choices</p>
            {(formData.choices ?? []).map((choice, index) => (
              <div key={index} className="flex items-center gap-2">
                <Radio
                  checked={formData.correctIndex === index}
                  onChange={() => handleChange("correctIndex", index)}
                />
                <Input
                  placeholder={`Choice ${index + 1}`}
                  value={choice}
                  onChange={(e) => handleChoiceChange(index, e.target.value)}
                />
              </div>
            ))}
            <Button type="dashed" block onClick={addChoice}>
              + Add Choice
            </Button>
          </div>
        ) : (
          // Expected Answer for essay
          <div>
            <label className="font-medium">Expected Answer</label>
            <TextArea
              rows={3}
              placeholder="Write expected answer here..."
              value={formData.expectedAnswer}
              onChange={(e) => handleChange("expectedAnswer", e.target.value)}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end mt-5">
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              style={{ backgroundColor: "#3CBCB2", border: "none" }}
            >
              Save Question
            </Button>
          </Space>
        </div>
      </Space>
    </Modal>
  );
};

export default AddQuestionModal;
