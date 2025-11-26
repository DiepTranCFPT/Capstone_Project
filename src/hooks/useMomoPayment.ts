import { useState, useCallback } from "react";

import type {
  CreatePaymentPayload,
  CreatePaymentResponse,
  IpnPayload,
  IpnResponse,
  RedirectParams,
  RedirectResponse,
} from "~/types/momoPayment";
import type { ApiResponse } from "~/types/api";
import MomoPaymentService from "~/services/MomoPaymentService ";

export default function useMomoPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tạo thanh toán
  const createPayment = useCallback(
    async (
      payload: CreatePaymentPayload
    ): Promise<ApiResponse<CreatePaymentResponse> | null> => {
      try {
        setLoading(true);
        setError(null);

        const res = await MomoPaymentService.createPayment(payload);
        return res.data;
      } catch (err: unknown) {
        const axiosError = err as {
          response?: { data?: { message?: string } };
        };
        setError(
          axiosError.response?.data?.message || "Create payment failed"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // IPN (FE hiếm dùng)
  const ipn = useCallback(
    async (
      payload: IpnPayload
    ): Promise<ApiResponse<IpnResponse> | null> => {
      try {
        setLoading(true);
        setError(null);

        const res = await MomoPaymentService.ipn(payload);
        return res.data;
      } catch (err: unknown) {
        const axiosError = err as {
          response?: { data?: { message?: string } };
        };
        setError(axiosError.response?.data?.message || "IPN failed");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Redirect result
  const redirect = useCallback(
    async (
      params: RedirectParams
    ): Promise<ApiResponse<RedirectResponse> | null> => {
      try {
        setLoading(true);
        setError(null);

        const res = await MomoPaymentService.redirect(params);
        return res.data;
      } catch (err: unknown) {
        const axiosError = err as {
          response?: { data?: { message?: string } };
        };
        setError(axiosError.response?.data?.message || "Redirect failed");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    createPayment,
    ipn,
    redirect,
  };
}
