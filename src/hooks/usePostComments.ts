import { useCallback, useState } from "react";
import CommunityService from "~/services/communityService";
import type {
  CommunityComment,
  CreateCommunityCommentPayload,
} from "~/types/community";
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

const usePostComments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [postComments, setPostComments] = useState<
    Record<string, CommunityComment[]>
  >({});

  // GET /posts/{postId}/comments
  const fetchPostComments = useCallback(
    async (postId: string | number): Promise<CommunityComment[]> => {
      try {
        setLoading(true);
        setError(null);

        const response = await CommunityService.getPostComments(postId);
        const apiResponse = response.data as ApiResponse<unknown>;
        const raw = apiResponse.data;

        let comments: CommunityComment[] = [];
        if (Array.isArray(raw)) {
          comments = raw as CommunityComment[];
        } else if (raw && typeof raw === "object" && "items" in (raw as any)) {
          const items = (raw as any).items;
          if (Array.isArray(items)) {
            comments = items as CommunityComment[];
          }
        }

        const key = String(postId);
        setPostComments((prev) => ({
          ...prev,
          [key]: comments,
        }));

        return comments;
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Không thể tải danh sách bình luận cho bài viết."
          )
        );
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // POST /posts/{postId}/comments
  const createPostComment = useCallback(
    async (
      postId: string | number,
      payload: CreateCommunityCommentPayload
    ): Promise<CommunityComment | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await CommunityService.createPostComment(
          postId,
          payload
        );
        const apiResponse = response.data as ApiResponse<CommunityComment>;
        const created = apiResponse.data;

        if (created) {
          const key = String(postId);
          setPostComments((prev) => ({
            ...prev,
            [key]: [created, ...(prev[key] || [])],
          }));
        }

        return created ?? null;
      } catch (err) {
        setError(
          getErrorMessage(err, "Không thể tạo bình luận mới cho bài viết.")
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // PUT /comments/{commentId}
  const updateComment = useCallback(
    async (
      commentId: string | number,
      postId: string | number,
      payload: Partial<CreateCommunityCommentPayload>
    ): Promise<CommunityComment | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await CommunityService.updateComment(
          commentId,
          payload
        );
        const apiResponse = response.data as ApiResponse<CommunityComment>;
        const updated = apiResponse.data;

        if (updated) {
          const key = String(postId);
          setPostComments((prev) => ({
            ...prev,
            [key]: (prev[key] || []).map((c) =>
              String(c.id) === String(commentId) ? { ...c, ...updated } : c
            ),
          }));
        }

        return updated ?? null;
      } catch (err) {
        setError(getErrorMessage(err, "Không thể cập nhật bình luận."));
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // DELETE /comments/{commentId}
  const deleteComment = useCallback(
    async (
      commentId: string | number,
      postId: string | number
    ): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        await CommunityService.deleteComment(commentId);

        const key = String(postId);
        setPostComments((prev) => ({
          ...prev,
          [key]: (prev[key] || []).filter(
            (c) => String(c.id) !== String(commentId)
          ),
        }));
      } catch (err) {
        setError(getErrorMessage(err, "Không thể xoá bình luận."));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // GET /comments/{commentId}/replies
  const fetchCommentReplies = useCallback(
    async (commentId: string | number): Promise<CommunityComment[]> => {
      try {
        setLoading(true);
        setError(null);

        const response = await CommunityService.getCommentReplies(commentId);
        const apiResponse = response.data as ApiResponse<CommunityComment[]>;

        return apiResponse.data || [];
      } catch (err) {
        setError(
          getErrorMessage(err, "Không thể tải danh sách replies của bình luận.")
        );
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    postComments,
    fetchPostComments,
    createPostComment,
    updateComment,
    deleteComment,
    fetchCommentReplies,
  };
};

export default usePostComments;


