export interface MockTestData {
  key: string;
  name: string;
  course: string;
  questions: number;
  type: string;
  duration: string;
  attempts: number;
  status: "Published" | "Draft";
}
