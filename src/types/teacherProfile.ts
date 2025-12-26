export interface TeacherProfilePayload {
    dateOfBirth: string; // YYYY-MM-DD
    qualification: string;
    specialization: string;
    experience: string;
    biography: string;
    certificateUrls: string[];
}

export interface TeacherProfileData {
    id: string;
    dateOfBirth: string;
    qualification: string;
    specialization: string;
    experience: string;
    biography: string;
    rating: number;
    certificateUrls: string[];
    isVerified: boolean;
}

export interface UnverifiedTeacherProfile {
    // User info - có thể nested trong object user hoặc flatten
    id: string; // User ID
    email: string;
    firstName: string;
    lastName: string;
    imgUrl: string;
    dob: string;
    roles: string[];
    // Teacher profile data
    teacherProfile: TeacherProfileData;
    // Optional: latest AI review
    latestReview?: AiReviewResponse;
    // For new API structure where user is nested
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        imgUrl: string;
        dob: string;
        roles: string[];
    };
}

// Helper interface for statistics (giữ lại cho UI dashboard nếu cần)
export interface TeacherStat {
    label: string;
    value: number | string;
    icon: string;
    color: string;
}

// Interface for verification request response
export interface VerificationRequest {
    id: string;
    userId: string;
    teacherId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    note?: string;
    reviewedById?: string;
    reviewedAt?: string;
    createdAt: string;
    updatedAt: string;
}

// Interface for AI review response
export interface AiReviewResponse {
    id: string;
    syllabusAlignment: number;
    conceptAccuracy: number;
    difficultyFit: number;
    explanationQuality: number;
    recommendation: string;
    feedback: string;
    reviewerType: string;
    latest: boolean;
    createdAt?: string;
}