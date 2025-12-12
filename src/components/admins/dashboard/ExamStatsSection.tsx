import React from 'react';
import { Card, Col, Row, Statistic, Spin, Empty, Table, Tag, Progress } from 'antd';
import {
    FileTextOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    QuestionCircleOutlined,
    TrophyOutlined,
} from '@ant-design/icons';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import type { AdminExamStats } from '~/types/dashboard';

const PRIMARY_COLOR = '#3CBCB2';
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

interface ExamStatsSectionProps {
    stats: AdminExamStats | null;
    loading: boolean;
}

export const ExamStatsSection: React.FC<ExamStatsSectionProps> = ({ stats, loading }) => {
    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Spin size="large" />
            </div>
        );
    }

    if (!stats) {
        return <Empty description="No exam statistics available" />;
    }

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Exam Statistics</h2>

            {/* Exam Stats Cards */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-gray-600 font-medium">Total Attempts</span>}
                            value={stats.totalAttempts}
                            prefix={<FileTextOutlined style={{ color: PRIMARY_COLOR }} />}
                            valueStyle={{ color: PRIMARY_COLOR, fontSize: '28px', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-gray-600 font-medium">Completed</span>}
                            value={stats.completedAttempts}
                            prefix={<CheckCircleOutlined className="text-green-500" />}
                            valueStyle={{ color: '#10b981', fontSize: '28px', fontWeight: 'bold' }}
                        />
                        <Progress
                            percent={stats.completionRate}
                            size="small"
                            strokeColor={PRIMARY_COLOR}
                            className="mt-2"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-gray-600 font-medium">Pending</span>}
                            value={stats.pendingAttempts}
                            prefix={<ClockCircleOutlined className="text-orange-500" />}
                            valueStyle={{ color: '#f59e0b', fontSize: '28px', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-gray-600 font-medium">Total Questions</span>}
                            value={stats.totalQuestions}
                            prefix={<QuestionCircleOutlined style={{ color: PRIMARY_COLOR }} />}
                            valueStyle={{ color: PRIMARY_COLOR, fontSize: '28px', fontWeight: 'bold' }}
                        />
                        <div className="text-xs text-gray-500 mt-2">
                            {stats.manualReviewCount} pending manual review
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Questions Charts */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} lg={12}>
                    <Card title="Questions by Subject" className="shadow-sm h-full">
                        <div style={{ height: 300 }}>
                            {stats.questionsBySubject && Object.keys(stats.questionsBySubject).length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={Object.entries(stats.questionsBySubject).map(([subject, count]) => ({
                                            subject: subject.length > 12 ? subject.substring(0, 12) + '...' : subject,
                                            count
                                        }))}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill={PRIMARY_COLOR} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Empty description="No subject data" />
                            )}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Questions by Difficulty" className="shadow-sm h-full">
                        <div style={{ height: 300 }}>
                            {stats.questionsByDifficulty && Object.keys(stats.questionsByDifficulty).length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={Object.entries(stats.questionsByDifficulty).map(([difficulty, count]) => ({
                                                name: difficulty,
                                                value: count
                                            }))}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={(props: PieLabelRenderProps) => `${props.name}: ${((props.percent as number) * 100).toFixed(0)}%`}
                                        >
                                            {Object.keys(stats.questionsByDifficulty).map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <Empty description="No difficulty data" />
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Top Popular Exams Table */}
            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <Card
                        title={
                            <span className="flex items-center gap-2">
                                <TrophyOutlined style={{ color: '#f59e0b' }} />
                                Top Popular Exams
                            </span>
                        }
                        className="shadow-sm"
                    >
                        <Table
                            dataSource={stats.topPopularExams || []}
                            rowKey="templateId"
                            pagination={false}
                            size="middle"
                            columns={[
                                {
                                    title: 'Exam Title',
                                    dataIndex: 'title',
                                    key: 'title',
                                    ellipsis: true,
                                },
                                {
                                    title: 'Teacher',
                                    dataIndex: 'teacherName',
                                    key: 'teacherName',
                                    ellipsis: true,
                                },
                                {
                                    title: 'Attempts',
                                    dataIndex: 'attemptCount',
                                    key: 'attemptCount',
                                    align: 'center',
                                    width: 100,
                                    render: (val: number) => <Tag color="cyan">{val || 0}</Tag>
                                },
                                {
                                    title: 'Avg Score',
                                    dataIndex: 'averageScore',
                                    key: 'averageScore',
                                    align: 'center',
                                    width: 100,
                                    render: (val: number) => (
                                        <span className={val >= 70 ? 'text-green-600' : 'text-orange-500'}>
                                            {val?.toFixed(1) || 0}%
                                        </span>
                                    )
                                }
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ExamStatsSection;
