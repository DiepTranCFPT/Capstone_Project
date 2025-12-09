import type { ApiResponse } from "./api";

export interface StudentOverallStatistics {
    totalCoursesEnrolled: number;
    totalCompletedCourses: number;
    totalPendingAssignments: number;
  }
  
  export interface StudentFinancialStatistics {
    totalPaid: number;
    totalPending: number;
    totalRefunded: number;
  }
  
  export interface StudentExamStatistics {
    examTaken: number;
    passed: number;
    failed: number;
    averageScore: number;
  }
  
  //  ApiResponse wrapper
  export type StudentOverallStatisticsResponse = ApiResponse<StudentOverallStatistics>;
  export type StudentFinancialStatisticsResponse = ApiResponse<StudentFinancialStatistics>;
  export type StudentExamStatisticsResponse = ApiResponse<StudentExamStatistics>;
  