import { useEffect, useState, useCallback } from "react";
import { message } from "antd";
import DashboardService from "~/services/dashboardService";
import type { DashboardStats } from "~/types/dashboard";

export const useDashboardStats = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await DashboardService.getStats();
            if (res.code === 1000) { // Success code is 1000
                setStats(res.data);
            } else {
                message.error(res.message || "Failed to fetch dashboard statistics");
            }

        } catch (error) {
            const err = error as unknown as { message?: string; response?: { status?: number; data?: unknown } };
            console.error("Failed to fetch dashboard stats:", err);
            message.error(
                `Không tải được thống kê dashboard${err.response?.status ? ` (HTTP ${err.response.status})` : ""}`
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        loading,
        fetchStats,
    };
};
