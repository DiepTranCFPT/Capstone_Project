// src/services/MaterialTypeService.ts

import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type { PageInfo } from "~/types/pagination";

export interface MaterialType {
  id: string;
  name: string;
  description?: string;
}

export interface MaterialTypePayload {
  name: string;
  description?: string;
}

type MaterialTypeListResponse = PageInfo<MaterialType> | MaterialType[];

const MaterialTypeService = {
  // Lấy tất cả material-types
  async getAll(
    params?: { pageNo?: number; pageSize?: number; keyword?: string },
  ): Promise<AxiosResponse<ApiResponse<MaterialTypeListResponse> | MaterialType[]>> {
    return axiosInstance.get("/material-types", { params });
  },

  // Lấy material-type theo ID
  async getById(id: string): Promise<AxiosResponse<ApiResponse<MaterialType>>> {
    return axiosInstance.get(`/material-types/${id}`);
  },

  // Tạo material-type mới
  async create(
    data: MaterialTypePayload
  ): Promise<AxiosResponse<ApiResponse<MaterialType>>> {
    return axiosInstance.post("/material-types", data);
  },

  // Cập nhật material-type
  async update(
    id: string,
    data: Partial<MaterialTypePayload>
  ): Promise<AxiosResponse<ApiResponse<MaterialType>>> {
    return axiosInstance.put(`/material-types/${id}`, data);
  },

  // Xóa material-type
  async delete(
    id: string
  ): Promise<AxiosResponse<ApiResponse<{ message: string }>>> {
    return axiosInstance.delete(`/material-types/${id}`);
  },
};

export default MaterialTypeService;
