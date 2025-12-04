// src/services/learningMaterialRatingService.ts
import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse, PaginatedResponse } from "~/types/api";
import type {
  LearningMaterialRating,
  LearningMaterialRatingPayload,
  LearningMaterialRatingStatistics,
} from "~/types/learningMaterialRating";

const LearningMaterialRatingService = {
  // POST /api/learning-material-ratings
  // Tạo đánh giá mới cho learning material
  createRating(
    payload: LearningMaterialRatingPayload
  ): Promise<AxiosResponse<ApiResponse<LearningMaterialRating>>> {
    return axiosInstance.post(`/api/learning-material-ratings`, payload);
  },

  // GET /api/learning-material-ratings/material/{materialId}
  // Lấy tất cả đánh giá của một learning material (có thể là phân trang tuỳ BE)
  getRatingsByMaterial(
    materialId: string,
    page?: number,
    size?: number,
    sortBy?: string,
    sortDir?: string
  ): Promise<AxiosResponse<ApiResponse<PaginatedResponse<LearningMaterialRating>>>> {
    return axiosInstance.get(
      `/api/learning-material-ratings/material/${materialId}`,
      {
        params: {
          page,
          size,
          sortBy,
          sortDir,
        },
      }
    );
  },

  // GET /api/learning-material-ratings/material/{materialId}/student/{studentId}
  // Lấy đánh giá của một học sinh cho một learning material
  getRatingByMaterialAndStudent(
    materialId: string,
    studentId: string
  ): Promise<AxiosResponse<ApiResponse<LearningMaterialRating>>> {
    return axiosInstance.get(
      `/api/learning-material-ratings/material/${materialId}/student/${studentId}`
    );
  },

  // GET /api/learning-material-ratings/material/{materialId}/statistics
  // Lấy thống kê đánh giá của một learning material
  getStatisticsByMaterial(
    materialId: string
  ): Promise<AxiosResponse<ApiResponse<LearningMaterialRatingStatistics>>> {
    return axiosInstance.get(
      `/api/learning-material-ratings/material/${materialId}/statistics`
    );
  },

  // GET /api/learning-material-ratings/student/{studentId}
  // Lấy danh sách đánh giá mà một học sinh đã đánh giá cho các learning material
  getRatingsByStudent(
    studentId: string
  ): Promise<AxiosResponse<ApiResponse<LearningMaterialRating[]>>> {
    return axiosInstance.get(
      `/api/learning-material-ratings/student/${studentId}`
    );
  },
};

export default LearningMaterialRatingService;



