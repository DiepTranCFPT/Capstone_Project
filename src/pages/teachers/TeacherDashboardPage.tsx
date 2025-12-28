import React, { useMemo } from 'react';
import { Card, Col, Row, Statistic, Table, Tag, Button, Spin, Empty } from 'antd';
import {
    UsergroupAddOutlined,
    BookOutlined,
    RightOutlined,
    TrophyOutlined,
    StarOutlined,
    FileTextOutlined,
    UploadOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { useTeacherDashboardStats } from '~/hooks/useTeacherDashboardStats';
import { useAuth } from '~/hooks/useAuth';
import { FaCoins } from 'react-icons/fa';

const PRIMARY_COLOR = '#3CBCB2';

const quickActions = [
    { title: 'Question Bank', link: '/teacher/question-bank', icon: <FileTextOutlined /> },
    { title: 'Upload Material', link: '/teacher/materials', icon: <UploadOutlined /> },
    { title: 'View Reports', link: '/teacher/exam-attempts', icon: <BarChartOutlined /> },
];

const TeacherDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const { stats, loading } = useTeacherDashboardStats();

    const topicData = useMemo(() => {
        if (!stats?.questionsByTopic) return [];
        return Object.entries(stats.questionsByTopic).map(([topic, count]) => ({
            topic: topic.length > 20 ? topic.substring(0, 20) + '...' : topic,
            fullTopic: topic,
            count: count
        })).sort((a, b) => b.count - a.count).slice(0, 10);
    }, [stats]);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back, {user?.firstName}!</p>
                </div>
                <Link to="/teacher/create-template">
                    <Button
                        type="primary"
                        size="large"
                        icon={<BookOutlined />}
                        style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                    >
                        Create New Exam
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <Row gutter={[16, 16]} className="mb-8">
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" className="rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-gray-500">Students Tested</span>}
                            value={stats?.totalStudentsTested || 0}
                            prefix={<UsergroupAddOutlined style={{ color: PRIMARY_COLOR }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" className="rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-gray-500">Total Attempts</span>}
                            value={stats?.totalExamAttempts || 0}
                            prefix={<BookOutlined style={{ color: PRIMARY_COLOR }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" className="rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-gray-500">Exam Revenue</span>}
                            value={stats?.estimatedRevenue || 0}
                            prefix={<FaCoins style={{ color: PRIMARY_COLOR }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" className="rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-gray-500">Avg Rating</span>}
                            value={stats?.averageRating || 0}
                            precision={1}
                            prefix={<StarOutlined style={{ color: PRIMARY_COLOR }} />}
                            suffix="/ 5"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" className="rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-gray-500">Pending Reviews</span>}
                            value={stats?.pendingManualReviews || 0}
                            prefix={<BookOutlined style={{ color: PRIMARY_COLOR }} />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                {/* Left Column */}
                <Col xs={24} lg={16}>
                    <div className="flex flex-col gap-4">
                        {/* Chart */}
                        <Card
                            title="Questions by Topic"
                            variant="borderless"
                            className="rounded-lg shadow-sm"
                        >
                            <div style={{ height: 400 }}>
                                {topicData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={topicData} margin={{ bottom: 60, left: 10, right: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis
                                                dataKey="topic"
                                                tick={{ fontSize: 11 }}
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                            />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                                                            <p className="font-semibold text-gray-800">{payload[0].payload.fullTopic}</p>
                                                            <p className="text-sm text-gray-600">Questions: {payload[0].value}</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }} />
                                            <Bar dataKey="count" fill={PRIMARY_COLOR} radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <Empty description="No data available" />
                                )}
                            </div>
                        </Card>

                        {/* Top Exams Table */}
                        <Card
                            title={
                                <span className="flex items-center gap-2">
                                    <TrophyOutlined style={{ color: '#f59e0b' }} />
                                    Top Performing Exams
                                </span>
                            }
                            variant="borderless"
                            className="rounded-lg shadow-sm"
                        >
                            <Table
                                dataSource={stats?.topPerformingExams || []}
                                rowKey="templateId"
                                pagination={false}
                                size="middle"
                                columns={[
                                    {
                                        title: 'Exam',
                                        dataIndex: 'title',
                                        key: 'title',
                                        ellipsis: true,
                                    },
                                    {
                                        title: 'Attempts',
                                        dataIndex: 'attempts',
                                        key: 'attempts',
                                        align: 'center',
                                        width: 100,
                                        render: (val: number) => <Tag color="cyan">{val || 0}</Tag>
                                    },
                                    {
                                        title: 'Avg Score',
                                        dataIndex: 'avgScore',
                                        key: 'avgScore',
                                        align: 'center',
                                        width: 100,
                                        render: (val: number) => (
                                            <span className={val >= 70 ? 'text-green-600' : 'text-orange-500'}>
                                                {val?.toFixed(1) || 0}
                                            </span>
                                        )
                                    },
                                    {
                                        title: 'Revenue',
                                        dataIndex: 'revenue',
                                        key: 'revenue',
                                        align: 'center',
                                        width: 120,
                                        render: (val: number) => `${val?.toLocaleString() || 0} ₫`
                                    }
                                ]}
                            />
                        </Card>
                    </div>
                </Col>

                {/* Right Column */}
                <Col xs={24} lg={8}>
                    <div className="flex flex-col gap-4">
                        {/* Quick Actions */}
                        <Card title="Quick Actions" variant="borderless" className="rounded-lg shadow-sm">
                            <div className="flex flex-col gap-2">
                                {quickActions.map((action, index) => (
                                    <Link to={action.link} key={index}>
                                        <Button
                                            block
                                            size="large"
                                            icon={action.icon}
                                            className="text-left flex justify-between items-center"
                                        >
                                            {action.title}
                                            <RightOutlined className="text-xs text-gray-400" />
                                        </Button>
                                    </Link>
                                ))}
                            </div>
                        </Card>

                        {/* Summary Card */}
                        <Card

                            className="rounded-lg shadow-sm"
                            style={{ borderColor: PRIMARY_COLOR }}
                        >
                            <div className="text-center text-textTealColor py-4">
                                <FileTextOutlined className="text-4xl mb-3" />
                                <p className="text-textTealColor text-sm mb-1">Total Questions</p>
                                <p className="text-4xl font-bold">{stats?.totalQuestions?.toLocaleString() || 0}</p>
                            </div>
                        </Card>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default TeacherDashboardPage;