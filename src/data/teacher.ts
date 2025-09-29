import type { QuestionBankItem } from "~/types/test";

export const mockQuestionBank: QuestionBankItem[] = [
    {
        id: 'qb1',
        text: 'What is the powerhouse of the cell?',
        type: 'mcq',
        subject: 'Biology',
        topic: 'Cell Structure',
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
        topic: 'Mechanics',
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
        topic: 'Algebra',
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
        topic: '20th Century History',
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
