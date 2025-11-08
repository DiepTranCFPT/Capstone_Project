// src/services/QuestionTopicService.ts
import axiosInstance from "~/configs/axios";
import type { ApiResponse } from "~/types/api";

export interface QuestionTopicPayload {
  name: string;
  subject_id: string;
}

const QuestionTopicService = {
  // Lấy toàn bộ topics
  async getAllTopics() {
    const res = await axiosInstance.get<ApiResponse>("/question-topics");
    return res.data;
  },

  // Lấy danh sách topic của giáo viên hiện tại
  async getMyTopics() {
    const res = await axiosInstance.get<ApiResponse>("/question-topics/my-topics");
    return res.data;
  },

  // Lấy topic theo subjectId
  async getTopicsBySubject(subjectId: string) {
    const res = await axiosInstance.get<ApiResponse>(
      `/question-topics/by-subject/${subjectId}`
    );
    return res.data;
  },

  // Tạo topic mới
  async createTopic(payload: QuestionTopicPayload) {
    const res = await axiosInstance.post<ApiResponse>(
      "/question-topics",
      payload
    );
    return res.data;
  },

  // Cập nhật topic
  async updateTopic(topicId: string, payload: QuestionTopicPayload) {
    const res = await axiosInstance.put<ApiResponse>(
      `/question-topics/${topicId}`,
      payload
    );
    return res.data;
  },

  // Xóa topic
  async deleteTopic(topicId: string) {
    const res = await axiosInstance.delete<ApiResponse>(
      `/question-topics/${topicId}`
    );
    return res.data;
  },
};

export default QuestionTopicService;
