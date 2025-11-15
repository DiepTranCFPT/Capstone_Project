import { useState, useCallback } from "react";
import LearningMaterialService from "~/services/learningMaterialService";

const getErrorMessage = (error: unknown, fallback: string): string => {
  // Kiểm tra nếu là AxiosError và có response data
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

export const useMaterialRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (learningMaterialId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await LearningMaterialService.register(learningMaterialId);
      return res.data.data;
    } catch (err: unknown) {
      console.error("❌ Register material error:", err);
      const message = getErrorMessage(err, "Đã xảy ra lỗi khi đăng ký tài liệu.");
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    register,
    loading,
    error,
  };
};

