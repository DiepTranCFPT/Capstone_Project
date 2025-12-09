import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type {
  LearningMaterialRating,
  LearningMaterialRatingPayload,
  LearningMaterialRatingStatistics,
} from "~/types/learningMaterialRating";
import type { PaginatedResponse } from "~/types/api";

const LearningMaterialRatingService = {
  getRatingsByMaterial(
    learningMaterialId: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = "createdAt",
    sortDir: string = "DESC",
  ): Promise<AxiosResponse<ApiResponse<PaginatedResponse<LearningMaterialRating>>>> {
    return axiosInstance.get(`/learning-materials/${learningMaterialId}/ratings`, {
      params: { page, size, sortBy, sortDir },
    });
  },

  getRatingsByStudent(
    studentId: string,
  ): Promise<AxiosResponse<ApiResponse<LearningMaterialRating[]>>> {
    return axiosInstance.get(`/learning-material-ratings/student/${studentId}`);
  },

  getRatingByMaterialAndStudent(
    materialId: string,
    studentId: string,
  ): Promise<AxiosResponse<ApiResponse<LearningMaterialRating>>> {
    return axiosInstance.get(`/learning-material-ratings/material/${materialId}/student/${studentId}`);
  },

  getStatisticsByMaterial(
    materialId: string,
  ): Promise<AxiosResponse<ApiResponse<LearningMaterialRatingStatistics>>> {
    return axiosInstance.get(`/learning-materials/${materialId}/ratings/statistics`);
  },

  createRating(
    payload: LearningMaterialRatingPayload,
  ): Promise<AxiosResponse<ApiResponse<LearningMaterialRating>>> {
    return axiosInstance.post(`/learning-material-ratings`, payload);
  },
};

export default LearningMaterialRatingService;
