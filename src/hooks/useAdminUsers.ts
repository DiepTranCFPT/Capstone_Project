import { useEffect, useState, useCallback } from "react";
import type { User, UserDashboardParams } from "~/types/user";
import DashboardService from "~/services/dashboardService";
import { toast } from "~/components/common/Toast";

export const useAdminUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    // Pagination & Filters state
    const [pageNo, setPageNo] = useState(1); // API uses 1-indexed pageNo (starts from 1)
    const [pageSize, setPageSize] = useState(10);
    const [keyword, setKeyword] = useState("");
    const [role, setRole] = useState<string | undefined>(undefined);
    const [isVerified, setIsVerified] = useState<boolean | undefined>(undefined);
    const [isLocked, setIsLocked] = useState<boolean | undefined>(undefined);
    const [sorts, setSorts] = useState<string[]>([]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params: UserDashboardParams = {
                pageNo,
                pageSize,
                keyword: keyword || undefined,
                role: role || undefined,
                isVerified,
                isLocked,
                sorts: sorts.length > 0 ? sorts : undefined,
            };

            console.log('🔍 fetchUsers called with params:', params);
            const res = await DashboardService.getUsersDashboard(params);
            const data = res.data;
            setUsers(data?.items ?? []);
            setTotal(data?.totalElement ?? 0);
            console.log('✅ Fetched users:', data?.items?.length, 'Total:', data?.totalElement);
        } catch (error) {
            const err = error as unknown as { message?: string; response?: { status?: number; data?: unknown } };
            console.error("Failed to fetch admin users:", err);
            toast.error(
                `Failed to load admin users${err.response?.status ? ` (HTTP ${err.response.status})` : ""}`
            );
        } finally {
            setLoading(false);
        }
    }, [pageNo, pageSize, keyword, role, isVerified, isLocked, sorts]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Helper to reset pagination when filters change
    const handleFilterChange = (
        updates: Partial<{
            keyword: string;
            role: string;
            isVerified: boolean;
            isLocked: boolean;
            sorts: string[];
        }>
    ) => {
        if (updates.keyword !== undefined) setKeyword(updates.keyword);
        if (updates.role !== undefined) setRole(updates.role);
        if (updates.isVerified !== undefined) setIsVerified(updates.isVerified);
        if (updates.isLocked !== undefined) setIsLocked(updates.isLocked);
        if (updates.sorts !== undefined) setSorts(updates.sorts);

        setPageNo(1); // Reset to first page on filter change (1-indexed)
    };

    return {
        users,
        loading,
        total,
        pageNo,
        pageSize,
        keyword,
        role,
        isVerified,
        isLocked,
        sorts,
        setPageNo,
        setPageSize,
        setKeyword,
        setRole,
        setIsVerified,
        setIsLocked,
        setSorts,
        handleFilterChange,
        fetchUsers,
    };
};
