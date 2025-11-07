import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type {
  ActiveExam,
  SubmitExamPayload,
  ExamResult
} from "~/types/test"; // Import các types mới từ test.ts

// Định nghĩa các kiểu response dựa trên ApiResponse chung
type StartExamResponse = ApiResponse<ActiveExam>;
type SubmitExamResponse = ApiResponse<ExamResult>;

/**
 * Service này quản lý việc bắt đầu và nộp bài thi.
 */
const ExamTestService = {
  /**
   * Bắt đầu một bài thi dựa trên templateId.
   * @param templateId - ID của ExamTemplate
   * @returns Promise chứa thông tin bài thi và danh sách câu hỏi.
   */
  startTest(
    templateId: string
  ): Promise<AxiosResponse<StartExamResponse>> {
    return axiosInstance.post(`/exam-test/start/${templateId}`);
  },

  /**
   * Nộp bài thi đã làm.
   * @param attemptId - ID của lần làm bài (lấy từ API startTest)
   * @param data - Payload chứa các câu trả lời
   * @returns Promise chứa kết quả bài thi.
   */
  submitTest(
    attemptId: string,
    data: SubmitExamPayload
  ): Promise<AxiosResponse<SubmitExamResponse>> {
    return axiosInstance.post(`/exam-test/submit/${attemptId}`, data);
  },
};

export default ExamTestService;