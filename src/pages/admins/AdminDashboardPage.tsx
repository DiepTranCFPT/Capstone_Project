import React from 'react';
import { Spin, Empty, Card } from 'antd';
import { useDashboardStats } from '~/hooks/useDashboardStats';
import { useAdminExamStats } from '~/hooks/useAdminExamStats';
import { useRevenueSystem } from '~/hooks/useRevenueSystem';
import ExamStatsSection from '~/components/admins/ExamStatsSection';
import UserStatsSection from '~/components/admins/UserStatsSection';

const AdminDashboardPage: React.FC = () => {
    const { stats, loading } = useDashboardStats();
    const { stats: examStats, loading: examLoading } = useAdminExamStats();
    const { revenue, loading: revenueLoading, error: revenueError } = useRevenueSystem();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Empty description="No data available" />
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

            {/* User Statistics Section */}
            <UserStatsSection stats={stats} loading={false} />

            {/* Exam Statistics Section */}
            <ExamStatsSection stats={examStats} loading={examLoading} />

            {/* Revenue System Section */}
            <div className="mt-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Revenue System</h2>
                {revenueLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Spin />
                    </div>
                ) : revenueError ? (
                    <Card bordered={false} className="shadow-sm">
                        <div className="text-red-500">Error: {revenueError}</div>
                    </Card>
                ) : (
                    <Card title="System Revenue" bordered={false} className="shadow-sm">
                        <p className="text-gray-600 text-sm">Total Revenue</p>
                        <p className="text-3xl font-bold text-indigo-600">
                            {revenue?.totalAmount !== undefined 
                                ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenue.totalAmount)
                                : 'N/A'}
                        </p>
                        {revenue && (
                            <div className="mt-4 text-sm text-gray-500">
                                <div className="mt-1">
                                    <span>Total Amount: </span>
                                    <span className="font-semibold">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenue.totalAmount)}
                                    </span>
                                </div>
                                <div className="mt-1">
                                    <span>Day: </span>
                                    <span className="font-semibold">{revenue.day ?? 'null'}</span>
                                </div>
                                <div className="mt-1">
                                    <span>Month: </span>
                                    <span className="font-semibold">{revenue.month ?? 'null'}</span>
                                </div>
                                <div className="mt-1">
                                    <span>Year: </span>
                                    <span className="font-semibold">{revenue.year ?? 'null'}</span>
                                </div>
                            </div>
                        )}
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AdminDashboardPage;
