export interface AssignedStudent {
    id: string;
    name: string;
    avatar: string;
    apGoal: string; // e.g., 'Computer Science, Physics'
    overallProgress: number;
    lastActivity: string;
    status: 'on_track' | 'behind' | 'at_risk';
}

export interface Consultation {
    id: string;
    studentName: string;
    studentId: string;
    date: string;
    time: string;
    status: 'upcoming' | 'completed' | 'cancelled';
    notes?: string;
}

export interface APRecommendation {
    subject: string;
    reason: string;
    category: string;
}