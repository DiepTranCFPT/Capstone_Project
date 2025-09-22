const mockMCQ = [
    { id: 1, text: "The cat is sleeping ______ the table.", options: [{ id: 'a', text: 'on' }, { id: 'b', text: 'in' }, { id: 'c', text: 'at' }] },
    { id: 2, text: "She _______ to the store every day.", options: [{ id: 'a', text: 'go' }, { id: 'b', text: 'goes' }, { id: 'c', text: 'is going' }] },
    { id: 3, text: "I have been waiting for you _______ two hours.", options: [{ id: 'a', text: 'since' }, { id: 'b', text: 'for' }, { id: 'c', text: 'at' }] },
    // Thêm nhiều câu hỏi ở đây
];

const mockFRQ = [
    { id: 101, text: "Explain the main theme of 'To Kill a Mockingbird'." },
    { id: 102, text: "Describe the process of photosynthesis." },
];

const exams = [
    // Dữ liệu giả lập, bạn có thể thay bằng API call
    { id: 1, title: "English Language Test", level: "Level B1", questions: 50, parts: 7, duration: 60, category: "English" },
    { id: 2, title: "Advanced Mathematics", level: "Level C1", questions: 40, parts: 5, duration: 90, category: "Math" },
    { id: 3, title: "History of Arts", level: "Level A2", questions: 60, parts: 8, duration: 45, category: "History" },
    { id: 4, title: "Physics Olympiad Prep", level: "Level C2", questions: 30, parts: 4, duration: 120, category: "Physics" },
    { id: 5, title: "Biology Basics", level: "Level A1", questions: 70, parts: 10, duration: 50, category: "Biology" },
    { id: 6, title: "Chemistry Exam", level: "Level B2", questions: 45, parts: 6, duration: 75, category: "Chemistry" },
    { id: 7, title: "Music Theory", level: "Level B1", questions: 55, parts: 7, duration: 60, category: "Music" },
    { id: 8, title: "General Knowledge", level: "Level A2", questions: 100, parts: 10, duration: 60, category: "Art" },
];

// Dữ liệu giả lập cho báo cáo nâng cao
const advancedData = {
    performanceByTopic: [
        { topic: 'Grammar', accuracy: 85 },
        { topic: 'Vocabulary', accuracy: 92 },
        { topic: 'Reading Comprehension', accuracy: 75 },
    ],
    comparison: {
        userScore: 80,
        averageScore: 72,
    },
    suggestions: [
        "Focus on verb tenses and conditionals in Grammar.",
        "Practice more reading passages about scientific topics.",
    ],
    detailedAnswers: [
        {
            question: "1. The cat is sleeping ______ the table.",
            userAnswer: "in",
            correctAnswer: "on",
            explanation: "The preposition 'on' is used to denote a position on a surface. The cat is on the surface of the table."
        },
        {
            question: "2. She _______ to the store every day.",
            userAnswer: "goes",
            correctAnswer: "goes",
            explanation: "For third-person singular subjects in the simple present tense, the verb ends with '-es'."
        }
    ]
};

const completedTests = [
    {
        id: 1,
        title: "English Language Test",
        date: "2025-09-20",
        score: 85,
        mcqTime: 25,
        frqTime: 35,
        apScore: 4,
        progress: 75
    },
    {
        id: 2,
        title: "Advanced Mathematics",
        date: "2025-09-18",
        score: 92,
        mcqTime: 40,
        frqTime: 50,
        apScore: 5,
        progress: 90
    },
];

export { mockMCQ, mockFRQ, exams, advancedData, completedTests };
