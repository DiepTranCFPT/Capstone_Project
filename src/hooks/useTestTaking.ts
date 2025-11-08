import { useState, useCallback } from "react";
import { toast } from "~/components/common/Toast";
import ExamTestService from "~/services/examTestService";
import type {
  ActiveExam,
  ExamResult,
  SubmitExamPayload,
  ExamSubmissionAnswer
} from "~/types/test";
import type { ApiResponse } from "~/types/api";

/**
 * Hook này quản lý trạng thái khi đang làm bài thi.
 */
export const useTestTaking = () => {
  // State chứa thông tin bài thi và câu hỏi
  const [activeExam, setActiveExam] = useState<ActiveExam | null>(null);
  // State chứa kết quả sau khi nộp bài
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Xử lý lỗi chung và hiển thị toast.
   */
  const handleError = (err: unknown, defaultMessage: string) => {
    setLoading(false);
    const e = err as { response?: { data?: ApiResponse<unknown> } } & Error;
    const apiMessage = e.response?.data?.message;
    const message = apiMessage || e.message || defaultMessage;
    setError(message);
    toast.error(message);
    return message;
  };

  /**
   * Gọi API để bắt đầu bài thi.
   * @param templateId - ID của template đề thi.
   */
  const startExam = useCallback(async (templateId: string) => {
    setLoading(true);
    setError(null);
    setExamResult(null); // Xóa kết quả cũ
    setActiveExam(null); // Xóa bài thi cũ
    try {
      const res = await ExamTestService.startTest(templateId);
      if (res.data.code === 0 || res.data.code === 1000) {
        setActiveExam(res.data.data);
        return res.data.data;
      } else {
        throw new Error(res.data.message || "Failed to start exam");
      }
    } catch (err) {
      handleError(err, "Không thể bắt đầu bài thi");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Gọi API để nộp bài thi.
   * @param attemptId - ID của lần làm bài (lấy từ activeExam.examAttemptId).
   * @param answers - Mảng các câu trả lời.
   */
  const submitExam = useCallback(async (
    attemptId: string,
    answers: ExamSubmissionAnswer[]
  ) => {
    if (!attemptId) {
      toast.error("Invalid exam attempt ID.");
      return null;
    }

    setLoading(true);
    setError(null);
    const payload: SubmitExamPayload = { answers };

    try {
      const res = await ExamTestService.submitTest(attemptId, payload);
      if (res.data.code === 0 || res.data.code === 1000) {
        setExamResult(res.data.data);
        setActiveExam(null); // Xóa bài thi đang hoạt động sau khi nộp
        toast.success("Nộp bài thành công!");
        return res.data.data;
      } else {
        throw new Error(res.data.message || "Failed to submit exam");
      }
    } catch (err) {
      const errorMessage = handleError(err, "Không thể nộp bài thi");
      throw new Error(errorMessage); // Ném lỗi ra để component có thể bắt
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Xóa trạng thái bài thi (ví dụ: khi người dùng hủy bài).
   */
  const clearActiveExam = useCallback(() => {
    setActiveExam(null);
    setExamResult(null);
    setError(null);
  }, []);

  return {
    activeExam,     // Thông tin bài thi đang làm
    examResult,     // Kết quả sau khi nộp
    loading,        // Trạng thái loading
    error,          // Lỗi
    startExam,      // Hàm để bắt đầu thi
    submitExam,     // Hàm để nộp bài
    clearActiveExam, // Hàm để hủy bài
  };
};