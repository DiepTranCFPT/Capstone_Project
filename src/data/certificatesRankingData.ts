import type { Certificate, Ranking } from "~/types/certificatesRankingTypes";


export const certificates: Certificate[] = [
  {
    id: "C001",
    studentName: "John Smith",
    course: "Math",
    title: "Completion",
    issueDate: "2025-01-15",
    status: "Active",
  },
];

export const rankings: Ranking[] = [
  {
    rank: 1,
    studentName: "John Smith",
    subject: "Math Mock Test",
    score: "95%",
    timeTaken: "1h 20m",
    attemptDate: "2025-01-12",
  },
  {
    rank: 2,
    studentName: "Alice Brown",
    subject: "Physics Mock Test",
    score: "90%",
    timeTaken: "1h 35m",
    attemptDate: "2025-01-13",
  },
];
