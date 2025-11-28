import React from 'react';
import { Table, Button, Typography, Tag, Spin, Alert } from 'antd';
import { Link } from 'react-router-dom';
import { useTeacherReviewQueue } from '~/hooks/useExamAttempt';
import type { ReviewQueueItem } from '~/types/examAttempt';

const { Title, Text } = Typography;

const columns = [
    {
        title: 'Student',
        dataIndex: 'doneBy',
        key: 'doneBy',
        render: (text: string) => <Text strong>{text}</Text>,
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
    const { queue, loading, error, fetchReviewQueue } = useTeacherReviewQueue();

    React.useEffect(() => {
        fetchReviewQueue();
    }, [fetchReviewQueue]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
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
            
            <Table
                columns={columns}
                dataSource={queue}
                rowKey="attemptId"
                style={{ marginTop: '24px' }}
                bordered
            />
        </div>
    );
};

export default TeacherReviewQueuePage;
