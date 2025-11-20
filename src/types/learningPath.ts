export type PathwayStatus = 'not_started' | 'in_progress' | 'completed';

export interface PathwayItem {
    id: string;
    semester: string; // e.g., "Lớp 10 - Kỳ 1"
    subjectName: string;
    courseId?: string; // Link to actual course if available
    status: PathwayStatus;
    priority: 'Must Have' | 'Recommended' | 'Optional';
    reason?: string; // Tại sao nên học môn này
}

export interface LearningPath {
    id: string;
    studentId: string;
    majorGoal: string;
    targetUniversity?: string;
    items: PathwayItem[];
    createdAt: string;
    overallProgress: number;
}

export interface MajorOption {
    value: string;
    label: string;
    description: string;
}