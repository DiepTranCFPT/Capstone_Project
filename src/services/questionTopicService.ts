// src/services/QuestionTopicService.ts
import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type { PageInfo } from "~/types/pagination";
import type { QuestionTopic } from "~/types/questionTopic";

export interface QuestionTopicPayload {
  name: string;
  subject_id: string;
}

const QuestionTopicService = {
  // Lấy tất cả Topic (có phân trang)
  async getAll(
    params?: { pageNo?: number; pageSize?: number; keyword?: string; sorts?: string[] }
  ): Promise<
    AxiosResponse<
      | ApiResponse<QuestionTopic[]>
      | ApiResponse<PageInfo<QuestionTopic>>
    >
  > {
    return axiosInstance.get("/question-topics", { params });
  },

  // Lấy Topic của giáo viên đang đăng nhập
  async getMyTopics(): Promise<AxiosResponse<ApiResponse<QuestionTopic[]>>> {
    return axiosInstance.get("/question-topics/my-topics");
  },

  // Lấy Topic theo SubjectId
  async getBySubjectId(
    subjectId: string
  ): Promise<AxiosResponse<ApiResponse<QuestionTopic[]>>> {
    return axiosInstance.get(`/question-topics/by-subject/${subjectId}`);
  },

  // Tạo Topic mới
  async create(
    data: QuestionTopicPayload | Record<string, unknown>
  ): Promise<AxiosResponse<ApiResponse<QuestionTopic>>> {
    return axiosInstance.post("/question-topics", data);
  },

  // Cập nhật Topic
  async update(
    topicId: string,
    data: Partial<QuestionTopic> | Record<string, unknown>
  ): Promise<AxiosResponse<ApiResponse<QuestionTopic>>> {
    return axiosInstance.put(`/question-topics/${topicId}`, data);
  },

  // Xóa Topic
  async delete(
    topicId: string
  ): Promise<AxiosResponse<ApiResponse<{ message: string }>>> {
    return axiosInstance.delete(`/question-topics/${topicId}`);
  },
};

export default QuestionTopicService;
