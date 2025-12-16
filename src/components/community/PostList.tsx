import React, { useState } from "react";
import { Input, Button, Dropdown, message } from "antd";
import type { MenuProps } from "antd";
import { FiMessageSquare, FiMoreVertical } from "react-icons/fi";
import type { Thread, CommunityComment } from "~/types/community";
import usePostComments from "~/hooks/usePostComments";
import { useAuth } from "~/hooks/useAuth";

interface PostListProps {
  loading: boolean;
  threads: Thread[];
}

const PostList: React.FC<PostListProps> = ({ loading, threads }) => {
  const { user } = useAuth();
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
  const [editingCommentId, setEditingCommentId] = useState<string | number | null>(null);
  const [editCommentText, setEditCommentText] = useState<string>("");
  const [replyingCommentId, setReplyingCommentId] = useState<string | number | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [expandedReplyIds, setExpandedReplyIds] = useState<Set<string>>(new Set());

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
    const content = (commentTexts[String(thread.postId || thread.id)] || "").trim();
    if (!content) return;

    const postId = thread.postId || thread.id;
    await createPostComment(postId, { content });
    setCommentTexts((prev) => ({ ...prev, [String(postId)]: "" }));
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

  const handleDeleteComment = async (comment: CommunityComment, postId: string | number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    await deleteComment(comment.id, postId);
    message.success("Comment deleted successfully.");
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
      c.authorAvatar ||
      author?.imgUrl ||
      author?.avatar ||
      "https://i.pravatar.cc/150";

    const apiBase = import.meta.env.VITE_API_URL || "";
    const resolvedAvatar =
      avatarUrl.startsWith("http") ? avatarUrl : `${apiBase}${avatarUrl}`;

    const isOwnComment =
      user &&
      (String(c.authorId) === String(user.id) ||
        String(author?.id) === String(user.id));

    const menuItems: MenuProps["items"] = isOwnComment
      ? [
          {
            key: "edit",
            label: "Edit",
            onClick: () => handleEditComment(c),
          },
          {
            key: "delete",
            label: "Delete",
            danger: true,
            onClick: () => handleDeleteComment(c, postId),
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
            src={resolvedAvatar}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <span className="font-semibold mr-1">{displayName}:</span>
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
                        if (contentStr.startsWith('"') && contentStr.endsWith('"')) {
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
                <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                  >
                    <FiMoreVertical size={16} />
                  </button>
                </Dropdown>
              )}
            </div>
            
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
    const currentCommentText = commentTexts[String(postId)] || "";

    // Phân loại comments: parent comments (không có parentId) và replies (có parentId)
    // Sau khi normalize trong usePostComments, parentId đã được set từ parenCommentId rồi
    let parentComments = commentList.filter(
      (c) => {
        const parentId = c.parentId ?? (c as any).parentCommentId ?? (c as any).parenCommentId;
        return !parentId || parentId === null || parentId === undefined;
      }
    );
    const repliesMap = new Map<string, CommunityComment[]>();
    commentList.forEach((c) => {
      // Normalize parentId: check cả parenCommentId từ BE
      const parentId = c.parentId ?? (c as any).parentCommentId ?? (c as any).parenCommentId;
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

    return (
      <div
        key={thread.id}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
      >
        <div className="flex items-center gap-3">
          <img
            src={thread.user.avatar}
            alt={thread.user.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold text-gray-800">{thread.user.name}</p>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span>10 minutes ago</span>
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
                    const cmtParentId = cmt.parentId ?? (cmt as any).parentCommentId ?? (cmt as any).parenCommentId;
                    if (cmtParentId === null || cmtParentId === undefined) return false;
                    // So sánh cả string và number để đảm bảo khớp
                    return String(cmtParentId).trim() === parentIdKey || 
                           String(cmtParentId).trim() === String(c.id).trim();
                  });
                }
                
                const replyCount = c.replyCount || replies.length;
                const isRepliesExpanded = expandedReplyIds.has(String(c.id));
                const hasReplies = replyCount > 0 || replies.length > 0;

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

            {/* Comment input */}
            <div className="flex items-center gap-2 pt-2">
              <Input
                placeholder="Write a comment..."
                value={currentCommentText}
                onChange={(e) =>
                  setCommentTexts((prev) => ({
                    ...prev,
                    [String(postId)]: e.target.value,
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
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {loading && (
        <div className="text-center py-6 text-gray-500">Loading posts...</div>
      )}
      {!loading && threads.map(renderPostCard)}
      {!loading && threads.length === 0 && (
        <div className="text-center py-10 text-gray-500">No posts yet.</div>
      )}
    </div>
  );
};

export default PostList;


