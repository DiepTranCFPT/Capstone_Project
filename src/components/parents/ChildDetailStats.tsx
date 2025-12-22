import React from 'react';
import { Card, Col, Row, Statistic, Empty, Table, Tag } from 'antd';
import {
    FileTextOutlined,
    TrophyOutlined,
    ClockCircleOutlined,
    StarOutlined,
    BulbOutlined,
} from '@ant-design/icons';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import type { StudentExamStats } from '~/types/dashboard';
import Loading from '../common/Loading';

const PRIMARY_COLOR = '#3CBCB2';

interface ChildDetailStatsProps {
    stats: StudentExamStats | null;
    loading: boolean;
    childName?: string;
}

export const ChildDetailStats: React.FC<ChildDetailStatsProps> = ({ stats, loading, childName }) => {
    if (loading) {
        return (
            <Loading />
        );
    }

    if (!stats) {
        return <Empty description="Student not found" />;
    }

    // Transform topicPerformance for charts
    const topicData = Object.entries(stats.topicPerformance || {}).map(([topic, score]) => ({
        topic: topic.length > 12 ? topic.substring(0, 12) + '...' : topic,
        fullTopic: topic,
        score: score
    })).slice(0, 8);

    // For radar chart
    const radarData = Object.entries(stats.topicPerformance || {}).map(([topic, score]) => ({
        subject: topic.length > 10 ? topic.substring(0, 10) + '...' : topic,
        score: score,
        fullMark: 100
    })).slice(0, 6);

    return (
        <div>
            {childName && (
                <h3 className="text-xl font-bold mb-4 text-gray-700">
                    Statistics of {childName}
                </h3>
            )}

            {/* Stats Cards */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-gray-600 font-medium">Total exams</span>}
                            value={stats.totalExamsTaken || 0}
                            prefix={<FileTextOutlined style={{ color: PRIMARY_COLOR }} />}
                            valueStyle={{ color: PRIMARY_COLOR, fontSize: '28px', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-gray-600 font-medium">Average score</span>}
                            value={stats.averageScore || 0}
                            precision={1}
                            prefix={<TrophyOutlined className="text-yellow-500" />}
                            valueStyle={{
                                color: (stats.averageScore || 0) >= 70 ? '#10b981' : '#f59e0b',
                                fontSize: '28px',
                                fontWeight: 'bold'
                            }}
                        />
                        {/* <Progress
                            percent={stats.averageScore || 0}
                            size="small"
                            strokeColor={stats.averageScore >= 70 ? '#10b981' : '#f59e0b'}
                            className="mt-2"
                        /> */}
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-gray-600 font-medium">Exams in progress</span>}
                            value={stats.examsInProgress || 0}
                            prefix={<ClockCircleOutlined className="text-blue-500" />}
                            valueStyle={{ color: '#3b82f6', fontSize: '28px', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow h-full" style={{ borderColor: PRIMARY_COLOR }}>
                        <div className="flex items-center gap-2 mb-2">
                            <BulbOutlined style={{ color: PRIMARY_COLOR }} />
                            <span className="text-gray-600 font-medium">Recommended topic</span>
                        </div>
                        <p className="text-lg font-bold" style={{ color: PRIMARY_COLOR }}>
                            {stats.recommendedTopic || 'No topic recommended'}
                        </p>
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} lg={12}>
                    <Card title="Topic performance" className="shadow-sm h-full">
                        <div style={{ height: 280 }}>
                            {topicData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topicData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="topic" tick={{ fontSize: 11 }} />
                                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            formatter={(value: number) => [`${value.toFixed(1)}`, 'Score']}
                                            labelFormatter={(label) => {
                                                const item = topicData.find(d => d.topic === label);
                                                return item?.fullTopic || label;
                                            }}
                                        />
                                        <Bar dataKey="score" fill={PRIMARY_COLOR} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Empty description="No data available" />
                            )}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Ability analysis" className="shadow-sm h-full">
                        <div style={{ height: 280 }}>
                            {radarData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={radarData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                                        <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                                        <Radar
                                            name="Score"
                                            dataKey="score"
                                            stroke={PRIMARY_COLOR}
                                            fill={PRIMARY_COLOR}
                                            fillOpacity={0.5}
                                        />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Empty description="No data available" />
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Recent Attempts Table */}
            <Card
                title={
                    <span className="flex items-center gap-2">
                        <StarOutlined style={{ color: '#f59e0b' }} />
                        Recent attempts
                    </span>
                }
                className="shadow-sm"
            >
                <Table
                    dataSource={stats.recentAttempts || []}
                    rowKey="attemptId"
                    pagination={{ pageSize: 5 }}
                    size="middle"
                    columns={[
                        {
                            title: 'Exam',
                            dataIndex: 'title',
                            key: 'title',
                            ellipsis: true,
                        },
                        {
                            title: 'Score',
                            dataIndex: 'score',
                            key: 'score',
                            align: 'center',
                            width: 100,
                            render: (val: number) => (
                                <span className={val >= 70 ? 'text-green-600 font-bold' : 'text-orange-500 font-bold'}>
                                    {val?.toFixed(1) || 0}
                                </span>
                            )
                        },
                        {
                            title: 'Status',
                            dataIndex: 'status',
                            key: 'status',
                            align: 'center',
                            width: 120,
                            render: (status: string) => (
                                <Tag color={status === 'COMPLETED' ? 'green' : status === 'IN_PROGRESS' ? 'blue' : 'default'}>
                                    {status === 'COMPLETED' ? 'Completed' : status === 'IN_PROGRESS' ? 'In progress' : status}
                                </Tag>
                            )
                        },
                        {
                            title: 'Date',
                            dataIndex: 'startTime',
                            key: 'startTime',
                            align: 'center',
                            width: 150,
                            render: (val: string) => val ? new Date(val).toLocaleDateString('vi-VN') : '-'
                        }
                    ]}
                />
            </Card>
        </div>
    );
};

export default ChildDetailStats;
