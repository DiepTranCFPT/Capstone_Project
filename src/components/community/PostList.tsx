import React, { useState } from "react";
import { Modal, Input, Button } from "antd";
import { FiMessageSquare } from "react-icons/fi";
import type { Thread } from "~/types/community";
import usePostComments from "~/hooks/usePostComments";

interface PostListProps {
  loading: boolean;
  threads: Thread[];
}

const PostList: React.FC<PostListProps> = ({ loading, threads }) => {
  const {
    loading: commentLoading,
    postComments,
    fetchPostComments,
    createPostComment,
  } = usePostComments();

  const [activePost, setActivePost] = useState<Thread | null>(null);
  const [commentText, setCommentText] = useState<string>("");

  const handleOpenComments = async (thread: Thread) => {
    setActivePost(thread);
    const key = String(thread.id);
    if (!postComments[key]) {
      await fetchPostComments(thread.id);
    }
  };

  const handleCloseComments = () => {
    setActivePost(null);
    setCommentText("");
  };

  const handleSubmitComment = async () => {
    if (!activePost) return;
    const content = commentText.trim();
    if (!content) return;

    await createPostComment(activePost.id, { content });
    setCommentText("");
  };

  const renderPostCard = (thread: Thread) => {
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
          onClick={() => void handleOpenComments(thread)}
          className="flex items-center gap-1 hover:text-teal-600"
        >
          <FiMessageSquare /> {thread.comments}
        </button>
      </div>
    </div>
    );
  };

  return (
    <div className="space-y-4">
      {loading && (
        <div className="text-center py-6 text-gray-500">Đang tải bài viết...</div>
      )}
      {!loading && threads.map(renderPostCard)}
      {!loading && threads.length === 0 && (
        <div className="text-center py-10 text-gray-500">Chưa có bài viết.</div>
      )}

      <Modal
        open={!!activePost}
        title={
          activePost
            ? `Bình luận cho bài: "${activePost.content.slice(0, 50)}"${
                activePost.content.length > 50 ? "..." : ""
              }`
            : "Bình luận"
        }
        onCancel={handleCloseComments}
        footer={null}
      >
        {activePost && (
          <div className="space-y-3">
            {commentLoading && (
              <div className="text-xs text-gray-400">Đang tải bình luận...</div>
            )}
            {!commentLoading && (() => {
              const raw = postComments[String(activePost.id)];
              const list = Array.isArray(raw) ? raw : [];
              return list.length === 0;
            })() && (
                <div className="text-xs text-gray-400">Chưa có bình luận.</div>
              )}
            {!commentLoading && (() => {
              const raw = postComments[String(activePost.id)];
              const list = Array.isArray(raw) ? raw : [];
              return list;
            })().map((c) => (
                <div key={c.id} className="text-sm text-gray-700">
                  <span className="font-semibold mr-1">
                    {c.authorName || "Người dùng"}:
                  </span>
                  <span>{c.content}</span>
                </div>
              ))}

            <div className="flex items-center gap-2 pt-2">
              <Input
                placeholder="Viết bình luận..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onPressEnter={(e) => {
                  e.preventDefault();
                  void handleSubmitComment();
                }}
              />
              <Button
                type="primary"
                className="bg-teal-500 hover:bg-teal-600"
                onClick={() => void handleSubmitComment()}
              >
                Gửi
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PostList;


