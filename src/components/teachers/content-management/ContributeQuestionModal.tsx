import { Button, Form, Input, Modal, Radio, Select } from "antd";
import React, { useState } from "react";
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

interface QuestionOption {
    text: string;
    isCorrect: boolean;
}

interface QuestionFormValues {
    text: string;
    type: 'mcq' | 'frq';
    options: QuestionOption[];
    subject: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

interface ContributeQuestionModalProps {
    visible: boolean;
    onCreate: (values: QuestionFormValues) => void;
    onCancel: () => void;
}


const ContributeQuestionModal: React.FC<ContributeQuestionModalProps> = ({ visible, onCreate, onCancel }) => {

    const [form] = Form.useForm();
    const [questionType, setQuestionType] = useState<'mcq' | 'frq'>('mcq');

    const onFinish = (values: QuestionFormValues) => {
        onCreate(values);
        form.resetFields();
    };

    return (
        <Modal
            visible={visible}
            title="Contribute a new question"
            okText="Add Question"
            cancelText="Cancel"
            onCancel={onCancel}
            onOk={() => form.submit()}
        >
            <Form form={form} onFinish={onFinish} layout="vertical" initialValues={{ type: 'mcq' }} name="contribute_question">
                <Form.Item name="text" label="Question Text" rules={[{ required: true }]}>
                    <TextArea rows={4} />
                </Form.Item>
                <Form.Item name="type" label="Question Type" rules={[{ required: true }]}>
                    <Radio.Group onChange={(e) => setQuestionType(e.target.value)}>
                        <Radio value="mcq">Multiple Choice (MCQ)</Radio>
                        <Radio value="frq">Free Response (FRQ)</Radio>
                    </Radio.Group>
                </Form.Item>

                {questionType === 'mcq' && (
                    <Form.List name="options">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <div>
                                        <Form.Item {...restField} name={[name, 'text']} rules={[{ required: true }]}>
                                            <Input placeholder={`Option ${key + 1}`} />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'isCorrect']} valuePropName="checked">
                                            <Radio>Correct</Radio>
                                        </Form.Item>
                                        <MinusCircleOutlined onClick={() => remove(name)} />
                                    </div>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Add Option
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                )}
                <Form.Item name="subject" label="Subject" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="topic" label="Topic" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="difficulty" label="Difficulty" rules={[{ required: true }]}>
                    <Select>
                        <Option value="easy">Easy</Option>
                        <Option value="medium">Medium</Option>
                        <Option value="hard">Hard</Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ContributeQuestionModal;
