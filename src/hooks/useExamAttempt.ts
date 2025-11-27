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
          throw new Error(res.data.message || "Không thể bắt đầu bài thi");
        }
      } catch (err) {
        handleError(err, "Không thể bắt đầu bài thi");
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
          throw new Error(res.data.message || "Không thể bắt đầu bài thi tổ hợp");
        }
      } catch (err) {
        handleError(err, "Không thể bắt đầu bài thi tổ hợp");
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
          throw new Error(
            res.data.message || "Không thể bắt đầu bài thi ngẫu nhiên"
          );
        }
      } catch (err) {
        handleError(err, "Không thể bắt đầu bài thi ngẫu nhiên");
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
        // Chạy subscribe API ngầm (không đợi kết quả)
        ExamAttemptService.subscribe(attemptId)
          .then((subscribeRes) => {
            console.log('subscribe completed', subscribeRes);
            if (subscribeRes.data.code === 0 || subscribeRes.data.code === 1000) {
              toast.success("Kết quả chi tiết đã sẵn sàng! Vào xem ngay.");
              setAttemptResultDetail(subscribeRes.data.data);
            }
          })
          .catch((err) => {
            console.error('Subscribe failed:', err);
            toast.error("Không thể tải kết quả chi tiết. Vui lòng thử lại sau.");
          });

        // Submit API chạy ngay không cần đợi subscribe
        const res = await ExamAttemptService.submit(attemptId, payload);
        if (res.data.code === 0 || res.data.code === 1000) {
          setSubmissionResult(res.data.data);
          setActiveAttempt(null); // Xóa bài thi đang làm
          toast.success("Nộp bài thành công!, đợi thống báo kết quả chi tiết.");
          return res.data.data;
        } else {
          throw new Error(res.data.message || "Không thể nộp bài");
        }
      } catch (err) {
        const errorMessage = handleError(err, "Không thể nộp bài");
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
        toast.success("Đánh giá của bạn đã được gửi!");
      } catch (err) {
        handleError(err, "Không thể gửi đánh giá");
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
        throw new Error(res.data.message || "Không thể tải kết quả chi tiết");
      }
    } catch (err) {
      handleError(err, "Không thể tải kết quả chi tiết");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lấy kết quả chi tiết của một lần thi (subscribe).
   */
  const subscribeAttemptResult = useCallback(async (attemptId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ExamAttemptService.subscribe(attemptId);
      if (res.data.code === 0 || res.data.code === 1000) {
        setAttemptResultDetail(res.data.data);
        return res.data.data;
      } else {
        throw new Error(res.data.message || "Không thể tải kết quả chi tiết");
      }
    } catch (err) {
      handleError(err, "Không thể tải kết quả chi tiết");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

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
        } else {
          console.error("Save progress failed:", res.data.message);
          return false;
        }
      } catch (err) {
        console.error("Save progress error:", err);
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
          toast.success("Đã lưu điểm chấm thành công!");
          // Cập nhật lại chi tiết kết quả nếu đang xem
          // setAttemptResultDetail(res.data.data); 
          return res.data.data;
        } else {
          throw new Error(res.data.message || "Không thể lưu điểm chấm");
        }
      } catch (err) {
        handleError(err, "Không thể lưu điểm chấm");
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
          toast.success("Đã gửi yêu cầu phúc khảo thành công!");
          return true;
        } else {
          throw new Error(res.data.message || "Không thể gửi yêu cầu phúc khảo");
        }
      } catch (err) {
        handleError(err, "Không thể gửi yêu cầu phúc khảo");
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
  const [sorts, setSorts] = useState<string[]>(["startTime_desc"]);

  if (!sorts) {
    setSorts(["startTime_desc"]);
  }

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
          throw new Error(res.data.message || "Không thể tải lịch sử thi");
        }
      } catch (err) {
        handleError(err, "Không thể tải lịch sử thi");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchHistory(0, 10, ["startTime_desc"]); // Keep default sorting for initial load
  }, [fetchHistory]);

  const handlePageChange = (newPage: number, newSize: number) => {
    fetchHistory(newPage - 1, newSize, ["startTime_desc"]);
  };

  return {
    history,
    pageInfo,
    loading,
    error,
    fetchHistory,
    handlePageChange,
    setSorts,
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
        handleError(err, "Không thể tải danh sách chờ chấm điểm");
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
