import React, { useState, useEffect, useMemo } from 'react';
import { Spin, Empty, Card } from 'antd';
import { useDashboardStats } from '~/hooks/useDashboardStats';
import { useAdminExamStats } from '~/hooks/useAdminExamStats';
import { useRevenueSystem } from '~/hooks/useRevenueSystem';
import ExamStatsSection from '~/components/admins/ExamStatsSection';
import UserStatsSection from '~/components/admins/UserStatsSection';
import RevenueChart from '~/components/admins/RevenueChart';

const AdminDashboardPage: React.FC = () => {
    const { stats, loading } = useDashboardStats();
    const { stats: examStats, loading: examLoading } = useAdminExamStats();
    const { revenue, loading: revenueLoading, error: revenueError } = useRevenueSystem();
    
    // Revenue chart filters
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [selectedDay, setSelectedDay] = useState<string>("");

    // Generate years (current year and 5 years back)
    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());
    }, []);

    // Generate months (1-12)
    const months = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
    }, []);

    // Generate days based on selected year and month
    const days = useMemo(() => {
        if (!selectedYear || !selectedMonth) return [];
        const year = parseInt(selectedYear);
        const month = parseInt(selectedMonth);
        const daysInMonth = new Date(year, month, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString().padStart(2, "0"));
    }, [selectedYear, selectedMonth]);

    // Reset month and day when year changes
    useEffect(() => {
        setSelectedMonth("");
        setSelectedDay("");
    }, [selectedYear]);

    // Reset day when month changes
    useEffect(() => {
        setSelectedDay("");
    }, [selectedMonth]);

    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

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

            {/* Revenue System Section */}
            <div className="mb-8">
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
                    <>
                        {/* Filters */}
                        <Card title="Filters" bordered={false} className="shadow-sm mb-6">
                            <div className="flex flex-wrap gap-3 items-center">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Year</label>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[100px]"
                                    >
                                        <option value="">Select Year</option>
                                        {years.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Month</label>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        disabled={!selectedYear}
                                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[120px] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Select Month</option>
                                        {months.map((month) => (
                                            <option key={month} value={month}>
                                                {monthNames[parseInt(month) - 1]}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Day</label>
                                    <select
                                        value={selectedDay}
                                        onChange={(e) => setSelectedDay(e.target.value)}
                                        disabled={!selectedYear || !selectedMonth}
                                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[100px] disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
                                    >
                                        <option value="">
                                            {!selectedYear || !selectedMonth ? "Select Year & Month first" : "Select Day"}
                                        </option>
                                        {days.map((day) => (
                                            <option key={day} value={day}>
                                                {day}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </Card>

                        {/* Total Revenue */}
                        <Card title="System Revenue" bordered={false} className="shadow-sm mb-6">
                            <p className="text-gray-600 text-sm">Total Revenue</p>
                            <p className="text-3xl font-bold text-indigo-600">
                                {revenue?.totalAmount !== undefined 
                                    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenue.totalAmount)
                                    : 'N/A'}
                            </p>
                        </Card>

                        {/* Revenue Chart */}
                        <Card 
                            title="Revenue Chart" 
                            bordered={false} 
                            className="shadow-sm"
                        >
                            <RevenueChart 
                                selectedYear={selectedYear}
                                selectedMonth={selectedMonth}
                                selectedDay={selectedDay}
                            />
                        </Card>
                    </>
                )}
            </div>

            {/* User Statistics Section */}
            <UserStatsSection stats={stats} loading={false} />

            {/* Exam Statistics Section */}
            <ExamStatsSection stats={examStats} loading={examLoading} />
        </div>
    );
};

export default AdminDashboardPage;
