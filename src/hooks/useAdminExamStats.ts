import { useEffect, useState, useCallback } from "react";
import DashboardService from "~/services/dashboardService";
import type { AdminExamStats } from "~/types/dashboard";
import { toast } from "~/components/common/Toast";

export const useAdminExamStats = () => {
    const [stats, setStats] = useState<AdminExamStats | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await DashboardService.getAdminExamStats();
            if (res.code === 1000) {
                setStats(res.data);
            } else {
                toast.error(res.message || "Failed to fetch admin exam statistics");
            }
        } catch (error) {
            const err = error as unknown as { message?: string; response?: { status?: number; data?: unknown } };
            console.error("Failed to fetch admin exam stats:", err);
            toast.error(
                `Failed to load admin exam stats${err.response?.status ? ` (HTTP ${err.response.status})` : ""}`
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
