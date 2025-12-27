// Type definitions for Percentage Configuration API
// Backend returns object directly (not wrapped in ApiResponse)

export interface PercentageConfig {
    id: string;
    percentTeacherVerified: number;    // Verified teacher percentage (decimal: 0.7 = 70%)
    percentAdminVerified: number;      // Admin cut from verified teacher
    percentTeacherUnverified: number;  // Unverified teacher percentage (decimal: 0.8 = 80%)
    percentAdminUnverified: number;    // Admin cut from unverified teacher
}

export interface UpdatePercentageConfigRequest {
    percentTeacher: number;
    percentTeacherUnverified: number;
}
