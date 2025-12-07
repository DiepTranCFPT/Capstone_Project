export interface ChartData {
    id: string;
    date: string;
    totalUsers: number;
    totalStudents: number;
    totalTeachers: number;
    totalParents: number;
    newStudents: number;
    newTeachers: number;
    dailyActiveUsers: number;
}

export interface DashboardStats {
    totalUsers: number;
    totalStudents: number;
    totalTeachers: number;
    totalParents: number;
    chartData: ChartData[];
}

export interface DashboardStatsResponse {
    code: number;
    message: string;
    data: DashboardStats;
}

// Exam Stats Types

export interface TopPerformingExam {
    templateId: string;
    title: string;
    attempts: number;
    avgScore: number;
    revenue: number;
}

export interface TeacherExamStats {
    totalStudentsTested: number;
    totalExamAttempts: number;
    estimatedRevenue: number;
    pendingManualReviews: number;
    averageRating: number;
    totalQuestions: number;
    questionsByTopic: Record<string, number>;
    topPerformingExams: TopPerformingExam[];
}

export interface TeacherExamStatsResponse {
    code: number;
    message: string;
    data: TeacherExamStats;
}

export interface RecentAttempt {
    attemptId: string;
    title: string;
    examId: string;
    doneBy: string;
    score: number;
    startTime: string; // ISO Date string
    endTime: string;   // ISO Date string
    status: string;
    rating: number;
}

export interface StudentExamStats {
    totalExamsTaken: number;
    averageScore: number;
    examsInProgress: number;
    topicPerformance: Record<string, number>;
    recommendedTopic: string;
    recentAttempts: RecentAttempt[];
}

export interface StudentExamStatsResponse {
    code: number;
    message: string;
    data: StudentExamStats;
}

// Parent uses the same structure as Student for their children
export type ParentExamStatsResponse = StudentExamStatsResponse;

export interface TopPopularExam {
    templateId: string;
    title: string;
    teacherName: string;
    attemptCount: number;
    averageScore: number;
}

export interface AdminExamStats {
    totalAttempts: number;
    completedAttempts: number;
    pendingAttempts: number;
    completionRate: number;
    totalQuestions: number;
    questionsBySubject: Record<string, number>;
    questionsByDifficulty: Record<string, number>;
    topPopularExams: TopPopularExam[];
    manualReviewCount: number;
}

export interface AdminExamStatsResponse {
    code: number;
    message: string;
    data: AdminExamStats;
}
