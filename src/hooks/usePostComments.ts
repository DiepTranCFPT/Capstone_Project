import { useCallback, useState } from "react";
import CommunityService from "~/services/communityService";
import type {
  CommunityComment,
  CreateCommunityCommentPayload,
} from "~/types/community";
import type { ApiResponse } from "~/types/api";

// Type helper cho paginated response
interface PaginatedResponse<T> {
  items: T[];
  pageNo?: number;
  pageSize?: number;
  totalPage?: number;
  totalElement?: number;
  [key: string]: unknown;
}

// Type helper để extract parentId từ comment (BE có thể dùng parentId, parentCommentId, hoặc parenCommentId)
interface CommentWithParentId extends CommunityComment {
  parentId?: string | number | null;
  parentCommentId?: string | number | null;
  parenCommentId?: string | number | null;
}

// Helper function để extract parentId một cách type-safe
const extractParentId = (comment: CommentWithParentId): string | number | null => {
  return comment.parentId ?? comment.parentCommentId ?? comment.parenCommentId ?? null;
};

// Helper function để check xem object có phải paginated response không
const isPaginatedResponse = (data: unknown): data is PaginatedResponse<CommunityComment> => {
  return (
    typeof data === "object" &&
    data !== null &&
    "items" in data &&
    Array.isArray((data as PaginatedResponse<CommunityComment>).items)
  );
};

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
        } else if (isPaginatedResponse(raw)) {
          comments = raw.items;
        }

        // Normalize comments: đảm bảo content luôn là string
        // BE trả về parenCommentId (thiếu chữ "t"), cần check cả 3 trường
        const normalizedComments = comments.map((c) => ({
          ...c,
          parentId: extractParentId(c as CommentWithParentId),
          content:
            typeof c.content === "string"
              ? c.content
              : typeof c.content === "object" && c.content !== null
                ? JSON.stringify(c.content)
                : String(c.content || ""),
        }));

        // Tách parent và replies đã có sẵn
        const parents: CommunityComment[] = [];
        const repliesMap = new Map<string, CommunityComment[]>();
        normalizedComments.forEach((c) => {
          if (c.parentId === null || c.parentId === undefined) {
            parents.push(c);
          } else {
            const key = String(c.parentId);
            if (!repliesMap.has(key)) repliesMap.set(key, []);
            repliesMap.get(key)!.push(c);
          }
        });

        // Fetch thêm replies nếu BE không trả kèm nhưng có replyCount > 0
        const parentsNeedReplies = parents.filter(
          (p) =>
            (p.replyCount && p.replyCount > 0) &&
            !repliesMap.has(String(p.id))
        );

        if (parentsNeedReplies.length > 0) {
          const fetchedReplies = await Promise.all(
            parentsNeedReplies.map(async (p) => {
              try {
                const res = await CommunityService.getCommentReplies(p.id);
                const apiRes = res.data as ApiResponse<unknown>;
                const rawData = apiRes.data;
                
                let data: CommunityComment[] = [];
                if (Array.isArray(rawData)) {
                  data = rawData as CommunityComment[];
                } else if (isPaginatedResponse(rawData)) {
                  data = rawData.items;
                }
                
                const normalized = data.map((c) => ({
                  ...c,
                  parentId: extractParentId(c as CommentWithParentId),
            content:
              typeof c.content === "string"
                ? c.content
                : typeof c.content === "object" && c.content !== null
                  ? JSON.stringify(c.content)
                  : String(c.content || ""),
          }));
                return { parentId: String(p.id), replies: normalized };
              } catch {
                return { parentId: String(p.id), replies: [] as CommunityComment[] };
              }
            })
          );

          fetchedReplies.forEach(({ parentId, replies }) => {
            if (!repliesMap.has(parentId)) repliesMap.set(parentId, []);
            repliesMap.set(parentId, [...(repliesMap.get(parentId) || []), ...replies]);
          });
        }

        // Ghép danh sách: parent -> replies của parent
        const combined: CommunityComment[] = [];
        parents.forEach((p) => {
          combined.push(p);
          const replies = repliesMap.get(String(p.id));
          if (replies && replies.length > 0) {
            combined.push(...replies);
          }
        });
        // Fallback: nếu không có parent nào (API chỉ trả replies), hiển thị toàn bộ normalizedComments
        const finalList = combined.length > 0 ? combined : normalizedComments;

        const key = String(postId);
        setPostComments((prev) => ({
          ...prev,
          [key]: finalList,
        }));

        return finalList;
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Failed to load comments for this post."
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
          // Normalize: đảm bảo content là string
          // BE trả về parenCommentId (thiếu chữ "t"), cần check cả 3 trường
          const normalizedCreated = {
            ...created,
            parentId: extractParentId(created as CommentWithParentId),
            content: typeof created.content === "string" 
              ? created.content 
              : typeof created.content === "object" && created.content !== null
                ? JSON.stringify(created.content)
                : String(created.content || ""),
          };
          
          const key = String(postId);
          setPostComments((prev) => {
            const existing = prev[key] || [];
            
            // Nếu là reply (có parentCommentId), thêm vào sau parent comment
            if (payload.parentCommentId !== undefined && payload.parentCommentId !== null) {
              const parentId = String(payload.parentCommentId);
              const parentIndex = existing.findIndex(
                (c) => String(c.id) === parentId
              );
              
              if (parentIndex >= 0) {
                // Tìm vị trí cuối cùng của replies của parent này
                let insertIndex = parentIndex + 1;
                while (
                  insertIndex < existing.length &&
                  String(existing[insertIndex].parentId) === parentId
                ) {
                  insertIndex++;
                }
                
                const newList = [...existing];
                newList.splice(insertIndex, 0, normalizedCreated);
                return {
                  ...prev,
                  [key]: newList,
                };
              }
            }
            
            // Nếu là comment gốc, thêm vào đầu
            return {
              ...prev,
              [key]: [normalizedCreated, ...existing],
            };
          });
        }

        return created ?? null;
      } catch (err) {
        setError(
          getErrorMessage(err, "Failed to create a new comment for this post.")
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
          const newContent = payload.content || "";
          
          setPostComments((prev) => ({
            ...prev,
            [key]: (prev[key] || []).map((c) => {
              if (String(c.id) === String(commentId)) {
                return {
                  ...c,
                  ...updated,
                  content: newContent,
                };
              }
              return c;
            }),
          }));
          
          return {
            ...updated,
            content: newContent,
          } as CommunityComment;
        }

        return null;
      } catch (err) {
        setError(getErrorMessage(err, "Failed to update comment."));
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // POST /comments/{commentId}/vote
  const voteComment = useCallback(
    async (
      commentId: string | number,
      postId: string | number,
      value: number
    ): Promise<CommunityComment | null> => {
      try {
        setError(null);

        const response = await CommunityService.voteComment(commentId, value);
        const apiResponse = response.data as ApiResponse<CommunityComment>;
        const updatedComment = apiResponse.data;

        const key = String(postId);

        setPostComments((prev) => {
          const existing = prev[key] || [];

          const nextList = existing.map((c) => {
            if (String(c.id) !== String(commentId)) return c;

            if (updatedComment) {
              return { ...c, ...updatedComment };
            }

            const anyC = c as unknown as {
              voteCount?: number;
              likeCount?: number;
              userVoteValue?: number;
            };

            const currentVote =
              typeof anyC.voteCount === "number"
                ? anyC.voteCount
                : typeof anyC.likeCount === "number"
                  ? anyC.likeCount
                  : 0;

            const prevUserVoteValue =
              typeof anyC.userVoteValue === "number"
                ? anyC.userVoteValue
                : 0;
            const newUserVoteValue = value;

            const newVote =
              currentVote - prevUserVoteValue + newUserVoteValue;

            return {
              ...c,
              likeCount: newVote,
              voteCount: newVote,
              userVoteValue: newUserVoteValue,
            } as CommunityComment;
          });

          return {
            ...prev,
            [key]: nextList,
          };
        });

        return updatedComment ?? null;
      } catch (err) {
        setError(getErrorMessage(err, "Failed to vote comment."));
        return null;
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

        console.log("Calling API to delete comment:", commentId);
        await CommunityService.deleteComment(commentId);
        console.log("API delete successful, updating UI");

        const key = String(postId);
        const commentIdStr = String(commentId);
        
        setPostComments((prev) => {
          const existing = prev[key] || [];
          console.log("Before delete - comments count:", existing.length);
          console.log("Deleting comment ID:", commentIdStr);
          
          // Tìm comment bị xóa để xác định xem nó có phải là reply không
          const deletedComment = existing.find((c) => String(c.id) === commentIdStr);
          const isReply = deletedComment && extractParentId(deletedComment as CommentWithParentId) !== null;
          const parentIdOfDeleted = isReply ? extractParentId(deletedComment as CommentWithParentId) : null;
          
          // Xóa comment và tất cả replies của nó
          const filtered = existing.filter((c) => {
            const cId = String(c.id);
            const cParentId = extractParentId(c as CommentWithParentId);
            const parentIdStr = cParentId !== null && cParentId !== undefined ? String(cParentId) : null;
            
            // Xóa comment chính (id khớp)
            if (cId === commentIdStr) {
              console.log("Removing comment with ID:", cId);
              return false;
            }
            
            // Xóa tất cả replies có parentId = commentId
            if (parentIdStr === commentIdStr) {
              console.log("Removing reply with parentId:", parentIdStr, "comment ID:", cId);
              return false;
            }
            
            return true;
          });
          
          // Nếu xóa reply, cập nhật replyCount của parent comment
          if (isReply && parentIdOfDeleted !== null) {
            const parentIdStr = String(parentIdOfDeleted);
            const updated = filtered.map((c) => {
              if (String(c.id) === parentIdStr) {
                // Đếm lại số replies thực tế
                const actualReplies = filtered.filter((r) => {
                  const rParentId = extractParentId(r as CommentWithParentId);
                  return rParentId !== null && String(rParentId) === parentIdStr;
                });
                return {
                  ...c,
                  replyCount: actualReplies.length,
                };
              }
              return c;
            });
            
            console.log("After delete - comments count:", updated.length);
            console.log("Updated parent comment replyCount");
            
            return {
              ...prev,
              [key]: updated,
            };
          }
          
          console.log("After delete - comments count:", filtered.length);
          
          return {
            ...prev,
            [key]: filtered,
          };
        });
      } catch (err) {
        const errorMsg = getErrorMessage(err, "Failed to delete comment.");
        console.error("Delete comment error:", errorMsg, err);
        setError(errorMsg);
        // Throw error để component có thể catch và hiển thị message
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // GET /comments/{commentId}/replies
  const fetchCommentReplies = useCallback(
    async (
      commentId: string | number
    ): Promise<CommunityComment[]> => {
      try {
        setLoading(true);
        setError(null);

        const response = await CommunityService.getCommentReplies(commentId);
        const apiResponse = response.data as ApiResponse<unknown>;
        const raw = apiResponse.data;

        // Parse response: có thể là array trực tiếp hoặc paginated với items
        let replies: CommunityComment[] = [];
        if (Array.isArray(raw)) {
          replies = raw as CommunityComment[];
        } else if (isPaginatedResponse(raw)) {
          replies = raw.items;
        }

        const normalized = replies.map((c) => ({
          ...c,
          parentId: extractParentId(c as CommentWithParentId),
          content:
            typeof c.content === "string"
              ? c.content
              : typeof c.content === "object" && c.content !== null
                ? JSON.stringify(c.content)
                : String(c.content || ""),
        }));

        return normalized;
      } catch (err) {
        setError(
          getErrorMessage(err, "Failed to load comment replies.")
        );
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Tải replies cho 1 comment và merge vào postComments theo đúng vị trí
   */
  const loadRepliesForComment = useCallback(
    async (
      commentId: string | number,
      postId: string | number
    ): Promise<CommunityComment[]> => {
      const replies = await fetchCommentReplies(commentId);

      if (replies.length === 0) {
        return replies;
      }

      const parentIdStr = String(commentId);
      const key = String(postId);

      setPostComments((prev) => {
        const existing = prev[key] || [];
        const parentIndex = existing.findIndex(
          (c) => String(c.id) === parentIdStr
        );

        // Nếu không tìm thấy parent, thêm replies vào cuối để tránh mất dữ liệu
        if (parentIndex === -1) {
          // Tránh duplicate
          const filtered = replies.filter(
            (r) => !existing.some((c) => String(c.id) === String(r.id))
          );
          return {
            ...prev,
            [key]: [...existing, ...filtered],
          };
        }

        const newList = [...existing];
        let insertIndex = parentIndex + 1;
        // bỏ qua các replies đã có của parent này
        while (
          insertIndex < newList.length &&
          String(extractParentId(newList[insertIndex] as CommentWithParentId)) === parentIdStr
        ) {
          insertIndex++;
        }

        replies.forEach((r) => {
          const exists = newList.some((c) => String(c.id) === String(r.id));
          if (!exists) {
            // Đảm bảo parentId của reply khớp với id của parent comment
            const replyWithCorrectParentId = {
              ...r,
              parentId: parentIdStr, // Force set parentId để đảm bảo khớp
            };
            newList.splice(insertIndex, 0, replyWithCorrectParentId);
            insertIndex++;
          }
        });

        return {
          ...prev,
          [key]: newList,
        };
      });

      return replies;
    },
    [fetchCommentReplies]
  );

  return {
    loading,
    error,
    postComments,
    fetchPostComments,
    createPostComment,
    updateComment,
    deleteComment,
    voteComment,
    fetchCommentReplies,
    loadRepliesForComment,
  };
};

export default usePostComments;


