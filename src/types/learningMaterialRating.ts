// src/types/learningMaterialRating.ts
// Định nghĩa type/interface dùng chung cho API đánh giá Learning Material

export interface LearningMaterialRatingPayload {
  // Id của learning material
  materialId: string;
  // Id học sinh / user đánh giá
  studentId: string;
  // Điểm đánh giá, ví dụ: 1 - 5
  rating: number;
  // Nhận xét thêm của học sinh (tuỳ chọn)
  comment?: string;
  // Cho phép mở rộng thêm field nếu BE có
  [key: string]: unknown;
}

export interface LearningMaterialRating {
  id?: string;
  materialId: string;
  studentId: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
  // Có thể có thêm field khác do BE trả về
  [key: string]: unknown;
}

export interface LearningMaterialRatingStatistics {
  materialId: string;
  averageRating: number;
  totalRatings: number;
  // Có thể mở rộng thêm các field như: 1StarCount, 2StarCount,...
  [key: string]: unknown;
}



