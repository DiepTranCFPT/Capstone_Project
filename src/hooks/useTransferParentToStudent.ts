import { useState } from "react";
import PaymentService from "~/services/PaymentService";
import type {
  TransferParentToStudentRequest,
  TransferParentToStudentResponse,
} from "~/types/payment";

type TransferError = { message?: string; response?: { data?: unknown } } | null;

export default function useTransferParentToStudent() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<TransferError>(null);
  const [result, setResult] = useState<TransferParentToStudentResponse | null>(null);

  const transfer = async (
    payload: TransferParentToStudentRequest
  ): Promise<TransferParentToStudentResponse> => {
    try {
      setLoading(true);
      setError(null);

      const res = await PaymentService.transferParentToStudent(payload);
      setResult(res.data);
      return res.data;
    } catch (err) {
      const typedErr = err as { response?: { data?: unknown }; message?: string };
      setError(typedErr.response?.data ? (typedErr.response.data as TransferError) : typedErr);
      throw typedErr;
    } finally {
      setLoading(false);
    }
  };

  return {
    transfer,
    loading,
    error,
    result,
  };
}
