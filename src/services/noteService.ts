// src/services/noteService.ts
import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type { Note, NotePayload } from "~/types/note";

const NoteService = {
  // POST /api/notes
  // Tạo ghi chú mới
  createNote(payload: NotePayload): Promise<AxiosResponse<ApiResponse<Note>>> {
    return axiosInstance.post(`/api/notes`, payload);
  },

  // PUT /api/notes/{noteId}
  // Cập nhật ghi chú
  updateNote(
    noteId: string,
    payload: Partial<NotePayload>
  ): Promise<AxiosResponse<ApiResponse<Note>>> {
    return axiosInstance.put(`/api/notes/${noteId}`, payload);
  },

  // DELETE /api/notes/{noteId}
  // Xoá ghi chú
  deleteNote(noteId: string): Promise<AxiosResponse<ApiResponse<null>>> {
    return axiosInstance.delete(`/api/notes/${noteId}`);
  },

  // GET /api/notes/my-notes
  // Lấy ghi chú của user hiện tại
  getMyNotes(): Promise<AxiosResponse<ApiResponse<Note[]>>> {
    return axiosInstance.get(`/api/notes/my-notes`);
  },

  // GET /api/notes/lesson/{lessonId}
  // Lấy tất cả ghi chú của một lesson
  getNotesByLesson(
    lessonId: string
  ): Promise<AxiosResponse<ApiResponse<Note[]>>> {
    return axiosInstance.get(`/api/notes/lesson/${lessonId}`);
  },

  // GET /api/notes/lesson/{lessonId}/user/{userId}
  // Lấy ghi chú của một user cho một lesson
  getNotesByLessonAndUser(
    lessonId: string,
    userId: string
  ): Promise<AxiosResponse<ApiResponse<Note[]>>> {
    return axiosInstance.get(`/api/notes/lesson/${lessonId}/user/${userId}`);
  },
};

export default NoteService;


