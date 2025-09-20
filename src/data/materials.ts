import type { Material } from "~/types/material";

export const materials: Material[] = [
  {
    id: 1,
    title: "AP 2-D Art and Design",
    topic: "Arts",
    subject: "Design",
    free: true,
    price: 0,
    students: 50,
    lessons: 8,
    views: "12k",
    image: "https://placehold.co/247x176",
    description:
      "Khóa học này giúp học sinh phát triển kỹ năng thiết kế đồ họa 2D, từ vẽ tay cơ bản đến kỹ thuật số, với nhiều dự án sáng tạo để xây dựng portfolio cá nhân.",
  },
  {
    id: 2,
    title: "AP English Language and Composition",
    topic: "English",
    subject: "Language",
    free: false,
    price: 59,
    students: 50,
    lessons: 8,
    views: "12k",
    image: "https://placehold.co/247x176",
    description:
      "Khóa học tập trung vào phân tích văn bản, cải thiện kỹ năng viết luận và rèn luyện khả năng đọc hiểu, chuẩn bị cho kỳ thi AP English.",
  },
  {
    id: 3,
    title: "AP Computer Science A",
    topic: "Computer Science",
    subject: "Programming",
    free: false,
    price: 59,
    students: 50,
    lessons: 8,
    views: "12k",
    image: "https://placehold.co/247x176",
    description:
      "Khóa học giới thiệu lập trình Java và các khái niệm khoa học máy tính cốt lõi, bao gồm cấu trúc dữ liệu, thuật toán và giải quyết vấn đề.",
  },
];
