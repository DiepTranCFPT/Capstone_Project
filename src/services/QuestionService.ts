import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type { PageInfo } from "~/types/pagination";
import type { QuestionBankItem, NewQuestion } from "~/types/question";

const QuestionService = {
  //  Lấy tất cả câu hỏi (có phân trang)
  async getAll(
    params?: { pageNo?: number; pageSize?: number; keyword?: string }
  ): Promise<AxiosResponse<ApiResponse<PageInfo<QuestionBankItem>>>> {
    return axiosInstance.get("/questions", { params });
  },

  // Lấy chi tiết câu hỏi theo ID
  async getById(
    id: string
  ): Promise<AxiosResponse<ApiResponse<QuestionBankItem>>> {
    return axiosInstance.get(`/questions/${id}`);
  },

  //  Tạo câu hỏi mới
  async create(
    data: NewQuestion
  ): Promise<AxiosResponse<ApiResponse<QuestionBankItem>>> {
    return axiosInstance.post("/questions", data);
  },

  //  Cập nhật câu hỏi
  async update(
    id: string,
    data: Partial<QuestionBankItem>
  ): Promise<AxiosResponse<ApiResponse<QuestionBankItem>>> {
    return axiosInstance.put(`/questions/${id}`, data);
  },

  //  Xóa câu hỏi
  async delete(
    id: string
  ): Promise<AxiosResponse<ApiResponse<{ message: string }>>> {
    return axiosInstance.delete(`/questions/${id}`);
  },

  // Lấy danh sách câu hỏi theo giáo viên
  async getByTeacherId(
    teacherId: string
  ): Promise<AxiosResponse<ApiResponse<QuestionBankItem[]>>> {
    return axiosInstance.get(`/questions/by-teacher/${teacherId}`);
  },
};

export default QuestionService;
