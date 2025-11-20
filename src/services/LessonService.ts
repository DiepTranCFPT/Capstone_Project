import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type { Lesson, LessonQuery, PageInfo } from "~/types/lesson";

type LessonPayload = Partial<Omit<Lesson, "file" | "url">> & {
  file?: string | File | null;
  url?: string | File | null;
};

const isFileInstance = (value: unknown): value is File => value instanceof File;

const buildLessonPayload = (payload: LessonPayload | undefined) => {
  if (!payload) {
    return payload;
  }

  const containsFile = Object.values(payload).some((value) => isFileInstance(value as unknown));
  if (!containsFile) {
    return payload;
  }

  const formData = new FormData();
  Object.entries(payload).forEach(([key, rawValue]) => {
    const value = rawValue as unknown;
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

const needsMultipart = (payload: LessonPayload | undefined): boolean => {
  if (!payload) return false;
  return Object.values(payload).some((value) => isFileInstance(value as unknown));
};

const LessonService = {
  getById(id: string): Promise<AxiosResponse<ApiResponse<Lesson>>> {
    return axiosInstance.get(`/lessons/${id}`);
  },

  update(id: string, payload: LessonPayload): Promise<AxiosResponse<ApiResponse<Lesson>>> {
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

  create(payload: LessonPayload): Promise<AxiosResponse<ApiResponse<Lesson>>> {
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
 