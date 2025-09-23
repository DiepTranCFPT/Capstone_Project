// src/types/profile.ts

export interface Subject {
  name: string;
  progress: number;
  strength: string;
  weakness: string;
}

export interface TestResult {
  subject: string;
  score: number;
  date: string;
}

export interface UserProfile {
  name: string;
  currentLevel: string;
  careerGoal: string;
  subjects: Subject[];
  testResults: TestResult[];
}
