import { useEffect, useState, useCallback } from "react";
import DashboardService from "~/services/dashboardService";
import type { TeacherExamStats } from "~/types/dashboard";
import { toast } from "~/components/common/Toast";

export const useTeacherDashboardStats = () => {
    const [stats, setStats] = useState<TeacherExamStats | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await DashboardService.getTeacherExamStats();
            if (res.code === 1000) {
                setStats(res.data);
            } else {
                toast.error(res.message || "Failed to fetch teacher exam statistics");
            }
        } catch (error) {
            const err = error as unknown as { message?: string; response?: { status?: number; data?: unknown } };
            console.error("Failed to fetch teacher exam stats:", err);
            toast.error(
                `Failed to load teacher exam stats${err.response?.status ? ` (HTTP ${err.response.status})` : ""}`
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
