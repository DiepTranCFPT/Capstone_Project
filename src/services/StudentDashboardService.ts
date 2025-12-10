import axiosInstance from "~/configs/axios";
import type { StudentExamStatisticsResponse, StudentFinancialStatisticsResponse, StudentOverallStatisticsResponse } from "~/types/studentDashboard";


const StudentDashboardService = {
  async getOverall(): Promise<StudentOverallStatisticsResponse> {
    const response = await axiosInstance.get<StudentOverallStatisticsResponse>("/student/dashboard/overall-stats");
    return response.data;
  },

  async getFinancial(): Promise<StudentFinancialStatisticsResponse> {
    const response = await axiosInstance.get<StudentFinancialStatisticsResponse>("/student/dashboard/financial-stats");
    return response.data;
  },

  async getExam(): Promise<StudentExamStatisticsResponse> {
    const response = await axiosInstance.get<StudentExamStatisticsResponse>("/student/dashboard/exam-stats");
    return response.data;
  },
};

export default StudentDashboardService;
