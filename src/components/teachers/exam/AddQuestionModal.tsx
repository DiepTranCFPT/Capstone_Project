import React, { useState } from "react";
import { Modal, Form, Input, Select, Radio, Button, Space } from "antd";
import type { NewQuestion } from "~/types/question";

const { Option } = Select;

interface AddQuestionModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (data: NewQuestion) => void;
}

const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  open,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm<NewQuestion>();
  const [questionType, setQuestionType] = useState<"multiple_choice" | "essay">(
    "multiple_choice"
  );
  const [choices, setChoices] = useState<string[]>(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);

  const handleAddChoice = () => setChoices([...choices, ""]);

  const handleChoiceChange = (value: string, index: number) => {
    const updated = [...choices];
    updated[index] = value;
    setChoices(updated);
  };

  const handleFinish = (values: Omit<NewQuestion, "type" | "choices" | "correctIndex">) => {
    const questionData: NewQuestion = {
      ...values,
      type: questionType,
      choices: questionType === "multiple_choice" ? choices : undefined,
      correctIndex:
        questionType === "multiple_choice" ? correctIndex : undefined,
      expectedAnswer:
        questionType === "essay" ? values.expectedAnswer || "" : undefined,
    };

    onSubmit(questionData);
    form.resetFields();
    setChoices(["", "", "", ""]);
    setCorrectIndex(null);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="Add New Question"
      footer={null}
      width={700}
    >
      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Form.Item
          label="Question Text"
          name="text"
          rules={[{ required: true, message: "Please enter question text" }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          label="Subject"
          name="subject"
          rules={[{ required: true, message: "Please enter subject" }]}
        >
          <Input placeholder="e.g. Math, Physics" />
        </Form.Item>

        <Form.Item
          label="Difficulty"
          name="difficulty"
          rules={[{ required: true, message: "Please select difficulty" }]}
        >
          <Select placeholder="Select difficulty">
            <Option value="easy">Easy</Option>
            <Option value="medium">Medium</Option>
            <Option value="hard">Hard</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Tags" name="tags">
          <Select mode="tags" placeholder="Add tags (optional)" />
        </Form.Item>

        <Form.Item label="Question Type">
          <Radio.Group
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
          >
            <Radio value="multiple_choice">Multiple Choice</Radio>
            <Radio value="essay">Essay</Radio>
          </Radio.Group>
        </Form.Item>

        {questionType === "multiple_choice" ? (
          <div className="space-y-3">
            <p className="font-medium">Choices</p>
            {choices.map((choice, index) => (
              <div key={index} className="flex items-center gap-2">
                <Radio
                  checked={correctIndex === index}
                  onChange={() => setCorrectIndex(index)}
                />
                <Input
                  placeholder={`Choice ${index + 1}`}
                  value={choice}
                  onChange={(e) => handleChoiceChange(e.target.value, index)}
                />
              </div>
            ))}
            <Button type="dashed" onClick={handleAddChoice} block>
              + Add Choice
            </Button>
          </div>
        ) : (
          <Form.Item
            label="Expected Answer"
            name="expectedAnswer"
            rules={[{ required: true, message: "Please enter answer" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        )}

        <div className="flex justify-end mt-5">
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{ backgroundColor: "#3CBCB2", border: "none" }}
            >
              Save Question
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default AddQuestionModal;
