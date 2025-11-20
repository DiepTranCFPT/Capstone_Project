import React from 'react';
import { Card, Col, Row, Statistic, Table, Tag, Progress, Avatar, Button } from 'antd';
import {
    UserOutlined,
    DollarCircleOutlined,
    ReadOutlined,
    FileTextOutlined,
    ArrowUpOutlined,
} from '@ant-design/icons';
import {
    AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

// --- Mock Data ---
const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
    { name: 'Jul', revenue: 3490 },
    { name: 'Aug', revenue: 5200 },
    { name: 'Sep', revenue: 6100 },
];

const userDistributionData = [
    { name: 'Students', value: 3200 },
    { name: 'Teachers', value: 120 },
    { name: 'Parents', value: 850 },
    { name: 'Advisors', value: 15 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const recentTransactions = [
    { id: 'TRX-001', user: 'John Doe', type: 'Token Purchase', amount: '$49.99', status: 'Success', date: '2025-10-01' },
    { id: 'TRX-002', user: 'Alice Smith', type: 'Course Enrollment', amount: '$19.99', status: 'Success', date: '2025-10-01' },
    { id: 'TRX-003', user: 'Bob Wilson', type: 'Token Purchase', amount: '$9.99', status: 'Pending', date: '2025-09-30' },
    { id: 'TRX-004', user: 'Mary Jane', type: 'Premium Plan', amount: '$99.00', status: 'Success', date: '2025-09-29' },
];

const AdminDashboardPage: React.FC = () => {
    return (
        <div className="p-2">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Overview</h1>

            {/* Key Metrics Cards */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Total Revenue"
                            value={152850}
                            prefix={<DollarCircleOutlined className="text-green-500" />}
                            precision={2}
                            suffix="$"
                            valueStyle={{ color: '#3f8600' }}
                        />
                        <div className="text-xs text-green-600 flex items-center mt-2">
                            <ArrowUpOutlined className="mr-1" /> 12% vs last month
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Total Users"
                            value={4185}
                            prefix={<UserOutlined className="text-blue-500" />}
                        />
                        <div className="text-xs text-gray-500 mt-2">
                            +125 new registrations this week
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Active Courses"
                            value={48}
                            prefix={<ReadOutlined className="text-purple-500" />}
                        />
                        <div className="text-xs text-gray-500 mt-2">
                            Across 12 different subjects
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Mock Tests Taken"
                            value={12893}
                            prefix={<FileTextOutlined className="text-orange-500" />}
                        />
                        <div className="text-xs text-gray-500 mt-2">
                            High engagement rate
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Charts Section */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} lg={16}>
                    <Card title="Revenue Growth (YTD)" className="shadow-sm h-full">
                        <div style={{ height: 350 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3CBCB2" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3CBCB2" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    {/* <YAxis prefix="vnd" /> */}
                                    <Tooltip />
                                    <Area type="monotone" dataKey="revenue" stroke="#3CBCB2" fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="User Distribution" className="shadow-sm h-full">
                        <div style={{ height: 350 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={userDistributionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {userDistributionData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Recent Transactions & System Health */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Card title="Recent Transactions" className="shadow-sm">
                        <Table
                            dataSource={recentTransactions}
                            rowKey="id"
                            pagination={false}
                            columns={[
                                { title: 'ID', dataIndex: 'id', key: 'id', render: (text) => <span className="text-xs font-mono">{text}</span> },
                                { title: 'User', dataIndex: 'user', key: 'user', render: (text) => <span className="font-medium">{text}</span> },
                                { title: 'Type', dataIndex: 'type', key: 'type' },
                                { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (text) => <span className="font-bold text-green-600">{text}</span> },
                                {
                                    title: 'Status',
                                    dataIndex: 'status',
                                    key: 'status',
                                    render: (status) => (
                                        <Tag color={status === 'Success' ? 'green' : status === 'Pending' ? 'orange' : 'red'}>
                                            {status}
                                        </Tag>
                                    )
                                },
                                { title: 'Date', dataIndex: 'date', key: 'date', className: 'text-gray-500' },
                            ]}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="System Health" className="shadow-sm h-full">
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">Server Load</span>
                                    <span className="text-sm text-gray-500">45%</span>
                                </div>
                                <Progress percent={45} status="active" strokeColor="#3b82f6" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">Database Storage</span>
                                    <span className="text-sm text-gray-500">72%</span>
                                </div>
                                <Progress percent={72} status="active" strokeColor="#f59e0b" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">Memory Usage</span>
                                    <span className="text-sm text-gray-500">28%</span>
                                </div>
                                <Progress percent={28} status="active" strokeColor="#10b981" />
                            </div>

                            <div className="pt-4 border-t">
                                <h4 className="font-semibold mb-2">Pending Approvals</h4>
                                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-2">
                                    <div className="flex items-center gap-2">
                                        <Avatar size="small" icon={<UserOutlined />} />
                                        <span className="text-sm">New Teacher Request</span>
                                    </div>
                                    <Button size="small" type="primary">Review</Button>
                                </div>
                                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Avatar size="small" icon={<FileTextOutlined />} />
                                        <span className="text-sm">Flagged Content</span>
                                    </div>
                                    <Button size="small" danger>Check</Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboardPage;
