import React from 'react';
import { Card, Row, Col, Select } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const { Option } = Select;

// Mock Data
const scoreDistributionData = [
    { name: '0-50', count: 3 },
    { name: '51-60', count: 5 },
    { name: '61-70', count: 8 },
    { name: '71-80', count: 12 },
    { name: '81-90', count: 7 },
    { name: '91-100', count: 4 },
];

const performanceByTopicData = [
    { topic: 'Mechanics', avgScore: 78 },
    { topic: 'Thermodynamics', avgScore: 65 },
    { topic: 'E&M', avgScore: 82 },
    { topic: 'Waves', avgScore: 71 },
    { topic: 'Modern Physics', avgScore: 68 },
];

const submissionStatusData = [
    { name: 'Graded', value: 29 },
    { name: 'Pending', value: 12 },
];
const COLORS = ['#0088FE', '#FFBB28'];

const ClassAnalyticsPage: React.FC = () => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Class Analytics</h1>
                <Select defaultValue="class1" className="w-64">
                    <Option value="class1">AP Physics C: Mechanics</Option>
                    <Option value="class2">AP Calculus BC</Option>
                </Select>
            </div>

            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Card title="Score Distribution - Mid-term Exam">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={scoreDistributionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#3CBCB2" name="Number of Students" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Average Performance by Topic">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={performanceByTopicData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="topic" width={120} />
                                <Tooltip />
                                <Bar dataKey="avgScore" fill="#f59e0b" name="Average Score" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Submission Status">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={submissionStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${Number((percent as number) * 100).toFixed(0)}%`}
                                >
                                    {submissionStatusData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ClassAnalyticsPage;
