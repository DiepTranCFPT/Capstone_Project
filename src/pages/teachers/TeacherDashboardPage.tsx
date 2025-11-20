import React from 'react';
import { Card, Col, Row, Statistic, Table, Tag, List, Avatar, Button } from 'antd';
import {
    UsergroupAddOutlined,
    BookOutlined,
    CheckSquareOutlined,
    RiseOutlined,
    ClockCircleOutlined,
    AlertOutlined,
    RightOutlined
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

// Mock Data cho biểu đồ phổ điểm
const scoreData = [
    { range: '0-20', students: 2 },
    { range: '21-40', students: 5 },
    { range: '41-60', students: 15 },
    { range: '61-80', students: 45 },
    { range: '81-100', students: 28 },
];

// Mock Data cho học sinh cần chú ý (At Risk)
const studentsAtRisk = [
    { id: 1, name: 'Nguyen Van C', class: 'AP Physics', reason: 'Low Score (45%)', avatar: 'https://i.pravatar.cc/150?img=3' },
    { id: 2, name: 'Tran Thi D', class: 'Calculus BC', reason: 'Inactive (7 days)', avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: 3, name: 'Le Van E', class: 'AP Physics', reason: 'Missed Exam', avatar: 'https://i.pravatar.cc/150?img=8' },
];

// Mock Data cho bài thi sắp tới
const upcomingExams = [
    { id: 1, title: 'Mid-term Physics', date: '2025-10-25', time: '09:00 AM', class: 'AP Physics C' },
    { id: 2, title: 'Calculus Quiz 3', date: '2025-10-28', time: '02:00 PM', class: 'AP Calculus BC' },
];

const TeacherDashboardPage: React.FC = () => {
    return (
        <div className="p-2">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className='text-2xl font-bold text-gray-800'>Teacher Dashboard</h1>
                    <p className="text-gray-500">Welcome back! Here's what's happening with your classes.</p>
                </div>
                <Link to="/teacher/create-template">
                    <Button type="primary" size="large" icon={<BookOutlined />}>Create New Exam</Button>
                </Link>
            </div>

            {/* Quick Stats */}
            <Row gutter={[16, 16]} className='mb-6'>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title='Total Students'
                            value={125}
                            prefix={<UsergroupAddOutlined className="text-blue-500" />}
                            suffix={<span className="text-xs text-green-500 bg-green-50 px-2 py-0.5 rounded-full ml-2">+5 new</span>}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Active Classes"
                            value={4}
                            prefix={<BookOutlined className="text-purple-500" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Link to="/teacher/grading">
                        <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-red-500">
                            <Statistic
                                title="Pending Grading"
                                value={12}
                                valueStyle={{ color: '#cf1322' }}
                                prefix={<CheckSquareOutlined />}
                                suffix={<span className="text-xs text-gray-400 ml-2">Needs Action</span>}
                            />
                        </Card>
                    </Link>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Avg. Class Score"
                            value={78.5}
                            precision={1}
                            prefix={<RiseOutlined className="text-green-600" />}
                            suffix="%"
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                {/* Left Column: Charts & Analytics */}
                <Col xs={24} lg={16}>
                    <div className='flex flex-col gap-4'>
                        <Card title="Student Score Distribution (Recent Exams)" className="shadow-sm mb-6">
                            <div style={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={scoreData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="range" />
                                        <YAxis />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Bar dataKey="students" fill="#3CBCB2" radius={[4, 4, 0, 0]} name="Number of Students" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card title={<span className="flex items-center gap-2"><AlertOutlined className="text-red-500" /> Students At Risk (Need Attention)</span>} className="shadow-sm">
                            <Table
                                dataSource={studentsAtRisk}
                                rowKey="id"
                                pagination={false}
                                columns={[
                                    {
                                        title: 'Student',
                                        dataIndex: 'name',
                                        key: 'name',
                                        render: (text, record) => (
                                            <div className="flex items-center gap-3">
                                                <Avatar src={record.avatar} />
                                                <span className="font-medium">{text}</span>
                                            </div>
                                        )
                                    },
                                    { title: 'Class', dataIndex: 'class', key: 'class' },
                                    {
                                        title: 'Reason',
                                        dataIndex: 'reason',
                                        key: 'reason',
                                        render: (text) => <Tag color="volcano">{text}</Tag>
                                    },
                                    {
                                        title: 'Action',
                                        key: 'action',
                                        render: () => <Button size="small" type="link">Message</Button>
                                    }
                                ]}
                            />
                        </Card>
                    </div>
                </Col>

                {/* Right Column: Upcoming & Activity */}
                <Col xs={24} lg={8}>
                    <div className='flex flex-col gap-4'>
                        <Card title="Upcoming Exams" className="shadow-sm mb-6" extra={<Link to="/teacher/templates">View All</Link>}>
                            <List
                                itemLayout="horizontal"
                                dataSource={upcomingExams}
                                renderItem={item => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<div className="bg-blue-50 p-2 rounded-lg"><ClockCircleOutlined className="text-blue-500 text-lg" /></div>}
                                            title={<span className="font-semibold">{item.title}</span>}
                                            description={
                                                <div className="text-xs mt-1">
                                                    <div className="font-medium text-gray-700">{item.class}</div>
                                                    <div>{item.date} at {item.time}</div>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        </Card>

                        <Card title="Quick Actions" className="shadow-sm">
                            <div className="flex flex-col gap-3">
                                <Link to="/teacher/question-bank">
                                    <Button block icon={<RightOutlined />} className="text-left flex justify-between items-center">
                                        Add Question to Bank
                                    </Button>
                                </Link>
                                <Link to="/teacher/materials">
                                    <Button block icon={<RightOutlined />} className="text-left flex justify-between items-center">
                                        Upload Material
                                    </Button>
                                </Link>
                                <Link to="/teacher/analytics">
                                    <Button block icon={<RightOutlined />} className="text-left flex justify-between items-center">
                                        View Detailed Reports
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </div>
                </Col>
            </Row>
        </div>
    )
}

export default TeacherDashboardPage;