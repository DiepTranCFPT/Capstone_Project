// src/hooks/useLearningMaterialRatings.ts
import { useState, useCallback } from "react";
import LearningMaterialRatingService from "~/services/learningMaterialRatingService";
import type {
  LearningMaterialRating,
  LearningMaterialRatingPayload,
  LearningMaterialRatingStatistics,
} from "~/types/learningMaterialRating";
import type { ApiResponse } from "~/types/api";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosError = error as {
      response?: { data?: { message?: string; error?: string } };
    };
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

export const useLearningMaterialRatings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ratings, setRatings] = useState<LearningMaterialRating[]>([]);
  const [statistics, setStatistics] =
    useState<LearningMaterialRatingStatistics | null>(null);
  const [myRating, setMyRating] = useState<LearningMaterialRating | null>(null);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const fetchRatingsByMaterial = useCallback(
    async (
      materialId: string,
      page: number = 0,
      size: number = 10,
      sortBy: string = "createdAt",
      sortDir: string = "DESC"
    ): Promise<LearningMaterialRating[]> => {
      try {
        setLoading(true);
        setError(null);

        const response = await LearningMaterialRatingService.getRatingsByMaterial(
          materialId,
          page,
          size,
          sortBy,
          sortDir
        );

        const responseData = response.data as
          | ApiResponse<{
              content: LearningMaterialRating[];
              totalElements: number;
              totalPages: number;
              pageable?: { pageNumber?: number };
            }>
          | null
          | undefined;

        if (responseData && responseData.data) {
          const paginatedData = responseData.data;
          const ratingsArray = paginatedData.content || [];

          setRatings(ratingsArray);
          setTotalElements(paginatedData.totalElements || 0);
          setTotalPages(paginatedData.totalPages || 0);
          setCurrentPage(paginatedData.pageable?.pageNumber || page);

          return ratingsArray;
        }

        setRatings([]);
        setTotalElements(0);
        setTotalPages(0);
        setCurrentPage(0);
        return [];
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Không thể tải danh sách đánh giá cho tài liệu học."
          )
        );
        setRatings([]);
        setTotalElements(0);
        setTotalPages(0);
        setCurrentPage(0);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchRatingsByStudent = useCallback(
    async (studentId: string): Promise<LearningMaterialRating[]> => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await LearningMaterialRatingService.getRatingsByStudent(studentId);
        const responseData =
          response.data as
          | ApiResponse<LearningMaterialRating[]>
          | LearningMaterialRating[];

        const rawData =
          Array.isArray(responseData) || !responseData
            ? responseData
            : (responseData as ApiResponse<LearningMaterialRating[]>).data ??
              responseData;

        if (Array.isArray(rawData)) {
          setRatings(rawData);
          return rawData;
        }

        setRatings([]);
        return [];
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Không thể tải danh sách đánh giá mà học sinh đã gửi cho tài liệu."
          )
        );
        setRatings([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchRatingByMaterialAndStudent = useCallback(
    async (
      materialId: string,
      studentId: string
    ): Promise<LearningMaterialRating | null> => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await LearningMaterialRatingService.getRatingByMaterialAndStudent(
            materialId,
            studentId
          );

        const responseData =
          response.data as
          | ApiResponse<LearningMaterialRating>
          | LearningMaterialRating
          | null;

        const rawData =
          !responseData || ("rating" in (responseData as LearningMaterialRating))
            ? responseData
            : (responseData as ApiResponse<LearningMaterialRating>).data ??
              null;

        if (rawData && typeof rawData === "object") {
          setMyRating(rawData as LearningMaterialRating);
          return rawData as LearningMaterialRating;
        }

        setMyRating(null);
        return null;
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Không thể tải đánh giá của học sinh cho tài liệu này."
          )
        );
        setMyRating(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchStatisticsByMaterial = useCallback(
    async (
      materialId: string
    ): Promise<LearningMaterialRatingStatistics | null> => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await LearningMaterialRatingService.getStatisticsByMaterial(
            materialId
          );

        const responseData =
          response.data as
          | ApiResponse<LearningMaterialRatingStatistics>
          | LearningMaterialRatingStatistics
          | null;

        const rawData =
          !responseData ||
          ("averageRating" in
            (responseData as LearningMaterialRatingStatistics))
            ? responseData
            : (
                responseData as ApiResponse<LearningMaterialRatingStatistics>
              ).data ?? null;

        if (rawData && typeof rawData === "object") {
          setStatistics(rawData as LearningMaterialRatingStatistics);
          return rawData as LearningMaterialRatingStatistics;
        }

        setStatistics(null);
        return null;
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Không thể tải thống kê đánh giá cho tài liệu học."
          )
        );
        setStatistics(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createRating = useCallback(
    async (
      payload: LearningMaterialRatingPayload
    ): Promise<LearningMaterialRating | null> => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await LearningMaterialRatingService.createRating(payload);
        const responseData =
          response.data as
          | ApiResponse<LearningMaterialRating>
          | LearningMaterialRating;

        const rawData =
          responseData &&
          "rating" in (responseData as LearningMaterialRating)
            ? responseData
            : (responseData as ApiResponse<LearningMaterialRating>).data ??
              responseData;

        if (rawData && typeof rawData === "object") {
          const rating = rawData as LearningMaterialRating;
          setMyRating(rating);
          return rating;
        }

        return null;
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Không thể gửi đánh giá cho tài liệu học."
          )
        );
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
    ratings,
    statistics,
    myRating,
    totalElements,
    totalPages,
    currentPage,
    fetchRatingsByMaterial,
    fetchRatingsByStudent,
    fetchRatingByMaterialAndStudent,
    fetchStatisticsByMaterial,
    createRating,
  };
};

export default useLearningMaterialRatings;



