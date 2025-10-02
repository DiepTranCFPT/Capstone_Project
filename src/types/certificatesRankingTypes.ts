export interface Certificate {
  id: string;
  studentName: string;
  course: string;
  title: string;
  issueDate: string;
  status: "Active" | "Inactive";
}

export interface Ranking {
  rank: number;
  studentName: string;
  subject: string;
  score: string;
  timeTaken: string;
  attemptDate: string;
}
