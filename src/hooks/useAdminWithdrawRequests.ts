import { useState, useCallback } from "react";
import TokenTransactionService from "~/services/tokenTransactionService";
import type { WithdrawRequest } from "~/types/tokenTransaction";
import type { ApiResponse } from "~/types/api";

interface AdminWithdrawFilters {
  pageNo?: number;
  pageSize?: number;
  status?: string;
  [key: string]: unknown;
}

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

  return fallback;
};

export const useAdminWithdrawRequests = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  
  const [allLoading, setAllLoading] = useState(false);
  const [allError, setAllError] = useState<string | null>(null);
  const [allRequests, setAllRequests] = useState<WithdrawRequest[]>([]);

  const fetchWithdrawRequests = useCallback(async (filters?: AdminWithdrawFilters) => {
    try {
      setLoading(true);
      setError(null);

      const response = await TokenTransactionService.getAdminWithdrawRequests(filters);
      const responseData = response.data as ApiResponse<WithdrawRequest[]> | WithdrawRequest[];

      const rawData =
        Array.isArray(responseData) || !responseData
          ? responseData
          : (responseData as ApiResponse<WithdrawRequest[]>).data ?? responseData;

      if (Array.isArray(rawData)) {
        setRequests(rawData);
        return rawData;
      }

      if (
        rawData &&
        typeof rawData === "object" &&
        "content" in rawData &&
        Array.isArray((rawData as { content?: unknown }).content)
      ) {
        const content = (rawData as { content: WithdrawRequest[] }).content;
        setRequests(content);
        return content;
      }

      setRequests([]);
      return [];
    } catch (err) {
      setError(getErrorMessage(err, "Không thể tải danh sách yêu cầu rút tiền."));
      setRequests([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllWithdrawRequests = useCallback(async () => {
    try {
      setAllLoading(true);
      setAllError(null);

      const response = await TokenTransactionService.getAllWithdrawRequests();
      const responseData = response.data as ApiResponse<WithdrawRequest[]> | WithdrawRequest[];

      const rawData =
        Array.isArray(responseData) || !responseData
          ? responseData
          : (responseData as ApiResponse<WithdrawRequest[]>).data ?? responseData;

      if (Array.isArray(rawData)) {
        setAllRequests(rawData);
        return rawData;
      }

      if (
        rawData &&
        typeof rawData === "object" &&
        "content" in rawData &&
        Array.isArray((rawData as { content?: unknown }).content)
      ) {
        const content = (rawData as { content: WithdrawRequest[] }).content;
        setAllRequests(content);
        return content;
      }

      setAllRequests([]);
      return [];
    } catch (err) {
      setAllError(getErrorMessage(err, "Không thể tải tất cả yêu cầu rút tiền."));
      setAllRequests([]);
      return [];
    } finally {
      setAllLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    requests,
    fetchWithdrawRequests,
    allLoading,
    allError,
    allRequests,
    fetchAllWithdrawRequests,
  };
};

export default useAdminWithdrawRequests;



