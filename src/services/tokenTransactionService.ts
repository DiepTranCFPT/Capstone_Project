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
  PaymentMethod,
  UserTokenTransaction,
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

  // Alias cho admin, dùng chung implement để tránh trùng lặp
  getAdminWithdrawRequests(params?: {
    pageNo?: number;
    pageSize?: number;
    status?: string;
    [key: string]: unknown;
  }): Promise<AxiosResponse<ApiResponse<WithdrawRequest[]>>> {
    return TokenTransactionService.getWithdrawRequests(params);
  },

  // GET /api/payment-method
  // Lấy danh sách phương thức thanh toán
  getPaymentMethods(): Promise<AxiosResponse<ApiResponse<PaymentMethod[]>>> {
    return axiosInstance.get(`/api/payment-method`);
  },

  // POST /api/payment-method
  // Tạo phương thức thanh toán mới
  // API yêu cầu query params: bankingNumber và nameBanking
  createPaymentMethod(
    payload: { bankingNumber: string; nameBanking: string; authorName: string }
  ): Promise<AxiosResponse<ApiResponse<PaymentMethod>>> {
    return axiosInstance.post(`/api/payment-method`, null, {
      params: {
        bankingNumber: payload.bankingNumber,
        nameBanking: payload.nameBanking,
        authorName: payload.authorName,
      },
    });
  },

  // GET /api/token-transaction/user
  // Lấy danh sách giao dịch token của user hiện tại
  getUserTokenTransactions(): Promise<
    AxiosResponse<ApiResponse<UserTokenTransaction[]>>
  > {
    return axiosInstance.get(`/api/token-transaction/user`);
  },
};

export default TokenTransactionService;

