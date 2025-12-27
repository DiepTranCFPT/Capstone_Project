import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type { LearningMaterial, LearningMaterialQuery, LearningMaterialSearchParams, PageInfo, MaterialsWithStudentsResponse } from "~/types/learningMaterial";

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
    // POST request to register for a learning material
    // According to API docs: POST /learning-materials/register/{learningMaterialId}
    // Body is optional, sending empty object
    return axiosInstance.post(`/learning-materials/register/${learningMaterialId}`, {});
  },

  // GET /learning-materials/search
  // Searches learning materials by keyword in title and description
  // Supports pagination and sorting
  search(params: LearningMaterialSearchParams): Promise<AxiosResponse<ApiResponse<PageInfo<LearningMaterial> | LearningMaterial[]>>> {
    // Convert sorts array to query params format if provided
    const queryParams: Record<string, string | number> = {
      keyword: params.keyword,
    };
    
    if (params.pageNo !== undefined) {
      queryParams.pageNo = params.pageNo;
    }
    
    if (params.pageSize !== undefined) {
      queryParams.pageSize = params.pageSize;
    }
    
    // Handle sorts array - API might expect comma-separated string or array
    // Try sending as array first, if backend doesn't support, convert to comma-separated string
    if (params.sorts && params.sorts.length > 0) {
      // Send as array - axios will handle it properly
      return axiosInstance.get(`/learning-materials/search`, { 
        params: {
          ...queryParams,
          sorts: params.sorts,
        },
      });
    }
    
    return axiosInstance.get(`/learning-materials/search`, { params: queryParams });
  },

  getRegistered(params?: LearningMaterialQuery): Promise<AxiosResponse<ApiResponse<PageInfo<LearningMaterial> | LearningMaterial[]>>> {
    return axiosInstance.get(`/learning-materials/registered`, { params });
  },

  getPublic(params?: LearningMaterialQuery): Promise<AxiosResponse<ApiResponse<LearningMaterial[]>>> {
    return axiosInstance.get(`/learning-materials/public`, { params });
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

  getMaterialsWithStudents(): Promise<AxiosResponse<MaterialsWithStudentsResponse>> {
    return axiosInstance.get(`/learning-materials/teacher/materials-with-students`);
  },
};

export default LearningMaterialService;
