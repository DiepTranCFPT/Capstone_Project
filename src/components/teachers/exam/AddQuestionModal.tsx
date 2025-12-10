import React, { useState, useEffect, useMemo } from "react";
import { Modal, Input, Select, Radio, Button, Space, message, Form, Divider } from "antd";
import {
  QuestionCircleOutlined,
  BookOutlined,
  FolderOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  CloseOutlined,
} from "@ant-design/icons";
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
  const { topics, loading: topicsLoading, fetchTopicsBySubject } = useQuestionTopics();

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
      value: subject.id,
      label: subject.name,
    }));
    // If formData.subject is a name (from old data), try to find matching ID
    if (
      formData.subject &&
      !options.some((option) => option.value === formData.subject)
    ) {
      const foundSubject = subjects.find((s) => s.name === formData.subject || s.id === formData.subject);
      if (foundSubject) {
        // If found, use the ID
        return options;
      } else {
        // If not found, add as fallback (for backward compatibility)
        options.push({ value: formData.subject, label: formData.subject });
      }
    }
    return options;
  }, [subjects, formData.subject]);

  const topicOptions = useMemo(() => {
    const options = (topics || []).map((topic) => ({
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

  // Fetch topics when subject is selected
  useEffect(() => {
    if (formData.subject) {
      fetchTopicsBySubject(formData.subject);
    }
  }, [formData.subject, fetchTopicsBySubject]);

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
      // Try to find subject ID from subject name (for backward compatibility)
      const subjectId = subjects.find((s) => s.name === editingQuestion.subject)?.id || editingQuestion.subject;
      setFormData({
        text: editingQuestion.text,
        subject: subjectId,
        topic: editingQuestion.topic ?? "",
        difficulty: editingQuestion.difficulty,
        type: editingQuestion.type,
        choices: choices.length ? choices : ["", "", "", ""],
        correctIndex: correctIndex >= 0 ? correctIndex : 0,
        expectedAnswer: editingQuestion.expectedAnswer || "",
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
  }, [editingQuestion, open, subjects]);

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

  const removeChoice = (index: number) => {
    const currentChoices = formData.choices ?? [];
    // Chỉ cho phép xóa nếu có nhiều hơn 2 choices
    if (currentChoices.length <= 2) {
      message.warning("At least 2 choices are required");
      return;
    }

    const newChoices = currentChoices.filter((_, i) => i !== index);
    let newCorrectIndex = formData.correctIndex ?? 0;

    // Điều chỉnh correctIndex nếu cần
    if (formData.correctIndex !== null && formData.correctIndex !== undefined) {
      if (formData.correctIndex === index) {
        // Nếu xóa choice đang được chọn là đáp án đúng, chuyển sang choice đầu tiên
        newCorrectIndex = 0;
      } else if (formData.correctIndex > index) {
        // Nếu đáp án đúng ở sau choice bị xóa, giảm index đi 1
        newCorrectIndex = formData.correctIndex - 1;
      }
    }

    setFormData((prev) => ({
      ...prev,
      choices: newChoices,
      correctIndex: newCorrectIndex,
    }));
  };

  const handleSubmit = () => {

    if (!formData.text.trim()) {
      message.warning("Please enter question text");
      return;
    }

    if (!formData.subject.trim()) {
      message.warning("Please select a subject");
      return;
    }

    if (!(formData.topic ?? "").trim()) {
      message.warning("Please select a topic");
      return;
    }

    if (formData.type === "mcq") {
      const nonEmptyChoices = (formData.choices || []).filter((c) => c && c.trim() !== "");
      if (nonEmptyChoices.length < 2) {
        message.warning("Please enter at least 2 choices for multiple choice question");
        return;
      }
    }

    if (formData.type === "frq" && !formData.expectedAnswer?.trim()) {
      message.warning("Please enter expected answer for essay question");
      return;
    }

    onSubmit(formData);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={
        <div className="flex items-center gap-2">
          <QuestionCircleOutlined className="text-[#3CBCB2] text-xl" />
          <span className="text-xl font-semibold">
            {editingQuestion ? "Edit Question" : "Add New Question"}
          </span>
        </div>
      }
      footer={null}
      width={800}
      styles={{
        body: { padding: "24px", maxHeight: "80vh", overflowY: "auto" },
      }}
      className="question-modal"
    >
      <Form layout="vertical" className="question-form">
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Question Text */}
          <Form.Item
            label={
              <span className="flex items-center gap-2 text-base font-medium">
                <FileTextOutlined className="text-[#3CBCB2]" />
                Question Text
              </span>
            }
            required
          >
            <TextArea
              rows={4}
              placeholder="Enter question text..."
              value={formData.text}
              onChange={(e) => handleChange("text", e.target.value)}
              style={{ fontSize: "14px" }}
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            {/* Subject */}
            <Form.Item
              label={
                <span className="flex items-center gap-2 text-sm font-medium">
                  <BookOutlined className="text-[#3CBCB2]" />
                  Subject
                </span>
              }
              required
            >
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
                size="large"
                style={{ width: "100%" }}
              />
            </Form.Item>

            {/* Topic */}
            <Form.Item
              label={
                <span className="flex items-center gap-2 text-sm font-medium">
                  <FolderOutlined className="text-[#3CBCB2]" />
                  Topic
                </span>
              }
              required
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Select topic"
                value={formData.topic || undefined}
                onChange={(value) =>
                  handleChange("topic", (value ?? "") as NewQuestion["topic"])
                }
                loading={topicsLoading}
                allowClear
                size="large"
                style={{ width: "100%" }}
              >
                {topicOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Difficulty */}
            <Form.Item
              label={
                <span className="flex items-center gap-2 text-sm font-medium">
                  <ThunderboltOutlined className="text-[#3CBCB2]" />
                  Difficulty
                </span>
              }
            >
              <Select
                value={formData.difficulty}
                onChange={(v) =>
                  handleChange("difficulty", v as NewQuestion["difficulty"])
                }
                size="large"
                style={{ width: "100%" }}
              >
                {difficultyOptions.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Question Type */}
            <Form.Item
              label={
                <span className="flex items-center gap-2 text-sm font-medium">
                  <QuestionCircleOutlined className="text-[#3CBCB2]" />
                  Question Type
                </span>
              }
            >
              <Radio.Group
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className="w-full"
                size="large"
              >
                <Radio.Button value="mcq" className="flex-1 text-center">
                  Multiple Choice
                </Radio.Button>
                <Radio.Button value="frq" className="flex-1 text-center">
                  Essay
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </div>

          <Divider style={{ margin: "16px 0" }} />

          {/* Choices (for MCQ) */}
          {formData.type === "mcq" ? (
            <Form.Item
              label={
                <span className="flex items-center gap-2 text-base font-medium">
                  <CheckCircleOutlined className="text-[#3CBCB2]" />
                  Choices
                </span>
              }
              required
            >
              <div className="space-y-3">
                {(formData.choices ?? []).map((choice, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-[#3CBCB2] transition-colors"
                  >
                    <Radio
                      checked={formData.correctIndex === index}
                      onChange={() => handleChange("correctIndex", index)}
                      className="mt-1"
                    />
                    <Input
                      placeholder={`Choice ${index + 1}`}
                      value={choice}
                      onChange={(e) => handleChoiceChange(index, e.target.value)}
                      size="large"
                      className="flex-1"
                    />
                    {formData.correctIndex === index && (
                      <CheckCircleOutlined className="text-green-500 text-lg" />
                    )}
                    {(formData.choices ?? []).length > 2 && (
                      <Button
                        type="text"
                        danger
                        icon={<CloseOutlined />}
                        onClick={() => removeChoice(index)}
                        size="small"
                        className="flex-shrink-0"
                        title="Remove choice"
                      />
                    )}
                  </div>
                ))}
                <Button
                  type="dashed"
                  block
                  onClick={addChoice}
                  icon={<PlusOutlined />}
                  size="large"
                  className="mt-2"
                >
                  Add Choice
                </Button>
              </div>
            </Form.Item>
          ) : (
            // Expected Answer for essay
            <Form.Item
              label={
                <span className="flex items-center gap-2 text-base font-medium">
                  <CheckCircleOutlined className="text-[#3CBCB2]" />
                  Expected Answer
                </span>
              }
              required
            >
              <TextArea
                rows={5}
                placeholder="Enter expected answer..."
                value={formData.expectedAnswer}
                onChange={(e) => handleChange("expectedAnswer", e.target.value)}
                style={{ fontSize: "14px" }}
                showCount
                maxLength={2000}
              />
            </Form.Item>
          )}

          <Divider style={{ margin: "16px 0" }} />

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              onClick={onCancel}
              size="large"
              icon={<CloseOutlined />}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              size="large"
              icon={<CheckCircleOutlined />}
              style={{
                backgroundColor: "#3CBCB2",
                border: "none",
                boxShadow: "0 2px 8px rgba(60, 188, 178, 0.3)",
              }}
              className="px-6 hover:bg-[#35a89a]"
            >
              {editingQuestion ? "Update" : "Save Question"}
            </Button>
          </div>
        </Space>
      </Form>
    </Modal>
  );
};

export default AddQuestionModal;
