import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type { PageInfo } from "~/types/pagination";
import type { QuestionTopic } from "~/types/questionTopic";
import type { QuestionBankItem, NewQuestion, QuestionV2PaginationResponse, QuestionImportResponse, BatchDeleteQuestionsResponse } from "~/types/question";

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

  //  Lấy danh sách câu hỏi được tạo bởi user (có phân trang và sorting)
  async getByUserId(
    userId: string,
    params?: { pageNo?: number; pageSize?: number; keyword?: string }
  ): Promise<AxiosResponse<ApiResponse<PageInfo<QuestionBankItem> | QuestionBankItem[]>>> {
    return axiosInstance.get(`/questions-v2/created-by/${userId}`, { params });
  },

  //  Lấy tất cả Topic câu hỏi
  async getAllTopics(
    params?: { pageNo?: number; pageSize?: number; keyword?: string }
  ): Promise<
    AxiosResponse<
      | ApiResponse<QuestionTopic[]>
      | ApiResponse<import("~/types/pagination").PageInfo<QuestionTopic>>
    >
  > {
    // Note: endpoint provided by backend spec
    return axiosInstance.get(`/question-topics`, { params });
  },
  // Lấy tất cả câu hỏi v2 (có phân trang và sorting)
  async getAllV2(
    params?: { pageNo?: number; pageSize?: number; type?: string; sorts?: string }
  ): Promise<AxiosResponse<ApiResponse<QuestionV2PaginationResponse>>> {
    return axiosInstance.get("/questions-v2", { params });
  },

  // Import câu hỏi từ file
  async importQuestions(
    subjectId: string,
    file: File,
    skipErrors: boolean = false
  ): Promise<AxiosResponse<ApiResponse<QuestionImportResponse>>> {
    const formData = new FormData();
    formData.append("file", file);
    return axiosInstance.post("/questions-v2/import", formData, {
      params: { subjectId, skipErrors },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Tải template import câu hỏi
  async getImportTemplate(): Promise<AxiosResponse<Blob>> {
    return axiosInstance.get("/questions-v2/import/template", {
      responseType: "blob",
    });
  },

  // Xóa nhiều câu hỏi cùng lúc (batch delete)
  async batchDelete(
    questionIds: string[]
  ): Promise<AxiosResponse<BatchDeleteQuestionsResponse>> {
    return axiosInstance.delete("/questions-v2/batch", {
      data: questionIds,
    });
  },
};
export default QuestionService;
