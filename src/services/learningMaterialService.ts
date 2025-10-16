import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type {
  LearningMaterial,
  LearningMaterialQuery,
  PageInfo,
  ApiResponse,
} from "~/types/learningMaterial";

const LearningMaterialService = {
  //  ADMIN API

  // Lấy tất cả tài liệu (Admin)
  async getAll(
    params?: LearningMaterialQuery
  ): Promise<AxiosResponse<ApiResponse<PageInfo<LearningMaterial>>>> {
    return axiosInstance.get("/learning-materials", { params });
  },

  // Lấy chi tiết tài liệu theo ID
  async getById(
    id: string
  ): Promise<AxiosResponse<ApiResponse<LearningMaterial>>> {
    return axiosInstance.get(`/learning-materials/${id}`);
  },

  // Cập nhật tài liệu
  async update(
    id: string,
    data: Partial<LearningMaterial>
  ): Promise<AxiosResponse<ApiResponse<LearningMaterial>>> {
    return axiosInstance.put(`/learning-materials/${id}`, data);
  },

  // Xóa tài liệu (soft delete)
  async delete(
    id: string
  ): Promise<AxiosResponse<ApiResponse<{ message: string }>>> {
    return axiosInstance.delete(`/learning-materials/${id}`);
  },

  //  TEACHER API

  // Tạo mới tài liệu học
  async create(
    data: Partial<LearningMaterial>
  ): Promise<AxiosResponse<ApiResponse<LearningMaterial>>> {
    return axiosInstance.post("/learning-materials", data);
  },

  // Lấy danh sách tài liệu của giáo viên hiện tại
  async getMyMaterials(
    params?: LearningMaterialQuery
  ): Promise<AxiosResponse<ApiResponse<PageInfo<LearningMaterial>>>> {
    return axiosInstance.get("/learning-materials/my-materials", { params });
  },

  // Lấy tài liệu theo loại (typeId)
  async getByType(
    typeId: string
  ): Promise<AxiosResponse<ApiResponse<LearningMaterial[]>>> {
    return axiosInstance.get(`/learning-materials/by-type/${typeId}`);
  },

  // Lấy tài liệu theo môn học (subjectId)
  async getBySubject(
    subjectId: string
  ): Promise<AxiosResponse<ApiResponse<LearningMaterial[]>>> {
    return axiosInstance.get(`/learning-materials/by-subject/${subjectId}`);
  },

  // STUDENT API

  // Tìm kiếm tài liệu theo từ khóa
  async search(
    keyword: string
  ): Promise<AxiosResponse<ApiResponse<LearningMaterial[]>>> {
    return axiosInstance.get(`/learning-materials/search`, {
      params: { keyword },
    });
  },

  // Lấy danh sách tài liệu public
  async getPublic(
    params?: LearningMaterialQuery
  ): Promise<AxiosResponse<ApiResponse<PageInfo<LearningMaterial>>>> {
    return axiosInstance.get(`/learning-materials/public`, { params });
  },
};

export default LearningMaterialService;
