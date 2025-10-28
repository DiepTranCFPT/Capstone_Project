import React, { useState, useContext, useMemo } from 'react';
import { Button, Table, Tag, Input, Select, Space, Modal, DatePicker } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import type { QuestionBankItem, NewQuestion } from '~/types/question';
import type { ColumnsType } from 'antd/es/table';
import AddQuestionModal from '~/components/teachers/exam/AddQuestionModal';
import { toast } from '~/components/common/Toast';
import { QuestionBankContext } from '~/context/QuestionBankContext';

const { Option } = Select;

const QuestionBankPage: React.FC = () => {
    const { questionBank, addQuestion, updateQuestion, deleteQuestion } = useContext(QuestionBankContext)!;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<QuestionBankItem | null>(null);

    // Filter states
    const [searchText, setSearchText] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedSubject, setSelectedSubject] = useState<string>('All Subjects');
    const [selectedTopic, setSelectedTopic] = useState<string>('All Topics');
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingQuestion(null);
    };

    const handleEdit = (question: QuestionBankItem) => {
        setEditingQuestion(question);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: 'Delete Question',
            content: 'Are you sure you want to delete this question?',
            onOk() {
                deleteQuestion(id);
                toast.success('Question deleted successfully!');
            },
        });
    };

    const handleSaveNewQuestion = (newQuestion: NewQuestion) => {
        if (editingQuestion) {
            // Update existing question
            const updatedQuestion: QuestionBankItem = {
                ...editingQuestion,
                text: newQuestion.text,
                subject: newQuestion.subject,
                difficulty: newQuestion.difficulty,
                type: newQuestion.type,
                options:
                    newQuestion.type === "mcq"
                        ? newQuestion.choices?.map((c, i) => ({
                            text: c,
                            isCorrect: i === newQuestion.correctIndex,
                        })) ?? []
                        : editingQuestion.options,
                expectedAnswer:
                    newQuestion.type === "frq" ? newQuestion.expectedAnswer || "" : editingQuestion.expectedAnswer,
                tags: newQuestion.tags,
            };
            updateQuestion(editingQuestion.id, updatedQuestion);
            toast.success("Question updated successfully!");
            setEditingQuestion(null);
        } else {
            // Add new question
            const questionToAdd: QuestionBankItem = {
                id: crypto.randomUUID(),
                text: newQuestion.text,
                subject: newQuestion.subject,
                difficulty: newQuestion.difficulty,
                type: newQuestion.type,
                topic: "Custom Question",
                createdBy: "teacher",
                createdAt: new Date().toISOString(),
                options:
                    newQuestion.type === "mcq"
                        ? newQuestion.choices?.map((c, i) => ({
                            text: c,
                            isCorrect: i === newQuestion.correctIndex,
                        })) ?? []
                        : [],
                expectedAnswer:
                    newQuestion.type === "frq" ? newQuestion.expectedAnswer || "" : undefined,
                tags: newQuestion.tags,
            };
            addQuestion(questionToAdd);
            toast.success("Question added successfully!");
        }
        setIsModalOpen(false);
    };

    const clearFilters = () => {
        setSearchText('');
        setSelectedDifficulty('all');
        setSelectedType('all');
        setSelectedSubject('All Subjects');
        setSelectedTopic('All Topics');
        setDateRange(null);
    };

    const filteredData = useMemo(() => {
        return questionBank
            .filter(q => {
                if (searchText && !q.text.toLowerCase().includes(searchText.toLowerCase())) return false;
                if (selectedSubject !== 'All Subjects' && q.subject !== selectedSubject) return false;
                if (selectedTopic !== 'All Topics' && q.topic !== selectedTopic) return false;
                if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
                if (selectedType !== 'all' && q.type !== selectedType) return false;
                if (dateRange) {
                    const created = new Date(q.createdAt);
                    if (created < dateRange[0].toDate() || created > dateRange[1].toDate()) return false;
                }
                return true;
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [questionBank, searchText, selectedSubject, selectedTopic, selectedDifficulty, selectedType, dateRange]);

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
        { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt', sorter: true },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
                    <Button type="link" danger onClick={() => handleDelete(record.id)}>Delete</Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Question Bank</h1>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setIsModalOpen(true)}>
                    Contribute Question
                </Button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex gap-4 flex-wrap">
                <Input
                    placeholder="Search questions"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                />
                <Select value={selectedSubject} onChange={setSelectedSubject} className="w-48">
                    <Option value="All Subjects">All Subjects</Option>
                    <Option value="Biology">Biology</Option>
                    <Option value="Mathematics">Mathematics</Option>
                    <Option value="Physics">Physics</Option>
                    <Option value="History">History</Option>
                </Select>
                <Select value={selectedTopic} onChange={setSelectedTopic} className="w-48">
                    <Option value="All Topics">All Topics</Option>
                    <Option value="Custom Question">Custom Question</Option>
                    <Option value="Cell Structure">Cell Structure</Option>
                    <Option value="Mechanics">Mechanics</Option>
                    <Option value="Algebra">Algebra</Option>
                    <Option value="20th Century History">20th Century History</Option>
                </Select>
                <Select value={selectedDifficulty} onChange={setSelectedDifficulty} className="w-48">
                    <Option value="all">All Difficulties</Option>
                    <Option value="easy">Easy</Option>
                    <Option value="medium">Medium</Option>
                    <Option value="hard">Hard</Option>
                </Select>
                <Select value={selectedType} onChange={setSelectedType} className="w-48">
                    <Option value="all">All Types</Option>
                    <Option value="mcq">MCQ</Option>
                    <Option value="frq">FRQ</Option>
                </Select>
                <DatePicker.RangePicker value={dateRange} onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)} />
                <Button onClick={clearFilters}>Clear Filters</Button>
            </div>

            <Table columns={columns} dataSource={filteredData} rowKey="id" />

            <AddQuestionModal
                open={isModalOpen}
                onCancel={handleCloseModal}
                onSubmit={handleSaveNewQuestion}
                editingQuestion={editingQuestion}
            />
        </div>
    );
};

export default QuestionBankPage;
