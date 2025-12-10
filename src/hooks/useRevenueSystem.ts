import { useEffect, useState, useCallback } from "react";
import DashboardService from "~/services/dashboardService";
import type { RevenueSystemData, RevenueSystemParams } from "~/types/dashboard";
import { toast } from "~/components/common/Toast";

export const useRevenueSystem = (params?: RevenueSystemParams) => {
    const [revenue, setRevenue] = useState<RevenueSystemData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRevenue = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await DashboardService.getRevenueSystem(params);
            if (res.code === 1000) {
                setRevenue(res.data);
            } else {
                const errorMsg = res.message || "Failed to fetch revenue data";
                setError(errorMsg);
                toast.error(errorMsg);
            }
        } catch (err) {
            const error = err as unknown as { message?: string; response?: { status?: number; data?: unknown } };
            const errorMsg = error.message || `Failed to load revenue data${error.response?.status ? ` (HTTP ${error.response.status})` : ""}`;
            setError(errorMsg);
            console.error("Failed to fetch revenue:", error);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchRevenue();
    }, [fetchRevenue]);

    return {
        revenue,
        loading,
        error,
        refetch: fetchRevenue,
    };
};

