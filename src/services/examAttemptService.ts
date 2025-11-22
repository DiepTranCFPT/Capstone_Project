import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type { PageInfo } from "~/types/pagination";
import type {
  ActiveExam,
  SubmitExamPayload,
  ExamResult,
} from "~/types/test";
import type {
  StartSinglePayload,
  StartComboPayload,
  StartComboRandomPayload,
  RateAttemptPayload,
  AttemptResultDetail,
  SaveProgressPayload,
  ManualGradePayload,
} from "~/types/examAttempt";

/**
 * Service quản lý việc bắt đầu, nộp, và xem lại các lần làm bài (Exam Attempts).
 * API: /exam-attempts
 */
const ExamAttemptService = {
  /**
   * 🔹 Bắt đầu một bài thi đơn lẻ.
   * POST /exam-attempts/start-single
   */
  startSingle(
    data: StartSinglePayload
  ): Promise<AxiosResponse<ApiResponse<ActiveExam>>> {
    return axiosInstance.post("/exam-attempts/start-single", data);
  },

  /**
   * 🔹 Bắt đầu một bài thi tổ hợp (tự chọn).
   * POST /exam-attempts/start-combo
   */
  startCombo(
    data: StartComboPayload
  ): Promise<AxiosResponse<ApiResponse<ActiveExam>>> {
    return axiosInstance.post("/exam-attempts/start-combo", data);
  },

  /**
   * 🔹 Bắt đầu một bài thi tổ hợp (ngẫu nhiên).
   * POST /exam-attempts/start-combo-random
   */
  startComboRandom(
    data: StartComboRandomPayload
  ): Promise<AxiosResponse<ApiResponse<ActiveExam>>> {
    return axiosInstance.post("/exam-attempts/start-combo-random", data);
  },

  /**
   * 🔹 Nộp bài thi.
   * POST /exam-attempts/{attemptId}/submit
   */
  submit(
    attemptId: string,
    data: SubmitExamPayload
  ): Promise<AxiosResponse<ApiResponse<ExamResult>>> {
    return axiosInstance.post(`/exam-attempts/${attemptId}/submit`, data);
  },

  /**
   * 🔹 Đánh giá (rate) một lần thi.
   * POST /exam-attempts/{attemptId}/rate
   */
  rate(
    attemptId: string,
    data: RateAttemptPayload
  ): Promise<AxiosResponse<ApiResponse<string>>> {
    return axiosInstance.post(`/exam-attempts/${attemptId}/rate`, data);
  },

  /**
   * 🔹 Lấy kết quả chi tiết của một lần thi.
   * GET /exam-attempts/{attemptId}/result
   */
  getResult(
    attemptId: string
  ): Promise<AxiosResponse<ApiResponse<AttemptResultDetail>>> {
    return axiosInstance.get(`/exam-attempts/${attemptId}/result`);
  },

  /**
   * 🔹 Lấy lịch sử thi của cá nhân (phân trang).
   * GET /exam-attempts/my-history
   */
  getMyHistory(params: {
    pageNo?: number;
    pageSize?: number;
    sorts?: string[];
  }): Promise<AxiosResponse<ApiResponse<PageInfo<ExamResult>>>> {
    return axiosInstance.get("/exam-attempts/my-history", { params });
  },

  /**
   * 🔹 Lấy kết quả chi tiết của một lần thi (subscribe).
   * GET /exam-attempts/{attemptId}/subscribe
   */
  subscribe(
    attemptId: string
  ): Promise<AxiosResponse<ApiResponse<AttemptResultDetail>>> {
    return axiosInstance.get(`/exam-attempts/${attemptId}/subscribe`);
  },

  /**
   * 🔹 Lưu tiến độ làm bài (Save Progress).
   * POST /exam-attempts/{attemptId}/save-progress
   */
  saveProgress(
    attemptId: string,
    data: SaveProgressPayload
  ): Promise<AxiosResponse<ApiResponse<string>>> { // Giả sử data trả về là string hoặc object đơn giản
    return axiosInstance.post(`/exam-attempts/${attemptId}/save-progress`, data);
  },

  /**
   * 🔹 Chấm điểm thủ công (Manual Grade) - Dành cho giáo viên.
   * PUT /exam-attempts/{attemptId}/manual-grade
   */
  manualGrade(
    attemptId: string,
    data: ManualGradePayload
  ): Promise<AxiosResponse<ApiResponse<AttemptResultDetail>>> {
    return axiosInstance.put(`/exam-attempts/${attemptId}/manual-grade`, data);
  },

};

export default ExamAttemptService;
