import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type { PageInfo } from "~/types/pagination";
import type { Subject, NewSubject } from "~/types/subject";

const SubjectService = {
  // 🔹 Lấy tất cả môn học (có phân trang)
  async getAll(
    params?: { pageNo?: number; pageSize?: number; keyword?: string }
  ): Promise<AxiosResponse<ApiResponse<PageInfo<Subject>>>> {
    return axiosInstance.get("/subjects", { params });
  },

  // 🔹 Lấy chi tiết môn học theo ID
  async getById(id: string): Promise<AxiosResponse<ApiResponse<Subject>>> {
    return axiosInstance.get(`/subjects/${id}`);
  },

  // 🔹 Tạo mới môn học
  async create(
    data: NewSubject | Record<string, unknown>
  ): Promise<AxiosResponse<ApiResponse<Subject>>> {
    return axiosInstance.post("/subjects", data);
  },

  // 🔹 Cập nhật môn học
  async update(
    id: string,
    data: Partial<Subject> | Record<string, unknown>
  ): Promise<AxiosResponse<ApiResponse<Subject>>> {
    return axiosInstance.put(`/subjects/${id}`, data);
  },

  // 🔹 Xóa môn học
  async delete(
    id: string
  ): Promise<AxiosResponse<ApiResponse<{ message: string }>>> {
    return axiosInstance.delete(`/subjects/${id}`);
  },
};

export default SubjectService;
