import type { QuestionBankItem } from "~/types/test";
import type { StudentSubmission, Teacher } from "~/types/teacher";

export const mockQuestionBank: QuestionBankItem[] = [
    {
        id: 'qb1',
        text: 'What is the powerhouse of the cell?',
        type: 'mcq',
        subject: 'Biology',
        difficulty: 'easy',
        createdBy: 'Jane Smith',
        createdAt: '2025-09-20',
        options: [
            { text: 'Nucleus', isCorrect: false },
            { text: 'Ribosome', isCorrect: false },
            { text: 'Mitochondria', isCorrect: true },
            { text: 'Cell Wall', isCorrect: false },
        ]
    },
    {
        id: 'qb2',
        text: 'Explain Newton\'s First Law of Motion.',
        type: 'frq',
        subject: 'Physics',
        difficulty: 'medium',
        createdBy: 'Jane Smith',
        createdAt: '2025-09-21',
        options: [
            { text: 'Newton\'s First Law of Motion', isCorrect: true },
            { text: 'Newton\'s Second Law of Motion', isCorrect: false },
            { text: 'Newton\'s Third Law of Motion', isCorrect: false },
            { text: 'Newton\'s Fourth Law of Motion', isCorrect: false },
        ]
    },
    {
        id: 'qb3',
        text: 'What is the value of x in the equation 2x + 3 = 11?',
        type: 'mcq',
        subject: 'Mathematics',
        difficulty: 'easy',
        createdBy: 'John Doe',
        createdAt: '2025-09-22',
        options: [
            { text: '3', isCorrect: false },
            { text: '4', isCorrect: true },
            { text: '5', isCorrect: false },
            { text: '6', isCorrect: false },
        ]
    },
    {
        id: 'qb4',
        text: 'Describe the main causes of World War II.',
        type: 'frq',
        subject: 'History',
        difficulty: 'hard',
        createdBy: 'Jane Smith',
        createdAt: '2025-09-23',
        options: [
            { text: 'The Cold War', isCorrect: false },
            { text: 'The Great Depression', isCorrect: false },
            { text: 'The Second World War', isCorrect: true },
            { text: 'The Korean War', isCorrect: false },
        ]
    }
];



// Dữ liệu bài nộp của học sinh
export const mockSubmissions: StudentSubmission[] = [
    {
        id: 'sub1',
        student: { id: '1', firstName: 'Nguyen Van A', imgUrl: 'https://i.pravatar.cc/150?img=1' },
        exam: { id: '1', title: 'Mid-term Physics Exam', duration: 0, totalQuestions: 0 },
        submittedAt: '2025-09-28',
        status: 'pending_grading',
        frqAnswers: [
            {
                questionId: 'qb2',
                questionText: "Explain Newton's First Law of Motion.",
                answerText: "Newton's First Law states that an object will remain at rest or in uniform motion in a straight line unless acted upon by an external force. It is also known as the law of inertia."
            }
        ]
    },
    {
        id: 'sub2',
        student: { id: '2', firstName: 'Tran Thi B', imgUrl: 'https://i.pravatar.cc/150?img=2' },
        exam: { id: '2', title: 'History Essay', duration: 0, totalQuestions: 0 },
        submittedAt: '2025-09-27',
        status: 'pending_grading',
        frqAnswers: [
            {
                questionId: 'qb4',
                questionText: 'Describe the main causes of World War II.',
                answerText: "The main causes of WWII include the Treaty of Versailles, the rise of fascism in Italy and Nazism in Germany, Japanese expansionism, and the failure of the League of Nations."
            }
        ]
    },
    {
        id: 'sub3',
        student: { id: '3', firstName: 'Le Van C', imgUrl: 'https://i.pravatar.cc/150?img=3' },
        exam: { id: '1', title: 'Mid-term Physics Exam', duration: 0, totalQuestions: 0 },
        submittedAt: '2025-09-26',
        status: 'graded',
        score: 88,
    },
];

export const teachers: Teacher[] = [
  {
    id: "T001",
    fullName: "John Smith",
    email: "john@ap.edu",
    subject: "Math, Physics",
    coursesAssigned: "3 Courses",
    status: "Active",
    createdAt: "2025-01-10",
  },
];
