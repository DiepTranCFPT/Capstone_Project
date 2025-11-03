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
    {
        id: '1',
        title: "English Language Test",
        level: "Level B1",
        totalQuestions: 50,
        parts: 7,
        duration: 60,
        description: "Test your English language skills",
        examTypeId: '1', // Assuming mock types
        subjectId: '1',
        teacherId: '1',
        maxAttempts: 3,
        status: "published",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
        tokenCost: 10,
        questions: [],
        category: "English",
        teacherName: "John Doe",
        rating: 4.5,
        subject: "English",
        attempts: 1200
    },
    {
        id: '2',
        title: "Advanced Math",
        level: "Level C1",
        totalQuestions: 40,
        parts: 5,
        duration: 90,
        description: "",
        examTypeId: '2',
        subjectId: '2',
        teacherId: '2',
        maxAttempts: 2,
        status: "published",
        createdAt: "2025-01-02T00:00:00Z",
        updatedAt: "2025-01-02T00:00:00Z",
        tokenCost: 15,
        questions: [],
        category: "Math",
        teacherName: "Jane Smith",
        rating: 4.2,
        subject: "Math",
        attempts: 850
    },
    {
        id: '3',
        title: "History of Arts",
        level: "Level A2",
        totalQuestions: 60,
        parts: 8,
        duration: 45,
        description: "",
        examTypeId: '1',
        subjectId: '3',
        teacherId: '3',
        maxAttempts: 3,
        status: "published",
        createdAt: "2025-01-03T00:00:00Z",
        updatedAt: "2025-01-03T00:00:00Z",
        tokenCost: 8,
        questions: [],
        category: "History",
        teacherName: "Peter Jones",
        rating: 3.9,
        subject: "History",
        attempts: 1500
    },
    {
        id: '4',
        title: "Physics Olympiad Prep",
        level: "Level C2",
        totalQuestions: 30,
        parts: 4,
        duration: 120,
        description: "",
        examTypeId: '2',
        subjectId: '4',
        teacherId: '4',
        maxAttempts: 1,
        status: "published",
        createdAt: "2025-01-04T00:00:00Z",
        updatedAt: "2025-01-04T00:00:00Z",
        tokenCost: 20,
        questions: [],
        category: "Physics",
        teacherName: "Alice Brown",
        rating: 4.8,
        subject: "Physics",
        attempts: 600
    },
    {
        id: '5',
        title: "Biology Basics",
        level: "Level A1",
        totalQuestions: 70,
        parts: 10,
        duration: 50,
        description: "",
        examTypeId: '1',
        subjectId: '5',
        teacherId: '5',
        maxAttempts: 3,
        status: "published",
        createdAt: "2025-01-05T00:00:00Z",
        updatedAt: "2025-01-05T00:00:00Z",
        tokenCost: 12,
        questions: [],
        category: "Biology",
        teacherName: "Bob White",
        rating: 4.1,
        subject: "Biology",
        attempts: 950
    },
    {
        id: '6',
        title: "Chemistry Exam",
        level: "Level B2",
        totalQuestions: 45,
        parts: 6,
        duration: 75,
        description: "",
        examTypeId: '2',
        subjectId: '6',
        teacherId: '6',
        maxAttempts: 2,
        status: "published",
        createdAt: "2025-01-06T00:00:00Z",
        updatedAt: "2025-01-06T00:00:00Z",
        tokenCost: 13,
        questions: [],
        category: "Chemistry",
        teacherName: "Charlie Green",
        rating: 4.3,
        subject: "Chemistry",
        attempts: 700
    },
    {
        id: '7',
        title: "Music Theory",
        level: "Level B1",
        totalQuestions: 55,
        parts: 7,
        duration: 60,
        description: "",
        examTypeId: '1',
        subjectId: '7',
        teacherId: '7',
        maxAttempts: 3,
        status: "published",
        createdAt: "2025-01-07T00:00:00Z",
        updatedAt: "2025-01-07T00:00:00Z",
        tokenCost: 9,
        questions: [],
        category: "Music",
        teacherName: "Diana Blue",
        rating: 4.0,
        subject: "Music",
        attempts: 1100
    },
    {
        id: '8',
        title: "General Knowledge",
        level: "Level A2",
        totalQuestions: 100,
        parts: 10,
        duration: 60,
        description: "",
        examTypeId: '1',
        subjectId: '8',
        teacherId: '8',
        maxAttempts: 3,
        status: "published",
        createdAt: "2025-01-08T00:00:00Z",
        updatedAt: "2025-01-08T00:00:00Z",
        tokenCost: 7,
        questions: [],
        category: "Art",
        teacherName: "Eve Black",
        rating: 3.7,
        subject: "Art",
        attempts: 1300
    },
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
        id: '1',
        title: "English Language Test",
        date: "2025-09-20",
        score: 85,
        mcqTime: 25,
        frqTime: 35,
        apScore: 4,
        progress: 75
    },
    {
        id: '2',
        title: "Advanced Math",
        date: "2025-09-18",
        score: 92,
        mcqTime: 40,
        frqTime: 50,
        apScore: 5,
        progress: 90
    },
];

export { mockMCQ, mockFRQ, exams, advancedData, completedTests };
