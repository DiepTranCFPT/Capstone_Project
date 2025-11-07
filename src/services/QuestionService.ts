import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type { PageInfo } from "~/types/pagination";
import type { QuestionBankItem, NewQuestion, QuestionV2PaginationResponse } from "~/types/question";

const QuestionService = {
  //  Lấy tất cả câu hỏi (có phân trang)
  async getAll(
    params?: { pageNo?: number; pageSize?: number; keyword?: string }
  ): Promise<AxiosResponse<ApiResponse<PageInfo<QuestionBankItem>>>> {
    return axiosInstance.get("/questions-v2", { params });
  },

  // Lấy chi tiết câu hỏi theo ID
  async getById(
    id: string
  ): Promise<AxiosResponse<ApiResponse<QuestionBankItem>>> {
    return axiosInstance.get(`/questions-v2/${id}`);
  },

  //  Tạo câu hỏi mới
  async create(
    data: NewQuestion | Record<string, unknown>
  ): Promise<AxiosResponse<ApiResponse<QuestionBankItem>>> {
    return axiosInstance.post("/questions-v2", data);
  },

  //  Cập nhật câu hỏi
  async update(
    id: string,
    data: Partial<QuestionBankItem> | Record<string, unknown>
  ): Promise<AxiosResponse<ApiResponse<QuestionBankItem>>> {
    return axiosInstance.put(`/questions-v2/${id}`, data);
  },

  //  Xóa câu hỏi
  async delete(
    id: string
  ): Promise<AxiosResponse<ApiResponse<{ message: string }>>> {
    return axiosInstance.delete(`/questions-v2/${id}`);
  },

  //  Lấy danh sách câu hỏi theo topicId
  async getByTopicId(
    topicId: string
  ): Promise<AxiosResponse<ApiResponse<QuestionBankItem[]>>> {
    return axiosInstance.get(`/questions-v2/topic/${topicId}`);
  },

  //  Lấy danh sách câu hỏi theo subjectId
  async getBySubjectId(
    subjectId: string
  ): Promise<AxiosResponse<ApiResponse<QuestionBankItem[]>>> {
    return axiosInstance.get(`/questions-v2/subject/${subjectId}`);
  },

  //  Tìm kiếm câu hỏi (search)
  async search(
    params: Record<string, unknown>
  ): Promise<AxiosResponse<ApiResponse<QuestionBankItem[]>>> {
    return axiosInstance.get("/questions-v2/search", { params });
  },

  //  Lấy danh sách câu hỏi được tạo bởi user
  async getByUserId(
    userId: string
  ): Promise<AxiosResponse<ApiResponse<QuestionBankItem[]>>> {
    return axiosInstance.get(`/questions-v2/created-by/${userId}`);
  },

  // Lấy tất cả câu hỏi v2 (có phân trang)
  async getAllV2(
    params?: { pageNo?: number; pageSize?: number }
  ): Promise<AxiosResponse<ApiResponse<QuestionV2PaginationResponse>>> {
    return axiosInstance.get("/questions-v2", { params });
  },
};

export default QuestionService;
