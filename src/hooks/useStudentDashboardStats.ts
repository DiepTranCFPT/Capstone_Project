import { useEffect, useState, useCallback } from "react";
import DashboardService from "~/services/dashboardService";
import StudentDashboardService from "~/services/StudentDashboardService";
import type { StudentExamStats } from "~/types/dashboard";
import type { StudentOverallStatistics, StudentFinancialStatistics, StudentExamStatistics } from "~/types/studentDashboard";
import { toast } from "~/components/common/Toast";

export const useStudentDashboardStats = () => {
    const [stats, setStats] = useState<StudentExamStats | null>(null);
    const [overall, setOverall] = useState<StudentOverallStatistics | null>(null);
    const [financial, setFinancial] = useState<StudentFinancialStatistics | null>(null);
    const [examStats, setExamStats] = useState<StudentExamStatistics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<unknown | null>(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [
                examRes,
                overallRes,
                financialRes,
                examDetailedRes
            ] = await Promise.all([
                DashboardService.getStudentExamStats(),
                StudentDashboardService.getOverall(),
                StudentDashboardService.getFinancial(),
                StudentDashboardService.getExam()
            ]);

            if (examRes.code === 1000) {
                setStats(examRes.data);
            } else {
                toast.error(examRes.message || "Failed to fetch student exam statistics");
            }

            // Overall stats endpoint returns examStats and financialStats, not overall stats
            // So we calculate overall stats from available data
            if (overallRes.code === 1000 || overallRes.code === 0) {
                // Calculate overall stats from financial stats
                const financialData = financialRes.code === 1000 || financialRes.code === 0 ? financialRes.data : null;
                const overallData: StudentOverallStatistics = {
                    totalCoursesEnrolled: financialData?.totalRegisteredMaterials ?? 0,
                    totalCompletedCourses: 0, // This might need to come from a different API
                    totalPendingAssignments: 0, // This might need to come from a different API
                };
                setOverall(overallData);
            } else {
                console.warn("Overall stats code not success:", overallRes.code, overallRes.message);
                // Set default values if API fails
                setOverall({
                    totalCoursesEnrolled: financialRes.code === 1000 || financialRes.code === 0 
                        ? (financialRes.data?.totalRegisteredMaterials ?? 0) 
                        : 0,
                    totalCompletedCourses: 0,
                    totalPendingAssignments: 0,
                });
            }

            if (financialRes.code === 1000 || financialRes.code === 0) {
                setFinancial(financialRes.data ?? null);
            } else {
                console.warn("Financial stats code not success:", financialRes.code, financialRes.message);
                toast.error(financialRes.message || "Failed to fetch financial statistics");
            }

            if (examDetailedRes.code === 1000 || examDetailedRes.code === 0) {
                setExamStats(examDetailedRes.data ?? null);
            } else {
                console.warn("Exam stats code not success:", examDetailedRes.code, examDetailedRes.message);
                toast.error(examDetailedRes.message || "Failed to fetch exam statistics");
            }
        } catch (err) {
            const error = err as unknown as { message?: string; response?: { status?: number; data?: unknown } };
            console.error("Failed to fetch student dashboard stats:", error);
            setError(error);
            toast.error(
                `Failed to load dashboard stats${error.response?.status ? ` (HTTP ${error.response.status})` : ""}`
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
        overall,
        financial,
        examStats,
        loading,
        error,
        refetch: fetchStats,
    };
};
