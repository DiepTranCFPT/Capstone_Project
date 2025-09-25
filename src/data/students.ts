import type { Student } from "~/types/student";

export const students: Student[] = [
  {
    id: "1",
    name: "Bubu",
    email: "student@gmail.com",
    phone: "0123455677",
    parentName: "Dudu",
    coursesEnrolled: ["Try Hard"],
    progress: 70,
    status: "active",
    avatarUrl: "https://i.pravatar.cc/100?img=5", 
    enrollmentDate: "2025-01-15",
    notes: "Học viên chăm chỉ",
  },
  {
    id: "2",
    name: "Lala",
    email: "lala@gmail.com",
    phone: "0987654321",
    parentName: "Momo",
    coursesEnrolled: ["Math Basics", "English Advanced"],
    progress: 45,
    status: "pending",
    avatarUrl: "https://i.pravatar.cc/100?img=10",
    dateOfBirth: "2007-09-20",
    gpa: 3.2,
  },
];
