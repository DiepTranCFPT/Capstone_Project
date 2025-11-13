import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type { Lesson, LessonQuery, PageInfo } from "~/types/lesson";

const LessonService = {
  getById(id: string): Promise<AxiosResponse<ApiResponse<Lesson>>> {
    return axiosInstance.get(`/lessons/${id}`);
  },

  update(id: string, payload: Partial<Lesson>): Promise<AxiosResponse<ApiResponse<Lesson>>> {
    return axiosInstance.put(`/lessons/${id}`, payload);
  },

  delete(id: string): Promise<AxiosResponse<ApiResponse<null>>> {
    return axiosInstance.delete(`/lessons/${id}`);
  },

  getAll(params?: LessonQuery): Promise<AxiosResponse<ApiResponse<PageInfo<Lesson>>>> {
    return axiosInstance.get(`/lessons`, { params });
  },

  create(payload: Partial<Lesson>): Promise<AxiosResponse<ApiResponse<Lesson>>> {
    return axiosInstance.post(`/lessons`, payload);
  },

  getByLearningMaterial(learningMaterialId: string): Promise<AxiosResponse<ApiResponse<Lesson[]>>> {
    return axiosInstance.get(`/lessons/by-learning-material/${learningMaterialId}`);
  },
};

export default LessonService;
 