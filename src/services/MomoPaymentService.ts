// src/services/MomoPaymentService.ts
import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type {
  CreatePaymentPayload,
  CreatePaymentResponse,
  IpnPayload,
  IpnResponse,
  RedirectParams,
  RedirectResponse,
  TransactionResponse, // Bỏ TransactionParams vì không dùng nữa
  WalletBalanceSummary,
} from "~/types/momoPayment";

const MomoPaymentService = {
  // 1. Tạo payment request -> backend trả link thanh toán MoMo
  createPayment(
    payload: CreatePaymentPayload
  ): Promise<AxiosResponse<ApiResponse<CreatePaymentResponse>>> {
    const { orderId, requestId, amount, ...rest } = payload;
    return axiosInstance.post(`/payment/momo/create`, rest, {
      params: {
        amount,
        orderId,
        requestId,
      },
    });
  },

  // 2. MoMo gọi về IPN để báo trạng thái thanh toán
  ipn(payload: IpnPayload): Promise<AxiosResponse<ApiResponse<IpnResponse>>> {
    return axiosInstance.post(`/payment/momo/ipn`, payload);
  },

  // 3. Redirect sau khi user thanh toán xong (Kiểm tra kết quả)
  redirect(
    params: RedirectParams
  ): Promise<AxiosResponse<ApiResponse<RedirectResponse>>> {
    return axiosInstance.get(`/payment/momo/redirect`, { params });
  },

  // API: GET /api/transactions: backend trả thẳng mảng không bọc ApiResponse
  getTransactions(): Promise<AxiosResponse<TransactionResponse[]>> {
    return axiosInstance.get(`/api/transactions`);
  },

  getPaymentbyUser(): Promise<AxiosResponse<ApiResponse<WalletBalanceSummary>>> {
    return axiosInstance.get(`/payments/by-user`);
  },
};

export default MomoPaymentService; 