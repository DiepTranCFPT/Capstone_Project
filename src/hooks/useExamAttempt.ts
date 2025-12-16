import { useState, useCallback, useEffect } from "react";
import { toast } from "~/components/common/Toast";
import ExamAttemptService from "~/services/examAttemptService";
import type {
  ActiveExam,
  ExamResult,
  SubmitExamPayload,
} from "~/types/test";
import type {
  AttemptResultDetail,
  ManualGradePayload,
  RateAttemptPayload,
  RequestReviewPayload,
  ReviewQueueItem,
  ReviewQueueQueryParams,
  SaveProgressPayload,
  StartComboPayload,
  StartComboRandomPayload,
  StartSinglePayload,
} from "~/types/examAttempt";
import type { ApiResponse } from "~/types/api";
import type { PageInfo } from "~/types/pagination";

interface HistoryRecord {
  attemptId: string;
  examId: string;
  doneBy: string;
  score: number;
  startTime: string;
  endTime: string | null;
  rating: number | null;
}

/**
 * 🔹 Hook quản lý logic khi BẮT ĐẦU và NỘP BÀI thi.
 */
export const useExamAttempt = () => {
  const [activeAttempt, setActiveAttempt] = useState<ActiveExam | null>(null);
  const [submissionResult, setSubmissionResult] = useState<ExamResult | null>(
    null
  );
  const [attemptResultDetail, setAttemptResultDetail] =
    useState<AttemptResultDetail | null>(null);

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
   * Bắt đầu bài thi đơn lẻ.
   */
  const startSingleAttempt = useCallback(
    async (payload: StartSinglePayload) => {
      setLoading(true);
      setError(null);
      try {
        const res = await ExamAttemptService.startSingle(payload);
        if (res.data.code === 0 || res.data.code === 1000) {
          setActiveAttempt(res.data.data);
          return res.data.data;
        } else {
          throw new Error(res.data.message || "Failed to start single exam");
        }
      } catch (err) {
        handleError(err, "Failed to start single exam");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Bắt đầu bài thi tổ hợp (tự chọn).
   */
  const startComboAttempt = useCallback(
    async (payload: StartComboPayload) => {
      setLoading(true);
      setError(null);
      try {
        const res = await ExamAttemptService.startCombo(payload);
        if (res.data.code === 0 || res.data.code === 1000) {
          setActiveAttempt(res.data.data);
          return res.data.data;
        } else {
          throw new Error(res.data.message || "Failed to start combo exam");
        }
      } catch (err) {
        handleError(err, "Failed to start combo exam");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Bắt đầu bài thi tổ hợp (ngẫu nhiên).
   */
  const startComboRandomAttempt = useCallback(
    async (payload: StartComboRandomPayload) => {
      setLoading(true);
      setError(null);
      try {
        const res = await ExamAttemptService.startComboRandom(payload);
        if (res.data.code === 0 || res.data.code === 1000) {
          setActiveAttempt(res.data.data);
          return res.data.data;
        } else {
          throw new Error(res.data.message || "Failed to start random combo exam");
        }
      } catch (err) {
        handleError(err, "Failed to start random combo exam");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Nộp bài thi.
   */
  const submitAttempt = useCallback(
    async (attemptId: string, payload: SubmitExamPayload) => {
      setLoading(true);
      setError(null);
      try {
        // Submit API - subscribe is now handled by WaitResultModal
        const res = await ExamAttemptService.submit(attemptId, payload);
        if (res.data.code === 0 || res.data.code === 1000) {
          setSubmissionResult(res.data.data);
          setActiveAttempt(null); // Xóa bài thi đang làm
          toast.success("Submit exam successfully!");
          return res.data.data;
        } else if (res.data.code === 1075) {
          // Invalid exam session - account is taking test on different device
          toast.error(res.data.message || "Invalid exam session, your account is currently taking this test on a different device.");
          throw new Error(res.data.message || "Invalid exam session, your account is currently taking this test on a different device.");
        } else {
          throw new Error(res.data.message || "Failed to submit attempt");
        }
      } catch (err) {
        const axiosError = err as { response?: { data?: { code?: number; message?: string } } };
        // Check if the error response contains code 1075
        if (axiosError.response?.data?.code === 1075) {
          const message = axiosError.response.data.message || "Invalid exam session, your account is currently taking this test on a different device.";
          toast.error(message);
          setError(message);
          throw new Error(message);
        }
        const errorMessage = handleError(err, "Failed to submit attempt");
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Đánh giá (rate) bài thi.
   */
  const rateAttempt = useCallback(
    async (attemptId: string, payload: RateAttemptPayload) => {
      setLoading(true);
      setError(null);
      try {
        await ExamAttemptService.rate(attemptId, payload);
        toast.success("Your rating has been submitted!");
      } catch (err) {
        handleError(err, "Failed to rate attempt");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Lấy kết quả chi tiết của một lần thi.
   */
  const fetchAttemptResult = useCallback(async (attemptId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ExamAttemptService.getResult(attemptId);
      if (res.data.code === 0 || res.data.code === 1000) {
        setAttemptResultDetail(res.data.data);
        return res.data.data;
      } else {
        throw new Error(res.data.message || "Failed to load attempt result");
      }
    } catch (err) {
      handleError(err, "Failed to load attempt result");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Subscribe to grading result via SSE (Server-Sent Events) using fetch with streaming.
   * @param attemptId - The attempt ID to subscribe to
   * @param onStatusUpdate - Callback for status updates (e.g., "Waiting for grading...")
   * @returns Promise that resolves with the result when grading is complete
   */
  const subscribeAttemptResult = useCallback(
    async (
      attemptId: string,
      onStatusUpdate?: (status: string) => void
    ): Promise<AttemptResultDetail | null> => {
      setLoading(true);
      setError(null);

      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      const sseUrl = `${API_URL}/exam-attempts/${attemptId}/subscribe`;

      try {
        const response = await fetch(sseUrl, {
          method: "GET",
          headers: {
            "Accept": "text/event-stream",
            "Authorization": `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Failed to get response reader");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log("[SSE] Stream closed by server");
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE format: "event:xxx\ndata:yyy\n\n"
          const lines = buffer.split("\n");
          buffer = ""; // Reset buffer

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line === "") continue;

            // Handle event line
            if (line.startsWith("event:")) {
              const eventType = line.substring(6).trim();
              console.log("[SSE] Event type:", eventType);
              continue;
            }

            // Handle data line
            if (line.startsWith("data:")) {
              const data = line.substring(5).trim();
              console.log("[SSE] Received data:", data);

              // Check if it's a status update (waiting message)
              if (data.includes("Waiting") || data.includes("grading")) {
                onStatusUpdate?.(data);
                continue;
              }

              // Try to parse as JSON (final result)
              try {
                const result = JSON.parse(data);

                // Check if result contains attemptId (indicates final result)
                if (result && (result.attemptId || result.data?.attemptId)) {
                  const finalResult = result.data || result;
                  console.log("[SSE] Grading completed:", finalResult);

                  reader.cancel();
                  setLoading(false);
                  setAttemptResultDetail(finalResult as AttemptResultDetail);
                  toast.success("Result details are ready!");
                  return finalResult as AttemptResultDetail;
                }
              } catch {
                // Not JSON, treat as status message
                onStatusUpdate?.(data);
              }
            } else {
              // Keep unparsed line in buffer for next iteration
              buffer = lines.slice(i).join("\n");
              break;
            }
          }
        }

        // Stream ended without result - try to fetch directly
        console.log("[SSE] Stream ended, fetching result directly...");
        const res = await ExamAttemptService.getResult(attemptId);
        if (res.data.code === 0 || res.data.code === 1000) {
          setLoading(false);
          setAttemptResultDetail(res.data.data);
          toast.success("Result details are ready!");
          return res.data.data;
        }

        setLoading(false);
        setError("Failed to get grading result");
        return null;
      } catch (err) {
        console.error("[SSE] Error:", err);
        setLoading(false);
        setError("Failed to connect to grading service");

        // Fallback: try to fetch result directly
        try {
          const res = await ExamAttemptService.getResult(attemptId);
          if (res.data.code === 0 || res.data.code === 1000) {
            setAttemptResultDetail(res.data.data);
            toast.success("Result details are ready!");
            return res.data.data;
          }
        } catch {
          // Ignore fallback error
        }

        return null;
      }
    },
    []
  );

  /**
   * Lưu tiến độ làm bài (thường dùng cho Auto-save hoặc nút "Lưu tạm").
   * Hàm này thường không nên hiện toast success liên tục để tránh spam, 
   * trừ khi có lỗi.
   */
  const saveProgress = useCallback(
    async (attemptId: string, payload: SaveProgressPayload) => {
      // Lưu ý: Có thể không cần set loading toàn cục nếu muốn save ngầm (silent save)
      // Ở đây mình set loading để có thể hiển thị trạng thái "Đang lưu..."
      setLoading(true);
      try {
        const res = await ExamAttemptService.saveProgress(attemptId, payload);
        if (res.data.code === 0 || res.data.code === 1000) {
          // Success - có thể return true để component biết đã lưu xong
          return true;
        } else if (res.data.code === 1075) {
          // Invalid exam session - account is taking test on different device
          toast.error(res.data.message || "Invalid exam session, your account is currently taking this test on a different device.");
          return false;
        } else {
          console.error("Save progress failed:", res.data.message, res.data);
          return false;
        }
      } catch (err) {
        const axiosError = err as { response?: { data?: { code?: number; message?: string }; status?: number } };
        console.error("Save progress error:", err);
        console.error("API Error Details:", axiosError.response?.data);
        console.error("API Status:", axiosError.response?.status);
        // Check if the error response contains code 1075
        if (axiosError.response?.data?.code === 1075) {
          toast.error(axiosError.response.data.message || "Invalid exam session, your account is currently taking this test on a different device.");
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Chấm điểm thủ công (Dành cho Teacher grading).
   */
  const gradeAttempt = useCallback(
    async (attemptId: string, payload: ManualGradePayload) => {
      setLoading(true);
      setError(null);
      try {
        const res = await ExamAttemptService.manualGrade(attemptId, payload);
        if (res.data.code === 0 || res.data.code === 1000) {
          toast.success("Grade saved successfully!");
          // Cập nhật lại chi tiết kết quả nếu đang xem
          // setAttemptResultDetail(res.data.data); 
          return res.data.data;
        } else {
          throw new Error(res.data.message || "Failed to save grade");
        }
      } catch (err) {
        handleError(err, "Failed to save grade");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   *  Yêu cầu phúc khảo bài thi.
   */
  const requestReview = useCallback(
    async (attemptId: string, payload: RequestReviewPayload) => {
      setLoading(true);
      setError(null);
      try {
        const res = await ExamAttemptService.requestReview(attemptId, payload);
        if (res.data.code === 0 || res.data.code === 1000) {
          toast.success("Request review successfully!");
          return true;
        } else {
          throw new Error(res.data.message || "Failed to request review");
        }
      } catch (err) {
        handleError(err, "Failed to request review");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    activeAttempt,
    submissionResult,
    attemptResultDetail,
    startSingleAttempt,
    startComboAttempt,
    startComboRandomAttempt,
    submitAttempt,
    rateAttempt,
    fetchAttemptResult,
    subscribeAttemptResult,
    saveProgress,
    gradeAttempt,
    requestReview
  };
};

/**
 * 🔹 Hook quản lý LỊCH SỬ THI (my-history).
 */
export const useExamAttemptHistory = () => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo<HistoryRecord> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSorts, setCurrentSorts] = useState<string[]>(["startTime:desc"]);

  const handleError = (err: unknown, defaultMessage: string) => {
    setLoading(false);
    const e = err as { response?: { data?: ApiResponse<unknown> } } & Error;
    const apiMessage = e.response?.data?.message;
    const message = apiMessage || e.message || defaultMessage;
    setError(message);
    toast.error(message);
  };

  const fetchHistory = useCallback(
    async (page = 0, size = 10, sorts?: string[]) => {
      setLoading(true);
      setError(null);
      try {
        const res = await ExamAttemptService.getMyHistory({
          pageNo: page,
          pageSize: size,
          sorts,
        });
        if (res.data.code === 0 || res.data.code === 1000) {
          const data = res.data.data;
          // Handle different response structures
          if (data.items) {
            setHistory(data.items as unknown as HistoryRecord[]);
            setPageInfo(data as unknown as PageInfo<HistoryRecord>);
          } else if (Array.isArray(data)) {
            setHistory(data as unknown as HistoryRecord[]);
            setPageInfo({ pageNo: 0, pageSize: data.length, totalElements: data.length, totalElement: data.length } as PageInfo<HistoryRecord>);
          } else {
            setHistory([]);
            setPageInfo(null);
          }
        } else {
          throw new Error(res.data.message || "Failed to load history");
        }
      } catch (err) {
        handleError(err, "Failed to load history");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchHistory(0, 10, currentSorts);
  }, [fetchHistory]);

  // Handle sort change - call API with new sort
  const handleSortChange = useCallback((newSorts: string[]) => {
    setCurrentSorts(newSorts);
    fetchHistory(0, pageInfo?.pageSize || 10, newSorts);
  }, [fetchHistory, pageInfo?.pageSize]);

  const handlePageChange = (newPage: number, newSize: number) => {
    fetchHistory(newPage - 1, newSize, currentSorts);
  };

  return {
    history,
    pageInfo,
    loading,
    error,
    fetchHistory,
    handlePageChange,
    handleSortChange,
    currentSorts,
  };
};

/**
 * Hook quản lý danh sách chấm điểm của giáo viên (Teacher Review Queue).
 */
export const useTeacherReviewQueue = () => {
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo<ReviewQueueItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown, defaultMessage: string) => {
    setLoading(false);
    const e = err as { response?: { data?: ApiResponse<unknown> } } & Error;
    const apiMessage = e.response?.data?.message;
    const message = apiMessage || e.message || defaultMessage;
    setError(message);
    toast.error(message);
  };

  const fetchReviewQueue = useCallback(
    async (params?: ReviewQueueQueryParams) => {
      setLoading(true);
      setError(null);
      try {
        const res = await ExamAttemptService.getTeacherReviewQueue(params);
        if (res.data.code === 0 || res.data.code === 1000) {
          const data = res.data.data;
          // Kiểm tra structure trả về từ API
          if (data.items) {
            setQueue(data.items);
            setPageInfo(data);
          } else if (Array.isArray(data)) {
            setQueue(data);
            setPageInfo(null); // Hoặc tạo fake page info nếu cần
          } else {
            setQueue([]);
          }
        } else {
          throw new Error(res.data.message || "Failed to fetch review queue");
        }
      } catch (err) {
        handleError(err, "Failed to fetch review queue");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    queue,
    pageInfo,
    loading,
    error,
    fetchReviewQueue
  };
};
