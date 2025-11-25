import React from 'react';
import { Table, Button, Typography, Tag, Spin, Alert } from 'antd';
import { Link } from 'react-router-dom';
import { useTeacherReviewQueue } from '~/hooks/useExamAttempt';
import type { ReviewQueueItem } from '~/types/examAttempt';

const { Title, Text } = Typography;

const columns = [
    {
        title: 'Học sinh',
        dataIndex: 'doneBy',
        key: 'doneBy',
        render: (text: string) => <Text strong>{text}</Text>,
    },
    {
        title: 'ID Bài thi',
        dataIndex: 'examId',
        key: 'examId',
    },
    {
        title: 'Thời gian nộp',
        dataIndex: 'endTime',
        key: 'endTime',
        render: (date: string) => new Date(date).toLocaleString(),
    },
    {
        title: 'Điểm hiện tại',
        dataIndex: 'score',
        key: 'score',
        render: (score: number) => <Tag color={score >= 50 ? "green" : "volcano"}>{score.toFixed(2)}</Tag>,
    },
    {
        title: 'Rating',
        dataIndex: 'rating',
        key: 'rating',
        render: (rating: number) => <Tag>{rating} sao</Tag>,
    },
    {
        title: 'Hành động',
        key: 'action',
        render: (_: ReviewQueueItem, record: ReviewQueueItem) => (
            <Link to={`/teacher/grading/${record.attemptId}?mode=review`}>
                <Button type="primary">
                    Chấm ngay
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
        return <Alert message="Lỗi" description="Không thể tải danh sách yêu cầu phúc khảo." type="error" showIcon />;
    }

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>Danh sách chờ phúc khảo</Title>
            <Text type="secondary">Đây là danh sách các bài thi học sinh yêu cầu chấm lại.</Text>
            
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
