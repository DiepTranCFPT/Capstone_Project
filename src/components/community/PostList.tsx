import type React from "react";
import { FiMessageSquare } from "react-icons/fi";
import type { Thread } from "~/types/community";

interface PostListProps {
  loading: boolean;
  threads: Thread[];
}

const PostList: React.FC<PostListProps> = ({ loading, threads }) => {
  const renderPostCard = (thread: Thread) => (
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
        <span className="flex items-center gap-1">
          <FiMessageSquare /> {thread.comments}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {loading && (
        <div className="text-center py-6 text-gray-500">Đang tải bài viết...</div>
      )}
      {!loading && threads.map(renderPostCard)}
      {!loading && threads.length === 0 && (
        <div className="text-center py-10 text-gray-500">Chưa có bài viết.</div>
      )}
    </div>
  );
};

export default PostList;


