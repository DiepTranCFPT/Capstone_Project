import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type { LearningMaterial, LearningMaterialQuery, PageInfo } from "~/types/learningMaterial";

const LearningMaterialService = {
  getById(id: string): Promise<AxiosResponse<ApiResponse<LearningMaterial>>> {
    return axiosInstance.get(`/learning-materials/${id}`);
  },

  update(id: string, payload: Partial<LearningMaterial>): Promise<AxiosResponse<ApiResponse<LearningMaterial>>> {
    return axiosInstance.put(`/learning-materials/${id}`, payload);
  },

  delete(id: string): Promise<AxiosResponse<ApiResponse<null>>> {
    return axiosInstance.delete(`/learning-materials/${id}`);
  },

  getAll(params?: LearningMaterialQuery): Promise<AxiosResponse<ApiResponse<PageInfo<LearningMaterial>>>> {
    return axiosInstance.get(`/learning-materials`, { params });
  },

  create(payload: Partial<LearningMaterial> | FormData): Promise<AxiosResponse<ApiResponse<LearningMaterial>>> {
    if (payload instanceof FormData) {
      return axiosInstance.post(`/learning-materials`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return axiosInstance.post(`/learning-materials`, payload);
  },

  register(learningMaterialId: string): Promise<AxiosResponse<ApiResponse<unknown>>> {
    return axiosInstance.post(`/learning-materials/register/${learningMaterialId}`, {});
  },

  search(keyword: string): Promise<AxiosResponse<ApiResponse<LearningMaterial[]>>> {
    return axiosInstance.get(`/learning-materials/search`, { params: { keyword } });
  },

  getRegistered(): Promise<AxiosResponse<ApiResponse<LearningMaterial[]>>> {
    return axiosInstance.get(`/learning-materials/registered`);
  },

  getPublic(): Promise<AxiosResponse<ApiResponse<LearningMaterial[]>>> {
    return axiosInstance.get(`/learning-materials/public`);
  },

  getMyMaterials(): Promise<AxiosResponse<ApiResponse<LearningMaterial[]>>> {
    return axiosInstance.get(`/learning-materials/my-materials`);
  },

  getByType(typeId: string): Promise<AxiosResponse<ApiResponse<LearningMaterial[]>>> {
    return axiosInstance.get(`/learning-materials/by-type/${typeId}`);
  },

  getBySubject(subjectId: string): Promise<AxiosResponse<ApiResponse<LearningMaterial[]>>> {
    return axiosInstance.get(`/learning-materials/by-subject/${subjectId}`);
  },

  getAllNoPaging(): Promise<AxiosResponse<ApiResponse<LearningMaterial[]>>> {
    return axiosInstance.get(`/learning-materials/all`);
  },
};

export default LearningMaterialService;
