export interface AiExamAskRequest {
    attemptId: string;
    questionContent: string;
    questionContext?: string;
    studentAnswer: string;
    studentAsking: string;
    doneBy: string;
    answerContents: string[];
}

export interface AiStudentDashboardRequest {
    message: string;
}
