export interface Tutor {
    id: string;
    name: string;
    avatar: string;
    subjects: string[];
    rating: number;
    bio: string;
    hourlyRate: number;
}

export interface Availability {
    tutorId: string;
    date: string; // YYYY-MM-DD
    timeSlots: {
        startTime: string; // HH:mm
        endTime: string;   // HH:mm
        isBooked: boolean;
    }[];
}

export interface Booking {
    id: string;
    studentId: string;
    tutorId: string;
    time: string; // ISO 8601 format
    status: 'upcoming' | 'completed' | 'cancelled';
}
