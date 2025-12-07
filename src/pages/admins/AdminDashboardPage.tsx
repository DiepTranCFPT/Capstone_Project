import React from 'react';
import { Spin, Empty } from 'antd';
import { useDashboardStats } from '~/hooks/useDashboardStats';
import { useAdminExamStats } from '~/hooks/useAdminExamStats';
import ExamStatsSection from '~/components/admins/ExamStatsSection';
import UserStatsSection from '~/components/admins/UserStatsSection';

const AdminDashboardPage: React.FC = () => {
    const { stats, loading } = useDashboardStats();
    const { stats: examStats, loading: examLoading } = useAdminExamStats();

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
        </div>
    );
};

export default AdminDashboardPage;
