
export interface FRQ {
    id: number;
    text: string;
};

export interface Option {
    id: string;
    text: string;
};

export interface Question {
    id: number;
    text: string;
    options: Option[];
};

export interface Exam {
    id: number;
    title: string;
    level: string;
    questions: number;
    parts: number;
    duration: number;
};

export interface CompletedTest {
    id: number;
    title: string;
    date: string;
    score: number;
    mcqTime: number;
    frqTime: number;
    apScore: number;
    progress: number;
}
