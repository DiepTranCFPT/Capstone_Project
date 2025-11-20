import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type { Lesson, LessonQuery, PageInfo } from "~/types/lesson";

const isFileInstance = (value: unknown): value is File => value instanceof File;

const buildLessonPayload = (payload: Partial<Lesson>) => {
  if (!payload || !isFileInstance(payload.file)) {
    return payload;
  }

  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    if (isFileInstance(value)) {
      formData.append(key, value, value.name);
      return;
    }
    if (value instanceof Blob) {
      formData.append(key, value);
      return;
    }
    formData.append(key, String(value));
  });
  return formData;
};

const needsMultipart = (payload: Partial<Lesson>): boolean => {
  return Boolean(payload.file && isFileInstance(payload.file));
};

const LessonService = {
  getById(id: string): Promise<AxiosResponse<ApiResponse<Lesson>>> {
    return axiosInstance.get(`/lessons/${id}`);
  },

  update(id: string, payload: Partial<Lesson>): Promise<AxiosResponse<ApiResponse<Lesson>>> {
    const data = buildLessonPayload(payload);
    if (needsMultipart(payload)) {
      return axiosInstance.put(`/lessons/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return axiosInstance.put(`/lessons/${id}`, data);
  },

  delete(id: string): Promise<AxiosResponse<ApiResponse<null>>> {
    return axiosInstance.delete(`/lessons/${id}`);
  },

  getAll(params?: LessonQuery): Promise<AxiosResponse<ApiResponse<PageInfo<Lesson>>>> {
    return axiosInstance.get(`/lessons`, { params });
  },

  create(payload: Partial<Lesson>): Promise<AxiosResponse<ApiResponse<Lesson>>> {
    const data = buildLessonPayload(payload);
    if (needsMultipart(payload)) {
      return axiosInstance.post(`/lessons`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return axiosInstance.post(`/lessons`, data);
  },

  getByLearningMaterial(learningMaterialId: string): Promise<AxiosResponse<ApiResponse<Lesson[]>>> {
    return axiosInstance.get(`/lessons/by-learning-material/${learningMaterialId}`);
  },
};

export default LessonService;
 