export interface AiExamAskRequest {
    attemptId: string;
    questionContent: string;
    studentAnswer: string;
    studentAsking: string;
    doneBy: string;
}

export interface AiStudentDashboardRequest {
    message: string;
}
