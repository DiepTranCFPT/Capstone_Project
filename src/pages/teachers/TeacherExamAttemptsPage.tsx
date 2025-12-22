import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, Tag, Alert, Select, Space, Input } from 'antd';
import { Link } from 'react-router-dom';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useTeacherExamAttempts } from '~/hooks/useExamAttempt';
import type { TeacherExamAttemptItem } from '~/types/examAttempt';
import Loading from '~/components/common/Loading';

const { Title, Text } = Typography;

const sortOptions = [
    { label: 'Newest First', value: 'createdAt:desc' },
    { label: 'Oldest First', value: 'createdAt:asc' },
    { label: 'Submission Time (Latest)', value: 'endTime:desc' },
    { label: 'Submission Time (Earliest)', value: 'endTime:asc' },
    { label: 'Highest Score', value: 'score:desc' },
    { label: 'Lowest Score', value: 'score:asc' },
];

const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'COMPLETED':
            return 'green';
        case 'IN_PROGRESS':
            return 'blue';
        case 'PENDING':
            return 'orange';
        case 'GRADING':
            return 'processing';
        default:
            return 'default';
    }
};

const getScoreColor = (score: number, passingScore: number) => {
    if (score >= passingScore) return 'green';
    if (score >= passingScore * 0.7) return 'orange';
    return 'volcano';
};

const TeacherExamAttemptsPage: React.FC = () => {
    const { attempts, pageInfo, loading, error, fetchTeacherExamAttempts } = useTeacherExamAttempts();
    const [currentSort, setCurrentSort] = useState<string>('createdAt:desc');
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [currentPageSize, setCurrentPageSize] = useState<number>(10);
    const [searchText, setSearchText] = useState<string>('');

    useEffect(() => {
        fetchTeacherExamAttempts({ pageNo: 0, pageSize: 10, sorts: [currentSort] });
    }, [fetchTeacherExamAttempts]);

    const handleSortChange = (value: string) => {
        setCurrentSort(value);
        setCurrentPage(0);
        fetchTeacherExamAttempts({ pageNo: 0, pageSize: currentPageSize, sorts: [value] });
    };

    const handleTableChange = (pagination: { current?: number; pageSize?: number }) => {
        const page = (pagination.current || 1) - 1;
        const size = pagination.pageSize || 10;
        setCurrentPage(page);
        setCurrentPageSize(size);
        fetchTeacherExamAttempts({ pageNo: page, pageSize: size, sorts: [currentSort] });
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => <Text strong>{text}</Text>,
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value: boolean | React.Key, record: TeacherExamAttemptItem) =>
                record.title.toLowerCase().includes(String(value).toLowerCase()) ||
                record.doneBy.toLowerCase().includes(String(value).toLowerCase()) ||
                record.subject.toLowerCase().includes(String(value).toLowerCase()),
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
            render: (text: string) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Student',
            dataIndex: 'doneBy',
            key: 'doneBy',
            render: (text: string) => <Text>{text}</Text>,
        },
        {
            title: 'Start Time',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (date: string) => date ? new Date(date).toLocaleString() : '-',
        },
        {
            title: 'End Time',
            dataIndex: 'endTime',
            key: 'endTime',
            render: (date: string) => date ? new Date(date).toLocaleString() : '-',
        },
        {
            title: 'Score',
            key: 'score',
            render: (_: unknown, record: TeacherExamAttemptItem) => (
                <Tag color={getScoreColor(record.score, record.passingScore)}>
                    {record.score?.toFixed(2)} / {record.passingScore}
                </Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Late',
            dataIndex: 'isLate',
            key: 'isLate',
            render: (isLate: boolean) => (
                isLate ? <Tag color="red">Late</Tag> : <Tag color="green">On Time</Tag>
            ),
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating: number) => (
                <Text>{rating || 0} ⭐</Text>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: unknown, record: TeacherExamAttemptItem) => (
                <Space>
                    <Link to={`/teacher/attempt-result/${record.attemptId}`}>
                        <Button type="primary" icon={<EyeOutlined />} size="small">
                            View Details
                        </Button>
                    </Link>
                </Space>
            ),
        },
    ];

    if (loading && attempts.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Loading />
            </div>
        );
    }

    if (error) {
        return <Alert message="Error" description="Failed to load student exam attempts." type="error" showIcon />;
    }

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>Student Exam Attempts</Title>
            <Text type="secondary">
                View all exam attempts submitted by students. You can review and grade their submissions.
            </Text>

            {/* Controls */}
            <div style={{ marginTop: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <Space>
                    <Text strong>Sort by:</Text>
                    <Select
                        value={currentSort}
                        onChange={handleSortChange}
                        style={{ width: 220 }}
                        options={sortOptions}
                    />
                </Space>
                <Input
                    placeholder="Search by title, student, or subject..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                    allowClear
                />
            </div>

            <Table
                columns={columns}
                dataSource={attempts}
                rowKey="attemptId"
                bordered
                loading={loading}
                onChange={handleTableChange}
                scroll={{ x: 1200 }}
                pagination={{
                    current: (pageInfo?.pageNo ?? currentPage) + 1,
                    pageSize: pageInfo?.pageSize ?? currentPageSize,
                    total: pageInfo?.totalElement ?? pageInfo?.totalElements ?? 0,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} attempts`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                }}
            />
        </div>
    );
};

export default TeacherExamAttemptsPage;
