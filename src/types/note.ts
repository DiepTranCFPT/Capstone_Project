// src/types/note.ts
// Định nghĩa type/interface dùng chung cho API ghi chú (notes)

export interface NotePayload {
  // Nội dung ghi chú (BE yêu cầu field "description")
  description: string;
  // Id bài học / lesson mà ghi chú thuộc về
  lessonId: string;
  // Id user tạo ghi chú
  userId: string;
  // Các field mở rộng khác (ví dụ: thời gian trong video, tiêu đề, ...)
  [key: string]: unknown;
}

export interface Note extends NotePayload {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  // Cho phép BE trả thêm field khác
  [key: string]: unknown;
}


