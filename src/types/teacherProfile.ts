// Teacher profile specific types
export interface TeacherProfile {
    id: string;
    teacherId: string;
    qualifications: string[];
    teachingSubjects: string[];
    yearsOfExperience: number;
    certifications: TeacherCertification[];
    bio: string;
    hourlyRate: number;
    rating: number;
    totalStudents: number;
    completedSessions: number;
    createdExams: number;
    linkedInProfile?: string;
    portfolio?: string;
    teachingPhilosophy?: string;
    preferredLocation: string;
    availabilityStatus: 'available' | 'busy' | 'unavailable';
}

export interface TeacherCertification {
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    verificationUrl?: string;
}

export interface TeacherStat {
    label: string;
    value: number | string;
    icon: string;
    color: string;
}

// Edit profile form for teacher
export interface TeacherEditProfileRequest {
    firstName: string;
    lastName: string;
    dob: string;
    qualifications: string[];
    teachingSubjects: string[];
    yearsOfExperience: number;
    bio: string;
    hourlyRate?: number;
    preferredLocation: string;
    linkedInProfile?: string;
    portfolio?: string;
    teachingPhilosophy?: string;
}
