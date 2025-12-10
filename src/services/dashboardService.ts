import axiosInstance from "~/configs/axios";
import type { DashboardStatsResponse, RevenueSystemParams, RevenueSystemResponse } from "~/types/dashboard";
import type { UserDashboardParams, UserDashboardResponse } from "~/types/user";

const DashboardService = {
    // GET /admin/dashboard/stats
    async getStats(): Promise<DashboardStatsResponse> {
        const response = await axiosInstance.get<DashboardStatsResponse>("/admin/dashboard/stats");
        return response.data;
    },

    async getUsersDashboard(params: UserDashboardParams): Promise<UserDashboardResponse> {
        const response = await axiosInstance.get<UserDashboardResponse>("/admin/dashboard/users", { params });
        return response.data;
    },

    // GET /teacher/dashboard/exam-stats
    async getTeacherExamStats(): Promise<import("~/types/dashboard").TeacherExamStatsResponse> {
        const response = await axiosInstance.get<import("~/types/dashboard").TeacherExamStatsResponse>("/teacher/dashboard/exam-stats");
        return response.data;
    },

    // GET /student/dashboard/exam-stats
    async getStudentExamStats(): Promise<import("~/types/dashboard").StudentExamStatsResponse> {
        const response = await axiosInstance.get<import("~/types/dashboard").StudentExamStatsResponse>("/student/dashboard/exam-stats");
        return response.data;
    },

    // GET /parent/dashboard/exam-stats/{childrenId}
    async getParentExamStats(childrenId: string): Promise<import("~/types/dashboard").ParentExamStatsResponse> {
        const response = await axiosInstance.get<import("~/types/dashboard").ParentExamStatsResponse>(`/parent/dashboard/exam-stats/${childrenId}`);
        return response.data;
    },

    // GET /admin/dashboard/exam-stats
    async getAdminExamStats(): Promise<import("~/types/dashboard").AdminExamStatsResponse> {
        const response = await axiosInstance.get<import("~/types/dashboard").AdminExamStatsResponse>("/admin/dashboard/exam-stats");
        return response.data;
    },

    // GET /admin/dashboard/revenue/system
    async getRevenueSystem(params?: RevenueSystemParams): Promise<RevenueSystemResponse> {
        const response = await axiosInstance.get<RevenueSystemResponse>("/admin/dashboard/revenue/system", { params });
        return response.data;
    },
};

export default DashboardService;
