const mockMCQ = [
    {
        id: 1,
        text: "The cat is sleeping ______ the table.",
        options: [
            { id: 'a', text: 'on' },
            { id: 'b', text: 'in' },
            { id: 'c', text: 'at' },
            { id: 'd', text: 'under' }
        ],
        correctAnswer: 'a',
        explanation: "The preposition 'on' is used to denote a position on a surface. The cat is on the surface of the table."
    },
    {
        id: 2,
        text: "She _______ to the store every day.",
        options: [
            { id: 'a', text: 'go' },
            { id: 'b', text: 'goes' },
            { id: 'c', text: 'is going' },
            { id: 'd', text: 'went' }
        ],
        correctAnswer: 'b',
        explanation: "For third-person singular subjects in the simple present tense, the verb ends with '-es'."
    },
    {
        id: 3,
        text: "I have been waiting for you _______ two hours.",
        options: [
            { id: 'a', text: 'since' },
            { id: 'b', text: 'for' },
            { id: 'c', text: 'at' },
            { id: 'd', text: 'from' }
        ],
        correctAnswer: 'b',
        explanation: "The preposition 'for' is used with periods of time, indicating duration."
    },
    {
        id: 4,
        text: "By the time we arrived, the movie _______ already started.",
        options: [
            { id: 'a', text: 'has' },
            { id: 'b', text: 'had' },
            { id: 'c', text: 'have' },
            { id: 'd', text: 'was' }
        ],
        correctAnswer: 'b',
        explanation: "This is an example of past perfect tense, used for an action completed before another action in the past."
    },
    {
        id: 5,
        text: "If I _______ you, I would apologize immediately.",
        options: [
            { id: 'a', text: 'am' },
            { id: 'b', text: 'was' },
            { id: 'c', text: 'were' },
            { id: 'd', text: 'be' }
        ],
        correctAnswer: 'c',
        explanation: "This is a hypothetical situation using the subjunctive mood 'were' instead of 'was'."
    },
    {
        id: 6,
        text: "The company _______ its best employees at the annual gala.",
        options: [
            { id: 'a', text: 'honor' },
            { id: 'b', text: 'honors' },
            { id: 'c', text: 'honoring' },
            { id: 'd', text: 'honored' }
        ],
        correctAnswer: 'b',
        explanation: "Third-person singular subjects take the '-s' form of the verb in simple present tense."
    },
    {
        id: 7,
        text: "Neither of the boys _______ admitted to breaking the window.",
        options: [
            { id: 'a', text: 'has' },
            { id: 'b', text: 'have' },
            { id: 'c', text: 'is' },
            { id: 'd', text: 'are' }
        ],
        correctAnswer: 'a',
        explanation: "'Neither' is singular and takes a singular verb. 'Neither of' requires 'has' not 'have'."
    },
    {
        id: 8,
        text: "The teacher asked if _______ understood the lesson.",
        options: [
            { id: 'a', text: 'someone' },
            { id: 'b', text: 'anyone' },
            { id: 'c', text: 'no one' },
            { id: 'd', text: 'everyone' }
        ],
        correctAnswer: 'd',
        explanation: "The sentence is in indirect speech and refers to all students, so 'everyone' is the correct choice."
    }
];

const mockFRQ = [
    { id: "101", text: "Explain the main theme of 'To Kill a Mockingbird'." },
    { id: "102", text: "Describe the process of photosynthesis." },
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
