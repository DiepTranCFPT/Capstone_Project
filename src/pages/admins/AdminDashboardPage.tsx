import React from 'react';
import { Card, Col, Row, Statistic, Spin, Empty } from 'antd';
import {
    UserOutlined,
    TeamOutlined,
    SolutionOutlined,
    UsergroupAddOutlined,
    ArrowUpOutlined,
} from '@ant-design/icons';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { useDashboardStats } from '~/hooks/useDashboardStats';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const AdminDashboardPage: React.FC = () => {
    const { stats, loading } = useDashboardStats();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spin size="large" tip="Đang tải dữ liệu dashboard..." />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Empty description="Không có dữ liệu thống kê" />
            </div>
        );
    }

    // Prepare data for user distribution pie chart - always show all categories even if zero
    const userDistributionData = [
        { name: 'Học sinh', value: stats.totalStudents },
        { name: 'Giáo viên', value: stats.totalTeachers },
        { name: 'Phụ huynh', value: stats.totalParents },
    ];

    // Check if chartData is available
    const hasChartData = stats.chartData && stats.chartData.length > 0;

    // Prepare data for line chart (user growth over time) - show default data if empty
    const userGrowthData = hasChartData ? stats.chartData.map(item => ({
        date: new Date(item.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
        'Tổng người dùng': item.totalUsers,
        'Học sinh': item.totalStudents,
        'Giáo viên': item.totalTeachers,
        'Phụ huynh': item.totalParents,
    })) : [
        {
            date: 'Hôm nay',
            'Tổng người dùng': 0,
            'Học sinh': 0,
            'Giáo viên': 0,
            'Phụ huynh': 0,
        }
    ];

    // Prepare data for bar chart (daily metrics) - show default data if empty
    const dailyMetricsData = hasChartData ? stats.chartData.map(item => ({
        date: new Date(item.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
        'Học sinh mới': item.newStudents,
        'Giáo viên mới': item.newTeachers,
        'Người dùng hoạt động': item.dailyActiveUsers,
    })) : [
        {
            date: 'Hôm nay',
            'Học sinh mới': 0,
            'Giáo viên mới': 0,
            'Người dùng hoạt động': 0,
        }
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Tổng quan Admin</h1>

            {/* Key Metrics Cards */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-gray-600 font-medium">Tổng người dùng</span>}
                            value={stats.totalUsers}
                            prefix={<UserOutlined className="text-blue-500" />}
                            valueStyle={{ color: '#3b82f6', fontSize: '28px', fontWeight: 'bold' }}
                        />
                        <div className="text-xs text-gray-500 mt-2 flex items-center">
                            <ArrowUpOutlined className="mr-1 text-green-500" />
                            Tất cả người dùng trong hệ thống
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-gray-600 font-medium">Học sinh</span>}
                            value={stats.totalStudents}
                            prefix={<TeamOutlined className="text-green-500" />}
                            valueStyle={{ color: '#10b981', fontSize: '28px', fontWeight: 'bold' }}
                        />
                        <div className="text-xs text-gray-500 mt-2">
                            {((stats.totalStudents / stats.totalUsers) * 100).toFixed(1)}% tổng người dùng
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-gray-600 font-medium">Giáo viên</span>}
                            value={stats.totalTeachers}
                            prefix={<SolutionOutlined className="text-orange-500" />}
                            valueStyle={{ color: '#f59e0b', fontSize: '28px', fontWeight: 'bold' }}
                        />
                        <div className="text-xs text-gray-500 mt-2">
                            {((stats.totalTeachers / stats.totalUsers) * 100).toFixed(1)}% tổng người dùng
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-gray-600 font-medium">Phụ huynh</span>}
                            value={stats.totalParents}
                            prefix={<UsergroupAddOutlined className="text-purple-500" />}
                            valueStyle={{ color: '#8b5cf6', fontSize: '28px', fontWeight: 'bold' }}
                        />
                        <div className="text-xs text-gray-500 mt-2">
                            {((stats.totalParents / stats.totalUsers) * 100).toFixed(1)}% tổng người dùng
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Charts Section */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} lg={15}>
                    <Card title="Xu hướng tăng trưởng người dùng" className="shadow-sm h-full">
                        <div style={{ height: 400 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={userGrowthData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="Tổng người dùng"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ fill: '#3b82f6', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Học sinh"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={{ fill: '#10b981', r: 3 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Giáo viên"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        dot={{ fill: '#f59e0b', r: 3 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Phụ huynh"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        dot={{ fill: '#8b5cf6', r: 3 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={9}>
                    <Card title="Phân bố người dùng" className="shadow-sm h-full">
                        <div style={{ height: 400 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={userDistributionData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={true}
                                        label={(entry: any) => {
                                            const total = userDistributionData.reduce((sum, item) => sum + item.value, 0);
                                            if (total === 0) return `${entry.name}: 0%`;
                                            const percent = (entry.value / total) * 100;
                                            return `${entry.name}: ${percent.toFixed(0)}%`;
                                        }}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {userDistributionData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        formatter={(value: string) => {
                                            const item = userDistributionData.find(d => d.name === value);
                                            return `${value}: ${item?.value || 0}`;
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Daily Metrics Bar Chart */}
            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <Card title="Hoạt động hàng ngày" className="shadow-sm">
                        <div style={{ height: 400 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyMetricsData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="Học sinh mới" fill="#10b981" radius={[8, 8, 0, 0]} />
                                    <Bar dataKey="Giáo viên mới" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                                    <Bar dataKey="Người dùng hoạt động" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboardPage;
