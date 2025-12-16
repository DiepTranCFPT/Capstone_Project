import type React from "react";
import { FiPlus } from "react-icons/fi";

interface PostComposerProps {
  userAvatar: string;
  userDisplayName: string;
  communityName?: string;
  onOpenComposer: () => void;
}

const PostComposer: React.FC<PostComposerProps> = ({
  userAvatar,
  userDisplayName,
  communityName,
  onOpenComposer,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
      <img
        src={userAvatar}
        alt={userDisplayName}
        className="w-10 h-10 rounded-full object-cover bg-gray-200"
      />
      <button
        onClick={onOpenComposer}
        className="flex-1 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full px-4 py-2 text-gray-500"
      >
        Post to {communityName || "community"}...
      </button>
      <button
        onClick={onOpenComposer}
        className="w-10 h-10 flex items-center justify-center bg-teal-500 text-white rounded-full hover:bg-teal-600"
      >
        <FiPlus />
      </button>
    </div>
  );
};

export default PostComposer;


