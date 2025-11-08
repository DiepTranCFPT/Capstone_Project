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
  RateAttemptPayload,
  StartComboPayload,
  StartComboRandomPayload,
  StartSinglePayload,
} from "~/types/examAttempt";
import type { ApiResponse } from "~/types/api";
import type { PageInfo } from "~/types/pagination";

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
        const res = await ExamAttemptService.submit(attemptId, payload);
        if (res.data.code === 0 || res.data.code === 1000) {
          setSubmissionResult(res.data.data);
          setActiveAttempt(null); // Xóa bài thi đang làm
          toast.success("Nộp bài thành công!");
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
  };
};

/**
 * 🔹 Hook quản lý LỊCH SỬ THI (my-history).
 */
export const useExamAttemptHistory = () => {
  const [history, setHistory] = useState<ExamResult[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo<ExamResult> | null>(null);
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
          setHistory(res.data.data.items || []);
          setPageInfo(res.data.data);
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
    fetchHistory(0, 10, ["startTime_desc"]); // Tải trang đầu tiên khi hook được dùng
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (newPage: number, newSize: number) => {
    fetchHistory(newPage - 1, newSize, ["startTime_desc"]); // Antd page là 1-based
  };

  return {
    history,
    pageInfo,
    loading,
    error,
    fetchHistory,
    handlePageChange,
  };
};