import { useState, useCallback } from "react";
import LearningMaterialRatingService from "~/services/learningMaterialRatingService";
import type {
  LearningMaterialRating,
  LearningMaterialRatingPayload,
  LearningMaterialRatingStatistics,
} from "~/types/learningMaterialRating";
import type { ApiResponse, PaginatedResponse } from "~/types/api";

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

        const responseData = response.data as ApiResponse<
          PaginatedResponse<LearningMaterialRating>
        >;

        if (responseData && responseData.data) {
          const paginatedData = responseData.data as PaginatedResponse<LearningMaterialRating>;
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
        const responseData = response.data as ApiResponse<
          LearningMaterialRating[]
        >;

        const rawData = responseData.data;

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
          response.data as ApiResponse<LearningMaterialRating>;

        const rating = responseData.data ?? null;

        if (rating && typeof rating === "object") {
          setMyRating(rating as LearningMaterialRating);
          return rating as LearningMaterialRating;
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
          response.data as ApiResponse<LearningMaterialRatingStatistics>;

        const statisticsData = responseData.data ?? null;

        if (statisticsData && typeof statisticsData === "object") {
          setStatistics(statisticsData as LearningMaterialRatingStatistics);
          return statisticsData as LearningMaterialRatingStatistics;
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
          response.data as ApiResponse<LearningMaterialRating>;

        const rating = responseData.data;

        if (rating && typeof rating === "object") {
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



