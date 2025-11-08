import React, { useState, useEffect, useMemo } from "react";
import { Modal, Input, Select, Radio, Button, Space, message } from "antd";
import type { NewQuestion, QuestionBankItem } from "~/types/question";
import { useSubjects } from "~/hooks/useSubjects";
import { useQuestionTopics } from "~/hooks/useQuestionTopics";

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
  const { subjects, loading: subjectsLoading, fetchSubjects } = useSubjects();
  const { topics, loading: topicsLoading } = useQuestionTopics();

  const difficultyOptions = useMemo(
    () => [
      { value: "easy", label: "Easy" },
      { value: "medium", label: "Medium" },
      { value: "hard", label: "Hard" },
    ],
    []
  );

  // Form state must be declared before any memo that depends on it
  const [formData, setFormData] = useState<NewQuestion>({
    text: "",
    subject: "",
    topic: "",
    difficulty: "medium",
    type: "mcq",
    choices: ["", "", "", ""],
    correctIndex: 0,
    tags: [],
  });

  const subjectOptions = useMemo(() => {
    const options = subjects.map((subject) => ({
      value: subject.name,
      label: subject.name,
    }));
    if (
      formData.subject &&
      !options.some((option) => option.value === formData.subject)
    ) {
      options.push({ value: formData.subject, label: formData.subject });
    }
    return options;
  }, [subjects, formData.subject]);

  const topicOptions = useMemo(() => {
    const options = topics.map((topic) => ({
      value: topic.name,
      label: topic.name,
    }));
    if (formData.topic && !options.some((option) => option.value === formData.topic)) {
      options.push({ value: formData.topic, label: formData.topic });
    }
    return options;
  }, [topics, formData.topic]);

  

  useEffect(() => {
    fetchSubjects({ pageNo: 0, pageSize: 1000 });
  }, [fetchSubjects]);

  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setFormData({
        text: "",
        subject: "",
        topic: "",
        difficulty: "medium",
        type: "mcq",
        choices: ["", "", "", ""],
        correctIndex: 0,
        tags: [],
      });
      return;
    }

    if (editingQuestion) {
      const choices = editingQuestion.type === "mcq" ? editingQuestion.options?.map(opt => opt.text) || ["", "", "", ""] : [];
      const correctIndex = editingQuestion.type === "mcq" ? editingQuestion.options?.findIndex(opt => opt.isCorrect) || 0 : 0;
      setFormData({
        text: editingQuestion.text,
        subject: editingQuestion.subject,
        topic: editingQuestion.topic ?? "",
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
        topic: "",
        difficulty: "medium",
        type: "mcq",
        choices: ["", "", "", ""],
        correctIndex: 0,
        tags: [],
      });
    }
  }, [editingQuestion, open]);

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

    if (!formData.text.trim()) {
      message.warning("Vui lòng nhập nội dung câu hỏi");
      return;
    }
    
    if (!formData.subject.trim()) {
      message.warning("Vui lòng nhập môn học");
      return;
    }

    if (!(formData.topic ?? "").trim()) {
      message.warning("Vui lòng nhập chủ đề");
      return;
    }

    if (formData.type === "mcq") {
      const nonEmptyChoices = (formData.choices || []).filter((c) => c && c.trim() !== "");
      if (nonEmptyChoices.length < 2) {
        message.warning("Vui lòng nhập ít nhất 2 lựa chọn cho câu hỏi trắc nghiệm");
        return;
      }
    }

    if (formData.type === "frq" && !formData.expectedAnswer?.trim()) {
      message.warning("Vui lòng nhập đáp án mong đợi cho câu hỏi tự luận");
      return;
    }

    onSubmit(formData);
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
        <Select
          showSearch
          optionFilterProp="label"
          placeholder="Select subject"
          value={formData.subject || undefined}
          onChange={(value) =>
            handleChange("subject", (value ?? "") as NewQuestion["subject"])
          }
          options={subjectOptions}
          loading={subjectsLoading}
          allowClear
        />
        </div>

        {/* Topic */}
        <div>
          <label className="font-medium">Topic</label>
        <Select
          showSearch
          optionFilterProp="label"
          placeholder="Select topic"
          value={formData.topic || undefined}
          onChange={(value) =>
            handleChange("topic", (value ?? "") as NewQuestion["topic"])
          }
          options={topicOptions}
          loading={topicsLoading}
          allowClear
        />
        </div>

        {/* Difficulty */}
        <div>
          <label className="font-medium">Difficulty</label>
          <Select
            value={formData.difficulty}
            onChange={(v) =>
              handleChange("difficulty", v as NewQuestion["difficulty"])
            }
            style={{ width: "100%" }}
          >
            {difficultyOptions.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
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
