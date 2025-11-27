import axiosInstance from "~/configs/axios";
import type { DashboardStatsResponse } from "~/types/dashboard";
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
};

export default DashboardService;
