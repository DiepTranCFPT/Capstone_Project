// src/hooks/useCommunity.ts
import { useCallback, useState } from "react";
import CommunityService from "~/services/communityService";
import type {
  Community,
  CommunityPost,
  CommunityQueryParams,
  CommunitySearchParams,
  CommunityUpdatePayload,
  CreateCommunityPostPayload,
} from "~/types/community";
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

const extractFromPaginated = <T,>(
  raw: PaginatedResponse<T> | T[] | null | undefined
): { items: T[]; pageInfo: Pick<PaginatedResponse<T>, "totalElements" | "totalPages"> | null } => {
  if (!raw) {
    return { items: [], pageInfo: null };
  }

  if (Array.isArray(raw)) {
    return {
      items: raw,
      pageInfo: null,
    };
  }

  const paginated = raw as PaginatedResponse<T>;
  return {
    items: paginated.content || [],
    pageInfo: {
      totalElements: paginated.totalElements,
      totalPages: paginated.totalPages,
    },
  };
};

export const useCommunity = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [communities, setCommunities] = useState<Community[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);

  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // GET /communities
  const fetchCommunities = useCallback(
    async (params?: CommunityQueryParams): Promise<Community[]> => {
      try {
        setLoading(true);
        setError(null);

        const response = await CommunityService.getCommunities(params);
        const apiResponse =
          response.data as ApiResponse<
            PaginatedResponse<Community> | Community[]
          >;

        const { items, pageInfo } = extractFromPaginated<Community>(
          apiResponse.data
        );

        setCommunities(items);
        setTotalElements(pageInfo?.totalElements ?? items.length);
        setTotalPages(pageInfo?.totalPages ?? 1);

        return items;
      } catch (err) {
        setError(
          getErrorMessage(err, "Không thể tải danh sách cộng đồng (communities).")
        );
        setCommunities([]);
        setTotalElements(0);
        setTotalPages(0);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // GET /communities/search
  const searchCommunities = useCallback(
    async (params?: CommunitySearchParams): Promise<Community[]> => {
      try {
        setLoading(true);
        setError(null);

        const response = await CommunityService.searchCommunities(params);
        const apiResponse =
          response.data as ApiResponse<
            PaginatedResponse<Community> | Community[]
          >;

        const { items, pageInfo } = extractFromPaginated<Community>(
          apiResponse.data
        );

        setCommunities(items);
        setTotalElements(pageInfo?.totalElements ?? items.length);
        setTotalPages(pageInfo?.totalPages ?? 1);

        return items;
      } catch (err) {
        setError(
          getErrorMessage(err, "Không thể tìm kiếm danh sách cộng đồng.")
        );
        setCommunities([]);
        setTotalElements(0);
        setTotalPages(0);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // GET /communities/{communityId}/posts
  const fetchCommunityPosts = useCallback(
    async (
      communityId: string | number,
      params?: CommunityQueryParams
    ): Promise<CommunityPost[]> => {
      try {
        setLoading(true);
        setError(null);

        const response = await CommunityService.getCommunityPosts(
          communityId,
          params
        );
        const apiResponse =
          response.data as ApiResponse<
            PaginatedResponse<CommunityPost> | CommunityPost[]
          >;

        const { items, pageInfo } = extractFromPaginated<CommunityPost>(
          apiResponse.data
        );

        setCommunityPosts(items);
        setTotalElements(pageInfo?.totalElements ?? items.length);
        setTotalPages(pageInfo?.totalPages ?? 1);

        return items;
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Không thể tải danh sách bài viết của cộng đồng."
          )
        );
        setCommunityPosts([]);
        setTotalElements(0);
        setTotalPages(0);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // POST /communities/{communityId}/posts
  const createCommunityPost = useCallback(
    async (
      communityId: string | number,
      payload: CreateCommunityPostPayload
    ): Promise<CommunityPost | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await CommunityService.createCommunityPost(
          communityId,
          payload
        );
        const apiResponse =
          response.data as ApiResponse<CommunityPost>;

        const createdPost = apiResponse.data;
        if (createdPost) {
          setCommunityPosts((prev) => [createdPost, ...prev]);
        }
        return createdPost ?? null;
      } catch (err) {
        setError(
          getErrorMessage(err, "Không thể tạo bài viết mới trong cộng đồng.")
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // PUT /communities/{communityId}
  const updateCommunity = useCallback(
    async (
      communityId: string | number,
      payload: CommunityUpdatePayload
    ): Promise<Community | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await CommunityService.updateCommunity(
          communityId,
          payload
        );
        const apiResponse = response.data as ApiResponse<Community>;
        const updated = apiResponse.data;

        if (updated) {
          setCommunities((prev) =>
            prev.map((item) =>
              String(item.id) === String(communityId) ? { ...item, ...updated } : item
            )
          );
        }

        return updated ?? null;
      } catch (err) {
        setError(
          getErrorMessage(err, "Không thể cập nhật thông tin cộng đồng.")
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
    communities,
    communityPosts,
    totalElements,
    totalPages,
    fetchCommunities,
    searchCommunities,
    fetchCommunityPosts,
    createCommunityPost,
    updateCommunity,
  };
};

export default useCommunity;


