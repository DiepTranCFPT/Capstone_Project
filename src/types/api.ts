
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// Kiểu dùng cho các API trả về dữ liệu phân trang (page, size, ...)
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageable?: {
    pageNumber?: number;
  };
}