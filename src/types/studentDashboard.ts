import type { ApiResponse } from "./api";

export interface StudentOverallStatistics {
  totalCoursesEnrolled: number;
  totalCompletedCourses: number;
  totalPendingAssignments: number;
}

export interface StudentFinancialStatistics {
  totalSpent: number;
  totalRegisteredMaterials: number;
  currentBalance: number;
  spendingBySubject: Record<string, number>;
  spendingByType: Record<string, number>;
  monthlySpending: Record<string, number>;
  recentPurchases: Array<{
    materialId: string;
    title: string;
    subjectName: string;
    typeName: string;
    price: number;
    purchasedDate: string;
    authorName: string;
    fileImage: string;
  }>;
}

export interface StudentExamStatistics {
  totalExamsTaken: number;
  averageScore: number;
  examsInProgress: number;
  topicPerformance: Record<string, number>;
  recommendedTopic: string;
  recommend: string; // AI recommendation for the student
  recentAttempts: Array<{
    attemptId: string;
    title: string;
    examId: string;
    doneBy: string;
    score: number;
    startTime: string;
    endTime: string;
    status: string;
    rating: number | null;
  }>;
}

//  ApiResponse wrapper
export type StudentOverallStatisticsResponse = ApiResponse<StudentOverallStatistics>;
export type StudentFinancialStatisticsResponse = ApiResponse<StudentFinancialStatistics>;
export type StudentExamStatisticsResponse = ApiResponse<StudentExamStatistics>;
export type StudentRecommendResponse = ApiResponse<string>; // Returns recommendation text directly
