import React, { useState } from 'react';
import { Button, Table, Tag, Input, Select } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { QuestionBankItem } from '~/types/test';
import { mockQuestionBank } from '../../data/teacher';
import type { ColumnsType } from 'antd/es/table';
import ContributeQuestionModal from '../../components/teachers/content-management/ContributeQuestionModal';

const { Option } = Select;

const QuestionBankPage: React.FC = () => {
    const [questions, setQuestions] = useState<QuestionBankItem[]>(mockQuestionBank);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleAddQuestion = (values: Omit<QuestionBankItem, 'id' | 'createdBy' | 'createdAt'>) => {
        const newQuestion: QuestionBankItem = {
            id: `qb${questions.length + 1}`,
            ...values,
            createdBy: 'Jane Smith', // Should be from auth user
            createdAt: new Date().toISOString().split('T')[0],
        };
        setQuestions(prev => [newQuestion, ...prev]);
        setIsModalVisible(false);
    };

    const columns: ColumnsType<QuestionBankItem> = [
        { title: 'Question', dataIndex: 'text', key: 'text', render: text => text.substring(0, 50) + '...' },
        {
            title: 'Type', dataIndex: 'type', key: 'type',
            render: (type: string) => <Tag color={type === 'mcq' ? 'blue' : 'green'}>{type.toUpperCase()}</Tag>
        },
        { title: 'Subject', dataIndex: 'subject', key: 'subject' },
        { title: 'Topic', dataIndex: 'topic', key: 'topic' },
        {
            title: 'Difficulty', dataIndex: 'difficulty', key: 'difficulty',
            render: (difficulty: string) => {
                const color = difficulty === 'easy' ? 'cyan' : difficulty === 'medium' ? 'orange' : 'red';
                return <Tag color={color}>{difficulty}</Tag>;
            }
        },
        { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt' },
        { title: 'Action', key: 'action', render: () => <a>Edit</a> },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Question Bank</h1>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setIsModalVisible(true)}>
                    Contribute Question
                </Button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex gap-4">
                <Input placeholder="Search questions" prefix={<SearchOutlined />} />
                <Select defaultValue="All Subjects" className="w-48">
                    <Option value="All Subjects">All Subjects</Option>
                    <Option value="Biology">Biology</Option>
                    <Option value="Physics">Physics</Option>
                </Select>
                <Select defaultValue="All Topics" className="w-48">
                    <Option value="All Topics">All Topics</Option>
                </Select>
            </div>

            <Table columns={columns} dataSource={questions} rowKey="id" />

            <ContributeQuestionModal
                visible={isModalVisible}
                onCreate={handleAddQuestion}
                onCancel={() => setIsModalVisible(false)}
            />
        </div>
    );
};

export default QuestionBankPage;

