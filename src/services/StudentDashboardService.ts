import axiosInstance from "~/configs/axios";
import type { StudentExamStatisticsResponse, StudentFinancialStatisticsResponse, StudentOverallStatisticsResponse } from "~/types/studentDashboard";


const StudentDashboardService = {
  getOverall(): Promise<StudentOverallStatisticsResponse> {
    return axiosInstance.get("/student/dashboard/overall-stats");
  },

  getFinancial(): Promise<StudentFinancialStatisticsResponse> {
    return axiosInstance.get("/student/dashboard/financial-stats");
  },

  getExam(): Promise<StudentExamStatisticsResponse> {
    return axiosInstance.get("/student/dashboard/exam-stats");
  },
};

export default StudentDashboardService;
