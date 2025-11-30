// src/services/tokenTransactionService.ts
import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type {
  WithdrawRequestPayload,
  WithdrawRequestResponse,
  ConfirmWithdrawalPayload,
  ConfirmWithdrawalResponse,
  WithdrawRequest,
} from "~/types/tokenTransaction";

const TokenTransactionService = {
  // POST /api/token-transaction/withdraw
  // Tạo yêu cầu rút tiền
  withdraw(
    payload: WithdrawRequestPayload
  ): Promise<AxiosResponse<ApiResponse<WithdrawRequestResponse>>> {
    return axiosInstance.post(`/api/token-transaction/withdraw`, payload);
  },

  // POST /api/token-transaction/confirm-withdrawal
  // Xác nhận yêu cầu rút tiền
  confirmWithdrawal(
    payload: ConfirmWithdrawalPayload
  ): Promise<AxiosResponse<ApiResponse<ConfirmWithdrawalResponse>>> {
    return axiosInstance.post(`/api/token-transaction/confirm-withdrawal`, payload);
  },

  // GET /api/admin/withdraw-requests
  // Lấy danh sách yêu cầu rút tiền (Admin only)
  getWithdrawRequests(params?: {
    pageNo?: number;
    pageSize?: number;
    status?: string;
    [key: string]: unknown;
  }): Promise<AxiosResponse<ApiResponse<WithdrawRequest[]>>> {
    return axiosInstance.get(`/api/admin/withdraw-requests`, { params });
  },
};

export default TokenTransactionService;

