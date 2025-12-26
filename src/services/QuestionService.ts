import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type { PageInfo } from "~/types/pagination";
import type { QuestionTopic } from "~/types/questionTopic";
import type {
  QuestionBankItem,
  NewQuestion,
  QuestionV2PaginationResponse,
  QuestionImportResponse,
  BatchDeleteQuestionsResponse,
  CreateQuestionContextRequest,
  UpdateQuestionContextRequest,
  QuestionContextResponse,
  FileUploadQuestionsResponse,
  MyContextPaginationResponse,
  DuplicatesResponse
} from "~/types/question";
import type {
  BatchCreateQuestionRequest,
  BatchCreateQuestionsResponse
} from "~/types/aiQuestionImport";

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
    subjectId: string,
    params?: { pageNo?: number; pageSize?: number }
  ): Promise<AxiosResponse<ApiResponse<QuestionBankItem[]>>> {
    return axiosInstance.get(`/questions-v2/subject/${subjectId}`, { params });
  },

  //  Tìm kiếm câu hỏi (search)
  async search(
    params: Record<string, unknown>
  ): Promise<AxiosResponse<ApiResponse<QuestionBankItem[]>>> {
    return axiosInstance.get("/questions-v2/search", { params });
  },

  //  Lấy danh sách câu hỏi được tạo bởi user
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
  // Lấy tất cả câu hỏi v2 (có phân trang)
  async getAllV2(
    params?: { pageNo?: number; pageSize?: number }
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

  // Tạo question context mới
  async createContext(
    data: CreateQuestionContextRequest
  ): Promise<AxiosResponse<QuestionContextResponse>> {
    return axiosInstance.post("/questions-v2/context", data);
  },

  // Cập nhật question context
  async updateContext(
    id: string,
    data: UpdateQuestionContextRequest
  ): Promise<AxiosResponse<QuestionContextResponse>> {
    return axiosInstance.put(`/questions-v2/context/${id}`, data);
  },

  // Upload file cho questions
  async uploadQuestionFile(
    file: File
  ): Promise<AxiosResponse<FileUploadQuestionsResponse>> {
    const formData = new FormData();
    formData.append("file", file);
    return axiosInstance.post("/files/upload/questions", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Lấy danh sách tất cả contexts
  // async getAllContexts(
  //   params?: { pageNo?: number; pageSize?: number }
  // ): Promise<AxiosResponse<QuestionContextResponse>> {
  //   return axiosInstance.get("/questions-v2/context", { params });
  // },

  // Xóa context
  // async deleteContext(id: string): Promise<AxiosResponse<ApiResponse<void>>> {
  //   return axiosInstance.delete(`/questions-v2/context/${id}`);
  // },

  // Lấy danh sách contexts của user hiện tại (GET /questions-v2/context/me)
  async getMyContexts(
    params?: { pageNo?: number; pageSize?: number; sorts?: string[] }
  ): Promise<AxiosResponse<ApiResponse<MyContextPaginationResponse>>> {
    return axiosInstance.get("/questions-v2/context/me", { params });
  },

  // Lấy danh sách câu hỏi trùng lặp (GET /questions-v2/duplicates)
  async getDuplicates(): Promise<AxiosResponse<DuplicatesResponse>> {
    return axiosInstance.get("/questions-v2/duplicates");
  },

  // Lấy danh sách context trùng lặp (GET /questions-v2/context/duplicates)
  async getContextDuplicates(): Promise<AxiosResponse<DuplicatesResponse>> {
    return axiosInstance.get("/questions-v2/context/duplicates");
  },

  // Tạo nhiều câu hỏi cùng lúc (batch create) - dùng cho AI import
  async batchCreate(
    questions: BatchCreateQuestionRequest[]
  ): Promise<AxiosResponse<BatchCreateQuestionsResponse>> {
    return axiosInstance.post("/questions-v2/batch-create", questions);
  },

  // Export câu hỏi ra file để tạo tài liệu
  async exportQuestionsToText(
    subjectId: string,
    questionIds: string[]
  ): Promise<AxiosResponse<Blob>> {
    return axiosInstance.post("/questions-v2/export", {
      subjectId,
      questionIds,
    }, {
      responseType: 'blob',
    });
  },
};
export default QuestionService;
