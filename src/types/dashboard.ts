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
