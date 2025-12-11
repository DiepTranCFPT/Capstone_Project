// src/services/teacherRatingService.ts
import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse, PaginatedResponse } from "~/types/api";
import type {
  TeacherRating,
  TeacherRatingPayload,
  TeacherRatingStatistics,
} from "~/types/teacherRating";

const TeacherRatingService = {
  // POST /api/teacher-ratings
  // Tạo đánh giá mới cho giáo viên
  createRating(
    payload: TeacherRatingPayload
  ): Promise<AxiosResponse<ApiResponse<TeacherRating>>> {
    return axiosInstance.post(`/api/teacher-ratings`, payload);
  },

  // GET /api/teacher-ratings/teacher/{teacherId}
  // Lấy tất cả đánh giá của một giáo viên
  getRatingsByTeacher(
    teacherId: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = "createdAt",
    sortDir: string = "DESC"
  ): Promise<
    AxiosResponse<ApiResponse<PaginatedResponse<TeacherRating>>>
  > {
    return axiosInstance.get(`/api/teacher-ratings/teacher/${teacherId}`, {
      params: {
        page,
        size,
        sortBy,
        sortDir,
      },
    });
  },

  // GET /api/teacher-ratings/teacher/{teacherId}/user/{userId}
  // Lấy đánh giá của một người dùng cụ thể cho một giáo viên
  async getRatingByTeacherAndStudent(
    teacherId: string,
    userId: string
  ): Promise<AxiosResponse<ApiResponse<TeacherRating>>> {
    try {
      // BE mới: endpoint dùng "user/{userId}"
      return await axiosInstance.get(
        `/api/teacher-ratings/teacher/${teacherId}/user/${userId}`
      );
    } catch (error: unknown) {
      // Nếu BE chưa cập nhật và còn dùng "student/{studentId}", fallback để tránh lỗi 404/400
      const status =
        typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { status?: number } }).response?.status
          : undefined;
      if (status === 404 || status === 400) {
        return axiosInstance.get(
          `/api/teacher-ratings/teacher/${teacherId}/student/${userId}`
        );
      }
      throw error;
    }
  },

  // GET /api/teacher-ratings/teacher/{teacherId}/statistics
  // Lấy thống kê đánh giá của một giáo viên
  getStatisticsByTeacher(
    teacherId: string
  ): Promise<AxiosResponse<ApiResponse<TeacherRatingStatistics>>> {
    return axiosInstance.get(
      `/api/teacher-ratings/teacher/${teacherId}/statistics`
    );
  },

  // GET /api/teacher-ratings/avg/{teacherId}
  // Lấy điểm đánh giá trung bình của một giáo viên
  getAverageRating(
    teacherId: string
  ): Promise<AxiosResponse<ApiResponse<number>>> {
    return axiosInstance.get(`/api/teacher-ratings/avg/${teacherId}`);
  },

  // GET /api/teacher-ratings/student/{studentId}
  // Lấy danh sách đánh giá mà một học sinh đã đánh giá cho các giáo viên
  getRatingsByStudent(
    studentId: string
  ): Promise<AxiosResponse<ApiResponse<TeacherRating[]>>> {
    return axiosInstance.get(`/api/teacher-ratings/student/${studentId}`);
  },
};

export default TeacherRatingService;


