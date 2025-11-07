import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";

// Kiểu dữ liệu cho độ khó câu hỏi
export interface QuestionDifficulty {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

const QuestionDifficultyService = {
  //  Lấy tất cả độ khó
  async getAll(): Promise<AxiosResponse<ApiResponse<QuestionDifficulty[]>>> {
    return axiosInstance.get("/question-difficulties");
  },

  //  Lấy độ khó theo ID
  async getById(
    id: string
  ): Promise<AxiosResponse<ApiResponse<QuestionDifficulty>>> {
    return axiosInstance.get(`/question-difficulties/${id}`);
  },

  //  Tạo độ khó mới
  async create(
    data: Omit<QuestionDifficulty, "id" | "createdAt" | "updatedAt">
  ): Promise<AxiosResponse<ApiResponse<QuestionDifficulty>>> {
    return axiosInstance.post("/question-difficulties", data);
  },

  //  Cập nhật độ khó
  async update(
    id: string,
    data: Partial<QuestionDifficulty>
  ): Promise<AxiosResponse<ApiResponse<QuestionDifficulty>>> {
    return axiosInstance.put(`/question-difficulties/${id}`, data);
  },

  //  Xóa độ khó
  async delete(
    id: string
  ): Promise<AxiosResponse<ApiResponse<{ message: string }>>> {
    return axiosInstance.delete(`/question-difficulties/${id}`);
  },
};

export default QuestionDifficultyService;
