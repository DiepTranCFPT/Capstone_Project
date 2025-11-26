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
} from "~/types/momoPayment";

const MomoPaymentService = {
  // Tạo payment request → backend trả link thanh toán MoMo
  createPayment(
    payload: CreatePaymentPayload
  ): Promise<AxiosResponse<ApiResponse<CreatePaymentResponse>>> {
    return axiosInstance.post(`/payment/momo/create`, payload);
  },

  // MoMo gọi về IPN để báo trạng thái thanh toán
  // FE thường không dùng, nhưng mình vẫn viết theo mẫu
  ipn(payload: IpnPayload): Promise<AxiosResponse<ApiResponse<IpnResponse>>> {
    return axiosInstance.post(`/payment/momo/ipn`, payload);
  },

  // Redirect sau khi user thanh toán xong
  // FE thường dùng GET để kiểm tra kết quả
  redirect(
    params: RedirectParams
  ): Promise<AxiosResponse<ApiResponse<RedirectResponse>>> {
    return axiosInstance.get(`/payment/momo/redirect`, { params });
  },
};

export default MomoPaymentService;
