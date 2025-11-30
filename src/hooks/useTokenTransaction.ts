import { useState, useCallback } from "react";
import TokenTransactionService from "~/services/tokenTransactionService";
import type {
  WithdrawRequestPayload,
  WithdrawRequestResponse,
  ConfirmWithdrawalPayload,
  ConfirmWithdrawalResponse,
  WithdrawRequest,
} from "~/types/tokenTransaction";
import type { ApiResponse } from "~/types/api";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const axiosError = error as { response?: { data?: { message?: string; error?: string } } };
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === "string" && error.trim() !== "") {
    return error;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return fallback;
};

export const useTokenTransaction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([]);

  // Tạo yêu cầu rút tiền
  const withdraw = useCallback(
    async (
      payload: WithdrawRequestPayload
    ): Promise<ApiResponse<WithdrawRequestResponse> | null> => {
      try {
        setLoading(true);
        setError(null);
        const res = await TokenTransactionService.withdraw(payload);
        return res.data;
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Đã xảy ra lỗi khi tạo yêu cầu rút tiền.");
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Xác nhận yêu cầu rút tiền
  const confirmWithdrawal = useCallback(
    async (
      payload: ConfirmWithdrawalPayload
    ): Promise<ApiResponse<ConfirmWithdrawalResponse> | null> => {
      try {
        setLoading(true);
        setError(null);
        const res = await TokenTransactionService.confirmWithdrawal(payload);
        return res.data;
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Đã xảy ra lỗi khi xác nhận rút tiền.");
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Lấy danh sách yêu cầu rút tiền (Admin)
  const fetchWithdrawRequests = useCallback(
    async (params?: {
      pageNo?: number;
      pageSize?: number;
      status?: string;
      [key: string]: unknown;
    }): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const res = await TokenTransactionService.getWithdrawRequests(params);
        const responseData = res.data?.data;
        
        if (Array.isArray(responseData)) {
          setWithdrawRequests(responseData);
        } else {
          setWithdrawRequests([]);
        }
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Đã xảy ra lỗi khi lấy danh sách yêu cầu rút tiền.");
        setError(message);
        setWithdrawRequests([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    withdrawRequests,
    withdraw,
    confirmWithdrawal,
    fetchWithdrawRequests,
  };
};

