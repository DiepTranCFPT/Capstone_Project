import React, { useState } from 'react';
import { Table, Button, Typography, Tag, Alert, Select, Space } from 'antd';
import { Link } from 'react-router-dom';
import { useTeacherReviewQueue } from '~/hooks/useExamAttempt';
import type { ReviewQueueItem } from '~/types/examAttempt';
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

const columns = [
    {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        render: (text: string) => <Text strong>{text}</Text>,
    },
    {
        title: 'Subject',
        dataIndex: 'subject',
        key: 'subject',
        render: (text: string) => <Text>{text}</Text>,
    },
    {
        title: 'Student',
        dataIndex: 'doneBy',
        key: 'doneBy',
        render: (text: string) => <Text>{text}</Text>,
    },
    {
        title: 'Time submitted',
        dataIndex: 'endTime',
        key: 'endTime',
        render: (date: string) => new Date(date).toLocaleString(),
    },
    {
        title: 'Current score',
        dataIndex: 'score',
        key: 'score',
        render: (score: number) => <Tag color={score >= 50 ? "green" : "volcano"}>{score.toFixed(2)}</Tag>,
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (text: string) => <Tag color={text === 'pending' ? 'blue' : 'green'}>{text}</Tag>,
    },
    {
        title: 'Rating',
        dataIndex: 'rating',
        key: 'rating',
        render: (rating: number) => <Tag color={rating >= 5 ? "green" : "volcano"}>{rating || 0} sao</Tag>,
    },
    {
        title: 'Action',
        key: 'action',
        render: (_: ReviewQueueItem, record: ReviewQueueItem) => (
            <Link to={`/teacher/grading/${record.attemptId}?mode=review`}>
                <Button type="primary">
                    Review now
                </Button>
            </Link>
        ),
    },
];

const TeacherReviewQueuePage: React.FC = () => {
    // Hook trả về danh sách queue, trạng thái loading và lỗi
    const { queue, pageInfo, loading, error, fetchReviewQueue } = useTeacherReviewQueue();
    const [currentSort, setCurrentSort] = useState<string>('createdAt:desc');
    const [currentPage, setCurrentPage] = useState<number>(1); // API uses 1-indexed
    const [currentPageSize, setCurrentPageSize] = useState<number>(10);

    React.useEffect(() => {
        fetchReviewQueue({ pageNo: 1, pageSize: 10, sorts: [currentSort] });
    }, [fetchReviewQueue]);

    const handleSortChange = (value: string) => {
        setCurrentSort(value);
        setCurrentPage(1); // Reset to first page (1-indexed)
        fetchReviewQueue({ pageNo: 1, pageSize: currentPageSize, sorts: [value] });
    };

    const handleTableChange = (pagination: { current?: number; pageSize?: number }) => {
        const page = pagination.current || 1; // API uses 1-indexed
        const size = pagination.pageSize || 10;
        setCurrentPage(page);
        setCurrentPageSize(size);
        fetchReviewQueue({ pageNo: page, pageSize: size, sorts: [currentSort] });
    };

    if (loading && queue.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Loading />
            </div>
        );
    }

    if (error) {
        return <Alert message="Error" description="Failed to load review queue." type="error" showIcon />;
    }

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>Review queue</Title>
            <Text type="secondary">This is the list of exams that students have requested to be regraded.</Text>

            {/* Sort Controls */}
            <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                <Space>
                    <Text strong>Sort by:</Text>
                    <Select
                        value={currentSort}
                        onChange={handleSortChange}
                        style={{ width: 220 }}
                        options={sortOptions}
                    />
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={queue}
                rowKey="attemptId"
                bordered
                loading={loading}
                onChange={handleTableChange}
                pagination={{
                    current: pageInfo?.pageNo ?? currentPage, // Both use 1-indexed
                    pageSize: pageInfo?.pageSize ?? currentPageSize,
                    total: pageInfo?.totalElement ?? pageInfo?.totalElements ?? 0,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    pageSizeOptions: ['10', '20', '50'],
                }}
            />
        </div>
    );
};

export default TeacherReviewQueuePage;

