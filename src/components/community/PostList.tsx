import React, { useState, useEffect, useMemo } from "react";
import { Input, Button, Dropdown, message, Modal } from "antd";
import type { MenuProps } from "antd";
import { FiMessageSquare, FiMoreVertical, FiImage } from "react-icons/fi";
import { IoCaretUpSharp, IoCaretDownSharp } from "react-icons/io5";
import { PushpinOutlined } from "@ant-design/icons";
import type { Thread, CommunityComment } from "~/types/community";
import usePostComments from "~/hooks/usePostComments";
import { useAuth } from "~/hooks/useAuth";
import { getHighestPriorityRole } from "~/utils/roleUtils";

// Avatar mặc định thống nhất cho tất cả user chưa có ảnh
const DEFAULT_AVATAR = "https://i.pravatar.cc/150?u=default-user";

interface PostListProps {
  loading: boolean;
  threads: Thread[];
  onDeletePost?: (postId: string | number) => Promise<void>;
  onVotePost?: (postId: string | number, value: number) => Promise<void>;
  onPinPost?: (postId: string | number) => Promise<void>;
}

const PostList: React.FC<PostListProps> = ({ loading, threads, onDeletePost, onVotePost, onPinPost }) => {
  const { user } = useAuth();
  
  // Kiểm tra xem user có phải admin không
  const isAdmin = useMemo(() => {
    if (!user) return false;
    const userWithRole = user as { role?: string | string[]; roles?: string | string[] };
    const roles = userWithRole?.role ?? userWithRole?.roles;
    if (!roles) return false;
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.some((r) => r.toUpperCase() === "ADMIN");
  }, [user]);
  const {
    loading: commentLoading,
    postComments,
    fetchPostComments,
    createPostComment,
    updateComment,
    deleteComment,
    loadRepliesForComment,
  } = usePostComments();

  const [openPostIds, setOpenPostIds] = useState<Set<string | number>>(new Set());
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [commentImages, setCommentImages] = useState<Record<string, File | null>>({});
  const [editingCommentId, setEditingCommentId] = useState<string | number | null>(null);
  const [editCommentText, setEditCommentText] = useState<string>("");
  const [replyingCommentId, setReplyingCommentId] = useState<string | number | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [expandedReplyIds, setExpandedReplyIds] = useState<Set<string>>(new Set());
  const [postToDelete, setPostToDelete] = useState<Thread | null>(null);
  const [deletingPost, setDeletingPost] = useState(false);
  const [userVoteByPostId, setUserVoteByPostId] = useState<Record<string, number>>({});
  const [commentToDelete, setCommentToDelete] = useState<{ comment: CommunityComment; postId: string | number } | null>(null);
  const [deletingComment, setDeletingComment] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date()); // Để force re-render mỗi phút

  type CommentWithPossibleParentIds = CommunityComment & {
    parentCommentId?: string | number | null;
    parenCommentId?: string | number | null;
  };

  const getNormalizedParentId = (comment: CommunityComment): string | number | null | undefined => {
    const extended = comment as CommentWithPossibleParentIds;
    return comment.parentId ?? extended.parentCommentId ?? extended.parenCommentId;
  };

  const formatCompactNumber = (num: number): string => {
    try {
      return new Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(num);
    } catch {
      return String(num);
    }
  };

  // Format thời gian relative (ví dụ: "10 minutes ago", "2 hours ago")
  const formatTimeAgo = (dateString?: string | null): string => {
    if (!dateString) return "Just now";
    
    try {
      const date = new Date(dateString);
      const now = currentTime; // Dùng currentTime để force re-render mỗi phút
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        return "Just now";
      }
      
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
      }
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
      }
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
      }
      
      const diffInWeeks = Math.floor(diffInDays / 7);
      if (diffInWeeks < 4) {
        return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`;
      }
      
      const diffInMonths = Math.floor(diffInDays / 30);
      if (diffInMonths < 12) {
        return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
      }
      
      const diffInYears = Math.floor(diffInDays / 365);
      return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Just now";
    }
  };

  // Helper function để render role badge
  const renderRoleBadge = (role?: string | string[]): React.ReactNode => {
    if (!role) return null;
    
    // Lấy role có độ ưu tiên cao nhất
    const highestRole = getHighestPriorityRole(role);
    
    if (!highestRole) return null;

    const ROLE_BADGES: Record<
      string,
      { label: string; dotColor: string; pillClass: string }
    > = {
      ADMIN: {
        label: "Admin",
        dotColor: "bg-red-500",
        pillClass: "border-red-500/50 text-red-300 bg-red-500/10",
      },
      TEACHER: {
        label: "Teacher",
        dotColor: "bg-blue-500",
        pillClass: "border-blue-500/50 text-blue-300 bg-blue-500/10",
      },
      PARENT: {
        label: "Parent",
        dotColor: "bg-emerald-400",
        pillClass: "border-emerald-400/50 text-emerald-200 bg-emerald-500/10",
      },
      STUDENT: {
        label: "Student",
        dotColor: "bg-purple-400",
        pillClass: "border-purple-400/50 text-purple-200 bg-purple-500/10",
      },
    };

    const cfg =
      ROLE_BADGES[highestRole] ?? ({
        label: highestRole,
        dotColor: "bg-gray-400",
        pillClass: "border-gray-500/40 text-gray-200 bg-gray-500/10",
      } satisfies (typeof ROLE_BADGES)[string]);

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.pillClass} ml-2`}
      >
        <span className={`w-1.5 h-1.5 rounded-full mr-1 ${cfg.dotColor}`} />
        {cfg.label}
      </span>
    );
  };

  // Khởi tạo vote của user theo dữ liệu từ BE (userVoteValue)
  useEffect(() => {
    const next: Record<string, number> = {};
    threads.forEach((t) => {
      const pid = t.postId || t.id;
      next[String(pid)] = typeof t.userVoteValue === "number" ? t.userVoteValue : 0;
    });
    setUserVoteByPostId(next);
  }, [threads]);

  // Cập nhật thời gian mỗi phút để hiển thị real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Cập nhật mỗi 60 giây (1 phút)

    return () => clearInterval(interval);
  }, []);

  const handleToggleComments = async (thread: Thread) => {
    const postId = thread.postId || thread.id;
    const key = String(postId);
    
    const newOpenPostIds = new Set(openPostIds);
    if (newOpenPostIds.has(postId)) {
      newOpenPostIds.delete(postId);
    } else {
      newOpenPostIds.add(postId);
      if (!postComments[key]) {
        await fetchPostComments(postId);
      }
    }
    setOpenPostIds(newOpenPostIds);
  };

  const handleSubmitComment = async (thread: Thread) => {
    const postId = thread.postId || thread.id;
    const key = String(postId);

    const content = (commentTexts[key] || "").trim();
    if (!content) return;

    const image = commentImages[key] || undefined;

    await createPostComment(postId, { content, image });

    setCommentTexts((prev) => ({ ...prev, [key]: "" }));
    setCommentImages((prev) => ({ ...prev, [key]: null }));
  };

  const handleReplyComment = async (comment: CommunityComment, postId: string | number) => {
    const replyKey = `${postId}-${comment.id}`;
    const content = (replyTexts[replyKey] || "").trim();
    if (!content) return;

    await createPostComment(postId, { 
      content,
      parentCommentId: comment.id 
    });
    setReplyTexts((prev) => ({ ...prev, [replyKey]: "" }));
    setReplyingCommentId(null);

    // Mở replies của parent sau khi thêm
    setExpandedReplyIds((prev) => {
      const next = new Set(prev);
      next.add(String(comment.id));
      return next;
    });
  };

  const handleEditComment = (comment: CommunityComment) => {
    setEditingCommentId(comment.id);
    const contentValue = typeof comment.content === "string" 
      ? comment.content 
      : String(comment.content || "");
    setEditCommentText(contentValue);
  };

  const handleSaveEdit = async (comment: CommunityComment, postId: string | number) => {
    const content = editCommentText.trim();
    if (!content) {
      message.warning("Comment content cannot be empty.");
      return;
    }

    try {
      const result = await updateComment(comment.id, postId, { content });
      
      if (result) {
        message.success("Comment updated successfully.");
        setEditingCommentId(null);
        setEditCommentText("");
      } else {
        message.error("Failed to update comment. Please try again.");
      }
    } catch {
      message.error("An error occurred while updating the comment.");
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentText("");
  };

  const handleDeleteComment = (comment: CommunityComment, postId: string | number) => {
    console.log("handleDeleteComment called", { commentId: comment.id, postId });
    setCommentToDelete({ comment, postId });
  };

  const handleConfirmDeleteComment = async () => {
    if (!commentToDelete) return;
    const { comment, postId } = commentToDelete;
    try {
      setDeletingComment(true);
      console.log("Deleting comment:", comment.id, "from post:", postId);
      await deleteComment(comment.id, postId);
      message.success("Comment deleted successfully.");
      setCommentToDelete(null);
      
      // Đóng expanded replies nếu comment bị xóa là parent
      setExpandedReplyIds((prev) => {
        const next = new Set(prev);
        next.delete(String(comment.id));
        return next;
      });
    } catch (error) {
      console.error("Failed to delete comment:", error);
      message.error("Failed to delete comment. Please try again.");
    } finally {
      setDeletingComment(false);
    }
  };

  const handleDeletePostClick = (thread: Thread) => {
    if (!onDeletePost) return;
    setPostToDelete(thread);
  };

  const handleConfirmDeletePost = async () => {
    if (!postToDelete || !onDeletePost) return;
    try {
      setDeletingPost(true);
      await onDeletePost(postToDelete.postId || postToDelete.id);
      message.success("Post deleted successfully.");
      setPostToDelete(null);
    } catch {
      message.error("Failed to delete post. Please try again.");
    } finally {
      setDeletingPost(false);
    }
  };

  const renderComment = (c: CommunityComment, postId: string | number) => {
    const author = c.author;
    const authorFullName = author
      ? `${author.firstName ?? ""} ${author.lastName ?? ""}`.trim()
      : "";
    const displayName =
      c.authorName ||
      authorFullName ||
      author?.username ||
      "User";

    const avatarUrl =
      c.authorAvatar || author?.imgUrl || author?.avatar || null;

    // Ảnh đính kèm trong comment (BE có thể đặt tên khác nhau)
    const anyComment = c as unknown as {
      imgUrl?: string;
      image?: string;
      imageUrl?: string;
      commentImageUrl?: string;
    };
    const rawCommentImage =
      anyComment.imgUrl ||
      anyComment.image ||
      anyComment.imageUrl ||
      anyComment.commentImageUrl ||
      null;

    const apiBase = import.meta.env.VITE_API_URL || "";
    let resolvedAvatar = DEFAULT_AVATAR;
    if (avatarUrl) {
      resolvedAvatar = avatarUrl.startsWith("http")
        ? avatarUrl
        : `${apiBase}${avatarUrl}`;
    }

    let resolvedCommentImage: string | null = null;
    if (rawCommentImage) {
      resolvedCommentImage = rawCommentImage.startsWith("http")
        ? rawCommentImage
        : `${apiBase}${rawCommentImage}`;
    }

    const isOwnComment =
      user &&
      (String(c.authorId) === String(user.id) ||
        String(author?.id) === String(user.id));

    const handleMenuClick = (key: string) => {
      console.log("Menu clicked:", key);
      if (key === "edit") {
        handleEditComment(c);
      } else if (key === "delete") {
        handleDeleteComment(c, postId);
      }
    };

    const menuItems: MenuProps["items"] = isOwnComment
      ? [
          {
            key: "edit",
            label: "Edit",
          },
          {
            key: "delete",
            label: "Delete",
            danger: true,
          },
        ]
      : [];

    const isEditing = editingCommentId === c.id;
    const isReplying = replyingCommentId === c.id;
    const replyKey = `${postId}-${c.id}`;
    const currentReplyText = replyTexts[replyKey] || "";

    return (
      <div key={c.id} className="py-2">
        <div className="flex items-start gap-2 text-sm text-gray-700">
          <img
            src={resolvedAvatar || DEFAULT_AVATAR}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
            }}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <span className="font-semibold mr-1">{displayName}:</span>
                {renderRoleBadge(
                  (c.author as { role?: string | string[] } | undefined)?.role
                )}
                {isEditing ? (
                  <div className="mt-1 space-y-2">
                    <Input
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                      onPressEnter={() => handleSaveEdit(c, postId)}
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="small"
                        type="primary"
                        className="bg-teal-500 hover:bg-teal-600"
                        onClick={() => void handleSaveEdit(c, postId)}
                        loading={commentLoading && editingCommentId === c.id}
                      >
                        Save
                      </Button>
                      <Button size="small" onClick={handleCancelEdit} disabled={commentLoading}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <span>
                    {(() => {
                      if (typeof c.content === "string") {
                        let contentStr = c.content;
                        if (
                          contentStr.startsWith('"') &&
                          contentStr.endsWith('"')
                        ) {
                          contentStr = contentStr.slice(1, -1);
                        }
                        return contentStr;
                      }
                      return String(c.content || "");
                    })()}
                  </span>
                )}
              </div>
              {isOwnComment && !isEditing && (
                <Dropdown 
                  menu={{ items: menuItems, onClick: ({ key }) => handleMenuClick(key) }} 
                  trigger={["click"]}
                >
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                  >
                    <FiMoreVertical size={16} />
                  </button>
                </Dropdown>
              )}
            </div>

            {/* Hiển thị ảnh comment (nếu có) */}
            {resolvedCommentImage && (
              <div className="mt-2 ml-0">
                <img
                  src={resolvedCommentImage}
                  alt="comment attachment"
                  className="max-h-56 rounded-xl border border-gray-100 object-cover"
                />
              </div>
            )}
            
            {/* Reply button và input */}
            <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
              <button
                type="button"
                onClick={() => {
                  if (isReplying) {
                    setReplyingCommentId(null);
                    setReplyTexts((prev) => ({ ...prev, [replyKey]: "" }));
                  } else {
                    setReplyingCommentId(c.id);
                  }
                }}
                className="hover:text-teal-600 transition-colors"
              >
                {isReplying ? "Cancel" : "Reply"}
              </button>
            </div>

            {/* Reply input box */}
            {isReplying && (
              <div className="mt-2 flex items-center gap-2">
                <Input
                  size="small"
                  placeholder={`Reply to ${displayName}...`}
                  value={currentReplyText}
                  onChange={(e) =>
                    setReplyTexts((prev) => ({
                      ...prev,
                      [replyKey]: e.target.value,
                    }))
                  }
                  onPressEnter={(e) => {
                    e.preventDefault();
                    void handleReplyComment(c, postId);
                  }}
                  autoFocus
                />
                <Button
                  size="small"
                  type="primary"
                  className="bg-teal-500 hover:bg-teal-600"
                  onClick={() => void handleReplyComment(c, postId)}
                >
                  Send
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPostCard = (thread: Thread) => {
    const postId = thread.postId || thread.id;
    const isOpen = openPostIds.has(postId);
    const commentsForPost = postComments[String(postId)] || [];
    const commentList = Array.isArray(commentsForPost) ? commentsForPost : [];
    const postKey = String(postId);
    const currentCommentText = commentTexts[postKey] || "";
    const currentCommentImage = commentImages[postKey] || null;
    const currentUserVoteValue =
      typeof userVoteByPostId[String(postId)] === "number"
        ? userVoteByPostId[String(postId)]
        : typeof thread.userVoteValue === "number"
          ? thread.userVoteValue
          : 0;

    // Phân loại comments: parent comments (không có parentId) và replies (có parentId)
    // Sau khi normalize trong usePostComments, parentId đã được set từ parenCommentId rồi
    let parentComments = commentList.filter((c) => {
      const parentId = getNormalizedParentId(c);
      return parentId === null || parentId === undefined;
    });
    const repliesMap = new Map<string, CommunityComment[]>();
    commentList.forEach((c) => {
      // Normalize parentId: check cả parenCommentId từ BE
      const parentId = getNormalizedParentId(c);
      if (parentId !== null && parentId !== undefined) {
        const parentKey = String(parentId).trim();
        if (!repliesMap.has(parentKey)) {
          repliesMap.set(parentKey, []);
        }
        repliesMap.get(parentKey)!.push(c);
      }
    });

    // Trường hợp BE chỉ trả replies (không có parent trong trang hiện tại),
    // hiển thị tối thiểu danh sách comment thay vì rỗng.
    if (parentComments.length === 0 && commentList.length > 0) {
      parentComments = commentList;
    }

    const isOwnPost =
      !!user &&
      !!thread.authorId &&
      String(thread.authorId) === String(user.id);
    
    const isPinned = thread.pinned ?? false;
    
    const postMenuItems: MenuProps["items"] = [];
    
    // Thêm nút pin/unpin cho admin
    if (isAdmin && onPinPost) {
      postMenuItems.push({
        key: "pin",
        label: isPinned ? "Unpin post" : "Pin post",
        icon: <PushpinOutlined />,
        onClick: async () => {
          if (onPinPost) {
            try {
              await onPinPost(postId);
              message.success(isPinned ? "Post unpinned successfully" : "Post pinned successfully");
            } catch {
              message.error("Failed to pin/unpin post");
            }
          }
        },
      });
    }
    
    // Thêm nút delete cho chủ post
    if (isOwnPost) {
      postMenuItems.push({
        key: "delete",
        label: "Delete",
        danger: true,
        onClick: () => handleDeletePostClick(thread),
      });
    }

    return (
      <div
        key={thread.postId || thread.id}
        className={`bg-white rounded-2xl border shadow-sm p-4 transition-all ${
          isPinned 
            ? "border-teal-400 border-2 bg-gradient-to-br from-teal-50/50 to-teal-100/30 shadow-md" 
            : "border-gray-100"
        }`}
      >
        {isPinned && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-teal-200/50">
            <PushpinOutlined className="text-teal-600 text-base" />
            <span className="text-xs font-semibold text-teal-700">Pinned Post</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <img
              src={thread.user.avatar || DEFAULT_AVATAR}
              alt={thread.user.name}
              className="w-10 h-10 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-800">{thread.user.name}</p>
                {renderRoleBadge(thread.userRole)}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <span>{formatTimeAgo(thread.createdAt)}</span>
                {thread.groupName && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="text-teal-600 text-xs">
                      {thread.groupName}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          {(isAdmin || isOwnPost) && postMenuItems.length > 0 && (
            <Dropdown menu={{ items: postMenuItems }} trigger={["click"]}>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
              >
                <FiMoreVertical size={16} />
              </button>
            </Dropdown>
          )}
        </div>
        <p className="mt-3 text-gray-700 leading-relaxed">{thread.content}</p>
        {thread.image && (
          <div className="mt-3">
            <img
              src={thread.image}
              alt="post"
              className="w-full rounded-xl border border-gray-100"
            />
          </div>
        )}
        <div className="mt-4 flex items-center gap-4 text-gray-500 text-sm">
          {/* Vote control (up/down) */}
          <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <button
              type="button"
              className={`w-9 h-9 flex items-center justify-center transition-all ${
                currentUserVoteValue === 1
                  ? "bg-teal-50 text-teal-600"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
              onClick={() => {
                if (!onVotePost) return;
                const pid = thread.postId || thread.id;
                const current = currentUserVoteValue;
                const nextValue = current === 1 ? 0 : 1;
                void onVotePost(pid, nextValue);
                setUserVoteByPostId((prev) => ({ ...prev, [String(pid)]: nextValue }));
              }}
              aria-label="Upvote"
              title="Upvote"
            >
              <IoCaretUpSharp size={18} />
            </button>
            <div className="px-2 py-1 text-xs font-semibold text-gray-700 min-w-10 text-center select-none">
              {formatCompactNumber(Number(thread.likes ?? 0))}
            </div>
            <button
              type="button"
              className={`w-9 h-9 flex items-center justify-center transition-all ${
                currentUserVoteValue === -1
                  ? "bg-rose-50 text-rose-600"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
              onClick={() => {
                if (!onVotePost) return;
                const pid = thread.postId || thread.id;
                const current = currentUserVoteValue;
                const nextValue = current === -1 ? 0 : -1;
                void onVotePost(pid, nextValue);
                setUserVoteByPostId((prev) => ({ ...prev, [String(pid)]: nextValue }));
              }}
              aria-label="Downvote"
              title="Downvote"
            >
              <IoCaretDownSharp size={18} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => void handleToggleComments(thread)}
            className="flex items-center gap-1 hover:text-teal-600 transition-colors"
          >
            <FiMessageSquare /> {thread.comments}
          </button>
        </div>

        {/* Comments section - expand/collapse inline */}
        {isOpen && (
          <div className="mt-4 border-t border-gray-100 pt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
            {commentLoading && (
              <div className="text-xs text-gray-400 text-center py-2">Loading comments...</div>
            )}
            {!commentLoading && parentComments.length === 0 && (
              <div className="text-xs text-gray-400 text-center py-2">No comments yet.</div>
            )}
            {!commentLoading && parentComments.length === 0 && commentList.length > 0 && (
              <div className="space-y-1">
                {commentList.map((c) => (
                  <div key={c.id}>{renderComment(c, postId)}</div>
                ))}
              </div>
            )}

            {!commentLoading &&
              parentComments.length > 0 &&
              parentComments.map((c) => {
                // So sánh parentId của replies với id của parent comment
                const parentIdKey = String(c.id).trim();
                let replies = repliesMap.get(parentIdKey) || [];
                
                // Nếu không tìm thấy trong map, thử tìm trong toàn bộ commentList
                // So sánh cả 3 trường: parentId, parentCommentId, parenCommentId
                if (replies.length === 0) {
                  replies = commentList.filter((cmt) => {
                    const cmtParentId = getNormalizedParentId(cmt);
                    if (cmtParentId === null || cmtParentId === undefined) return false;
                    // So sánh cả string và number để đảm bảo khớp
                    return String(cmtParentId).trim() === parentIdKey || 
                           String(cmtParentId).trim() === String(c.id).trim();
                  });
                }
                
                // Ưu tiên dùng replies.length thực tế từ state, fallback về replyCount từ BE
                const actualReplyCount = replies.length;
                const replyCount = actualReplyCount > 0 ? actualReplyCount : (c.replyCount || 0);
                const isRepliesExpanded = expandedReplyIds.has(String(c.id));
                // Chỉ hiển thị nút replies nếu thực sự còn replies
                const hasReplies = actualReplyCount > 0;

                return (
                  <div key={c.id} className="space-y-1">
                    {renderComment(c, postId)}

                    {/* Nút sổ replies giống Facebook */}
                    {hasReplies && (
                      <button
                        type="button"
                        className="ml-10 text-xs text-teal-600 hover:text-teal-700 font-medium"
                        onClick={async () => {
                          // Luôn cố gắng load replies nếu đang đóng và chưa có dữ liệu
                          if (!isRepliesExpanded && replies.length === 0) {
                            await loadRepliesForComment(c.id, postId);
                          }
                          setExpandedReplyIds((prev) => {
                            const next = new Set(prev);
                            const key = String(c.id);
                            if (next.has(key)) {
                              next.delete(key);
                            } else {
                              next.add(key);
                            }
                            return next;
                          });
                        }}
                      >
                        {isRepliesExpanded ? "Hide replies" : `${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
                      </button>
                    )}

                    {/* Hiển thị replies dưới parent comment */}
                    {isRepliesExpanded && replies.length > 0 && (
                      <div className="ml-10 mt-1 space-y-1 border-l-2 border-gray-200 pl-3">
                        {replies.map((reply) => renderComment(reply, postId))}
                      </div>
                    )}
                  </div>
                );
              })}

            {/* Comment input + image upload */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2">
                {/* Hidden file input, trigger bằng nút icon */}
                <input
                  id={`comment-image-${postKey}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setCommentImages((prev) => ({
                      ...prev,
                      [postKey]: file,
                    }));
                  }}
                />

                <Button
                  type="default"
                  className="flex items-center justify-center !p-0 w-9 h-9"
                  onClick={() => {
                    const input = document.getElementById(
                      `comment-image-${postKey}`
                    ) as HTMLInputElement | null;
                    input?.click();
                  }}
                >
                  <FiImage className="text-teal-500" size={18} />
                </Button>

                <Input
                  placeholder="Write a comment..."
                  value={currentCommentText}
                  onChange={(e) =>
                    setCommentTexts((prev) => ({
                      ...prev,
                      [postKey]: e.target.value,
                    }))
                  }
                  onPressEnter={(e) => {
                    e.preventDefault();
                    void handleSubmitComment(thread);
                  }}
                />
                <Button
                  type="primary"
                  className="bg-teal-500 hover:bg-teal-600"
                  onClick={() => void handleSubmitComment(thread)}
                >
                  Send
                </Button>
              </div>
              {currentCommentImage && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="text-teal-600">
                    {currentCommentImage.name}
                  </span>
                  <button
                    type="button"
                    className="text-red-500 hover:underline"
                    onClick={() =>
                      setCommentImages((prev) => ({ ...prev, [postKey]: null }))
                    }
                  >
                    Xoá ảnh
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Sắp xếp threads: pinned posts lên đầu
  const sortedThreads = useMemo(() => {
    const pinned = threads.filter((t) => t.pinned);
    const unpinned = threads.filter((t) => !t.pinned);
    return [...pinned, ...unpinned];
  }, [threads]);

  return (
    <>
      <div className="space-y-4">
        {loading && (
          <div className="text-center py-6 text-gray-500">Loading posts...</div>
        )}
        {!loading && sortedThreads.map(renderPostCard)}
        {!loading && threads.length === 0 && (
          <div className="text-center py-10 text-gray-500">No posts yet.</div>
        )}
      </div>

      {/* Delete post confirmation modal */}
      <Modal
        open={!!postToDelete}
        title="Delete post"
        centered
        onCancel={() => setPostToDelete(null)}
        footer={[
          <Button key="cancel" onClick={() => setPostToDelete(null)}>
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            loading={deletingPost}
            onClick={() => void handleConfirmDeletePost()}
          >
            Delete
          </Button>,
        ]}
      >
        <p className="text-sm text-gray-700">
          Are you sure you want to delete this post? This action cannot be undone.
        </p>
      </Modal>

      {/* Delete comment confirmation modal */}
      <Modal
        open={!!commentToDelete}
        title="Delete comment"
        centered
        onCancel={() => setCommentToDelete(null)}
        footer={[
          <Button key="cancel" onClick={() => setCommentToDelete(null)}>
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            loading={deletingComment}
            onClick={() => void handleConfirmDeleteComment()}
          >
            Delete
          </Button>,
        ]}
      >
        <p className="text-sm text-gray-700">
          Are you sure you want to delete this comment? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default PostList;


