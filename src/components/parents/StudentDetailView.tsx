import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Button, Spin, Tag, Typography, Space, Statistic, Row, Col } from 'antd';
import { ArrowLeftOutlined, TrophyOutlined, FileTextOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useParent } from '~/hooks/useParent';
import type { ChildExamHistoryItem } from '~/types/parent';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const StudentDetailView: React.FC = () => {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();
    const {
        children,
        examHistory,
        historyPageInfo,
        loadingHistory,
        fetchChildren,
        fetchChildExamHistory
    } = useParent();

    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        fetchChildren();
    }, [fetchChildren]);

    useEffect(() => {
        if (studentId) {
            fetchChildExamHistory(studentId, currentPage, pageSize);
        }
    }, [studentId, currentPage, fetchChildExamHistory]);

    const student = children.find(child => child.studentId === studentId);

    const columns: ColumnsType<ChildExamHistoryItem> = [
        {
            title: 'Mã bài thi',
            dataIndex: 'examId',
            key: 'examId',
            render: (examId: string) => <Text code>{examId}</Text>,
        },
        {
            title: 'Điểm số',
            dataIndex: 'score',
            key: 'score',
            render: (score: number) => (
                <Tag color={score >= 80 ? 'green' : score >= 50 ? 'orange' : 'red'}>
                    {score.toFixed(1)}
                </Tag>
            ),
            sorter: (a, b) => a.score - b.score,
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating: number) => (
                <Space>
                    <TrophyOutlined style={{ color: '#faad14' }} />
                    <Text>{rating}/5</Text>
                </Space>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'COMPLETED' ? 'success' : 'processing'}>
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Thời gian bắt đầu',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (time: string) => dayjs(time).format('DD/MM/YYYY HH:mm'),
            sorter: (a, b) => dayjs(a.startTime).unix() - dayjs(b.startTime).unix(),
        },
        {
            title: 'Thời gian kết thúc',
            dataIndex: 'endTime',
            key: 'endTime',
            render: (time: string) => time ? dayjs(time).format('DD/MM/YYYY HH:mm') : 'N/A',
        },
    ];

    if (!student && !loadingHistory) {
        return (
            <div className="p-6">
                <Card>
                    <div className="text-center py-8">
                        <Text type="danger">Không tìm thấy thông tin học sinh</Text>
                        <div className="mt-4">
                            <Button type="primary" onClick={() => navigate('/parent/dashboard')}>
                                Quay lại
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/parent/dashboard')}
                className="mb-4"
            >
                Quay lại
            </Button>

            {student && (
                <Card className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Title level={3} className="mb-0">
                            {student.studentName}
                        </Title>
                        <Tag color="blue">{student.email}</Tag>
                    </div>

                    <Row gutter={16}>
                        <Col span={6}>
                            <Statistic
                                title="Tổng số bài thi"
                                value={student.totalExamsTaken}
                                prefix={<FileTextOutlined />}
                            />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="Điểm trung bình"
                                value={student.averageScore.toFixed(1)}
                                suffix="/ 100"
                                valueStyle={{ color: student.averageScore >= 80 ? '#3f8600' : '#cf1322' }}
                            />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="Bài thi gần nhất"
                                value={student.lastExamScore?.toFixed(1) || 'N/A'}
                                suffix={student.lastExamScore ? '/ 100' : ''}
                            />
                        </Col>
                        <Col span={6}>
                            <div>
                                <Text type="secondary">Hoạt động gần nhất</Text>
                                <div className="text-lg font-semibold">
                                    {dayjs(student.lastActivity).format('DD/MM/YYYY')}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card>
            )}

            <Card title="Lịch sử thi" extra={<FileTextOutlined />}>
                {loadingHistory ? (
                    <div className="text-center py-8">
                        <Spin size="large" />
                        <p className="mt-4 text-gray-600">Đang tải lịch sử thi...</p>
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={examHistory}
                        rowKey="attemptId"
                        pagination={{
                            current: currentPage + 1,
                            pageSize: pageSize,
                            total: historyPageInfo?.totalElements || 0,
                            onChange: (page) => setCurrentPage(page - 1),
                            showSizeChanger: false,
                            showTotal: (total) => `Tổng ${total} bài thi`,
                        }}
                        locale={{
                            emptyText: 'Chưa có lịch sử thi',
                        }}
                    />
                )}
            </Card>
        </div>
    );
};

export default StudentDetailView;
