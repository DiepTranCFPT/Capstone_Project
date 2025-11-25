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
    id: string; // User ID
    email: string;
    firstName: string;
    lastName: string;
    imgUrl: string;
    dob: string;
    roles: string[];
    teacherProfile: TeacherProfileData;
}

// Helper interface for statistics (giữ lại cho UI dashboard nếu cần)
export interface TeacherStat {
    label: string;
    value: number | string;
    icon: string;
    color: string;
}