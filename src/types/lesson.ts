// src/types/lesson.ts

export interface Lesson {
    id: string;
    title?: string;
    name?: string;
    file?: string;
    url?: string;
    video?: string;
    description?: string;
    learningMaterialId: string;
    order?: number; // Thứ tự hiển thị trong learning material
    duration?: number; // Thời lượng bài học (phút, giây, tùy theo backend)
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface LessonQuery {
    search?: string; // Tìm kiếm theo title hoặc description
    learningMaterialId?: string; // Lọc theo learning material
    page?: number;
    limit?: number;
    sortBy?: string; // ví dụ: 'createdAt' | 'title'
    sortOrder?: 'asc' | 'desc';
  }
  
  export interface PageInfo<T> {
    data: T[];
    total: number; // Tổng số item
    page: number; // Trang hiện tại
    limit: number; // Số item mỗi trang
  }

  export interface LessonVideoAsset {
    id: string;
    name: string;
    url: string;
    thumbnail?: string;
    duration?: number;
    [key: string]: unknown;
  }
  