import { useEffect, useState, useCallback } from "react";
import DashboardService from "~/services/dashboardService";
import TeacherRatingService from "~/services/teacherRatingService";
import type { TeacherExamStats } from "~/types/dashboard";
import { toast } from "~/components/common/Toast";
import { useAuth } from "~/hooks/useAuth";

export const useTeacherDashboardStats = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<TeacherExamStats | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchStats = useCallback(async () => {
        if (!user?.id) return;
        
        setLoading(true);
        try {
            // Gọi API dashboard stats và average rating song song
            const [dashboardRes, ratingRes] = await Promise.allSettled([
                DashboardService.getTeacherExamStats(),
                TeacherRatingService.getAverageRating(user.id)
            ]);

            // Xử lý dashboard stats
            let dashboardData: TeacherExamStats | null = null;
            if (dashboardRes.status === "fulfilled" && dashboardRes.value.code === 1000) {
                dashboardData = dashboardRes.value.data;
            } else if (dashboardRes.status === "rejected") {
                console.error("Failed to fetch teacher exam stats:", dashboardRes.reason);
                toast.error("Failed to load teacher exam stats");
            }

            // Xử lý average rating (chấp nhận cả ApiResponse<number> hoặc raw number)
            let averageRating = dashboardData?.averageRating || 0;
            if (ratingRes.status === "fulfilled") {
                const payload = ratingRes.value.data as unknown;
                if (
                    typeof payload === "object" &&
                    payload !== null &&
                    "code" in payload &&
                    "data" in (payload as { data?: unknown })
                ) {
                    const maybeApi = payload as { code?: number; data?: unknown };
                    if (typeof maybeApi.data === "number") {
                        averageRating = maybeApi.data;
                    }
                } else if (typeof payload === "number") {
                    averageRating = payload;
                }
            } else if (ratingRes.status === "rejected") {
                console.warn("Failed to fetch average rating, using dashboard value:", ratingRes.reason);
            }

            // Merge dữ liệu
            if (dashboardData) {
                setStats({
                    ...dashboardData,
                    averageRating
                });
            }
        } catch (error) {
            const err = error as unknown as { message?: string; response?: { status?: number; data?: unknown } };
            console.error("Failed to fetch teacher dashboard stats:", err);
            toast.error(
                `Failed to load teacher dashboard stats${err.response?.status ? ` (HTTP ${err.response.status})` : ""}`
            );
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        loading,
        fetchStats,
    };
};
