import type { UserProfile } from "~/types/profile";


export const mockProfile: UserProfile = {
  name: "Nguyễn Văn A",
  currentLevel: "Trung học phổ thông",
  careerGoal: "Y khoa",
  subjects: [
    { name: "Toán", progress: 80, strength: "Giải nhanh", weakness: "Chứng minh hình học" },
    { name: "Vật lý", progress: 65, strength: "Công thức", weakness: "Bài tập nâng cao" },
    { name: "Hóa học", progress: 50, strength: "Hữu cơ", weakness: "Vô cơ" },
  ],
  testResults: [
    { subject: "Toán", score: 85, date: "2025-05-12" },
    { subject: "Vật lý", score: 70, date: "2025-06-05" },
    { subject: "Hóa học", score: 60, date: "2025-07-20" },
  ],
};
